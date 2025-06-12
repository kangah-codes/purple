"""
Script to move analytics data from Redis into cold storage in GCS buckets
Supports both CSV and JSON output formats via adapters
"""

import redis
import json
import csv
import os
import logging
from datetime import datetime
from dateutil import parser
from io import StringIO
from google.cloud import storage
from google.oauth2 import service_account
from dotenv import load_dotenv
from abc import ABC, abstractmethod

# ----- SETUP LOGGING -----
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)

# ----- LOAD ENV -----
load_dotenv()
logging.info("Loaded environment variables from .env")

# ----- CONFIG -----
REDIS_HOST = os.getenv('REDIS_HOST', "")
REDIS_PORT = int(os.getenv('REDIS_PORT') or 6379)
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD')
REDIS_USERNAME = os.getenv('REDIS_USERNAME')
REDIS_URL = os.getenv("REDIS_URL", "")
KEY_PREFIX = 'analytics:'
GCS_BUCKET_NAME = os.getenv('GCS_BUCKET_NAME')
GCS_FOLDER_FORMAT = '%d-%m-%y'
OUTPUT_FORMAT = os.getenv('OUTPUT_FORMAT', 'json').lower()

logging.debug(f"Redis URL: {REDIS_URL}")
logging.debug(f"GCS Bucket: {GCS_BUCKET_NAME}")
logging.debug(f"Output Format: {OUTPUT_FORMAT}")

# ----- STORAGE ADAPTERS -----


class StorageAdapter(ABC):
    """Abstract base class for storage adapters"""

    @abstractmethod
    def get_file_extension(self):
        """Return the file extension for this format"""
        pass

    @abstractmethod
    def get_content_type(self):
        """Return the MIME content type for this format"""
        pass

    @abstractmethod
    def serialize_events(self, events):
        """Convert events list to string format for upload"""
        pass

    @abstractmethod
    def process_event(self, event):
        """Process individual event for this format"""
        pass


class CSVAdapter(StorageAdapter):
    """Adapter for CSV format storage"""

    def get_file_extension(self):
        return 'csv'

    def get_content_type(self):
        return 'text/csv'

    def flatten_dict(self, d, parent_key='', sep='_'):
        """Flatten nested dictionaries for CSV compatibility"""
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(self.flatten_dict(v, new_key, sep=sep).items())
            elif isinstance(v, list):
                # Convert lists to JSON strings for CSV
                items.append((new_key, json.dumps(v)))
            else:
                items.append((new_key, v))
        return dict(items)

    def process_event(self, event):
        """Flatten event for CSV compatibility"""
        return self.flatten_dict(event)

    def serialize_events(self, events):
        """Convert events to CSV format"""
        if not events:
            return ""

        # get unique field names
        all_fieldnames = set()
        for event in events:
            all_fieldnames.update(event.keys())

        fieldnames = sorted(list(all_fieldnames))

        output = StringIO()
        writer = csv.DictWriter(
            output, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()

        # ensure events have all fields
        for event in events:
            row = {field: event.get(field, None) for field in fieldnames}
            writer.writerow(row)

        return output.getvalue()


class JSONAdapter(StorageAdapter):
    """Adapter for JSON format storage"""

    def get_file_extension(self):
        return 'json'

    def get_content_type(self):
        return 'application/json'

    def process_event(self, event):
        """Keep event structure intact for JSON"""
        return event

    def serialize_events(self, events):
        """Convert events to JSON format"""
        return json.dumps(events, indent=2, default=str)

# ----- ADAPTER FACTORY -----


def get_storage_adapter(format_type):
    """Factory function to get the appropriate storage adapter"""
    adapters = {
        'csv': CSVAdapter(),
        'json': JSONAdapter()
    }

    if format_type not in adapters:
        raise ValueError(
            f"Unsupported format: {format_type}. Available formats: {list(adapters.keys())}")

    return adapters[format_type]


# ----- INITIALIZE COMPONENTS -----
# init storage adapter
try:
    storage_adapter = get_storage_adapter(OUTPUT_FORMAT)
    logging.info(f"✅ Initialized {OUTPUT_FORMAT.upper()} storage adapter")
except ValueError as e:
    logging.error(f"❌ {e}")
    raise

# init gcs client
try:
    # credentials = service_account.Credentials.from_service_account_file(
    #     '/home/gyimihendrix/Downloads/purple-json-auth.json')
    storage_client = storage.Client()
    bucket = storage_client.bucket(GCS_BUCKET_NAME)
    logging.info("✅ Initialized GCS client")
except Exception as e:
    logging.exception("❌ Failed to initialize GCS client")
    raise

# connect to Redis
try:
    r = redis.Redis(
        host=os.getenv("REDIS_HOST"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        username=os.getenv("REDIS_USERNAME"),
        password=os.getenv("REDIS_PASSWORD"),
        decode_responses=True
    )
    r.ping()
    logging.info("✅ Connected to Redis successfully")
except redis.exceptions.ConnectionError as e:
    logging.exception("❌ Redis connection failed")
    raise

# ----- FETCH ALL TRACKING IDS -----
logging.info("🔍 Fetching tracking keys from Redis...")
try:
    tracking_keys = list(r.scan_iter(f'{KEY_PREFIX}*'))
    logging.info(f"📦 Found {len(tracking_keys)} tracking keys")
except Exception as e:
    logging.exception("❌ Failed to fetch tracking keys")
    raise

# ----- ORGANIZE BY DATE AND TRACKING ID -----
files_by_date = {}
errors_by_date = {}
# keep track of original Redis keys for deletion
redis_key_mapping = {}  # tracking_id -> original_redis_key

logging.info("🧮 Organizing events by date...")
for key in tracking_keys:
    # extract tracking keys: analytics:sessionId:trackingId & remove prefix
    full_key = key.replace(KEY_PREFIX, '')

    # split by ':' and take the trackingId
    if ':' in full_key:
        tracking_id = full_key.split(':')[-1]
    else:
        # fallback if key isnt in expected format
        tracking_id = full_key

    # store the mapping of tracking_id to original redis key
    redis_key_mapping[tracking_id] = key

    logging.debug(f"Processing key: {key} -> tracking_id: {tracking_id}")

    try:
        entries = r.lrange(key, 0, -1)
        if not entries:
            logging.debug(f"🚫 No entries for {key}")
            continue

        for entry in entries:
            try:
                event = json.loads(entry)
                timestamp = None

                if 'event' in event and 'timestamp' in event['event']:
                    timestamp = event['event']['timestamp']
                elif 'timestamp' in event:
                    timestamp = event['timestamp']

                if not timestamp:
                    logging.warning(
                        f"⚠️  Missing timestamp in event for {tracking_id}")
                    continue

                dt = parser.isoparse(timestamp)
                date_folder = dt.strftime(GCS_FOLDER_FORMAT)

                # check if event is error
                is_error = False
                if 'event' in event and 'type' in event['event']:
                    is_error = event['event']['type'] == 'error'
                elif 'type' in event:
                    is_error = event['type'] == 'error'

                processed_event = storage_adapter.process_event(event)
                group = errors_by_date if is_error else files_by_date

                if date_folder not in group:
                    group[date_folder] = {}
                if tracking_id not in group[date_folder]:
                    group[date_folder][tracking_id] = []
                group[date_folder][tracking_id].append(processed_event)

            except json.JSONDecodeError:
                logging.warning(f"⚠️ Skipping invalid JSON for {tracking_id}")
            except Exception as e:
                logging.warning(
                    f"⚠️ Error processing event for {tracking_id}: {str(e)}")
    except Exception:
        logging.exception(f"❌ Failed processing key: {key}")

# ----- FUNCTION TO WRITE EVENTS TO GCS -----


def upload_event_group(name, tracking_data, is_error=False):
    logging.info(
        f"🚀 Uploading {name} events to GCS as {OUTPUT_FORMAT.upper()} ({'errors' if is_error else 'normal'})")

    for date_folder, trackings in tracking_data.items():
        for tracking_id, events in trackings.items():
            try:
                if not events:
                    logging.warning(
                        f"⚠️ No events to upload for {tracking_id}")
                    continue

                serialized_data = storage_adapter.serialize_events(events)

                if not serialized_data:
                    logging.warning(f"⚠️ No data to upload for {tracking_id}")
                    continue

                subfolder = "errors" if is_error else ""
                filename = f"{tracking_id}.{storage_adapter.get_file_extension()}"
                blob_path = f"{date_folder}/{subfolder}/{filename}" if subfolder else f"{date_folder}/{filename}"
                blob = bucket.blob(blob_path)
                blob.upload_from_string(
                    serialized_data,
                    content_type=storage_adapter.get_content_type()
                )

                logging.info(
                    f"✅ Uploaded {blob_path} with {len(events)} events ({OUTPUT_FORMAT.upper()})")

                original_redis_key = redis_key_mapping.get(tracking_id)
                if original_redis_key:
                    r.delete(original_redis_key)
                    logging.info(f"🗑️ Deleted Redis key: {original_redis_key}")
                else:
                    logging.warning(
                        f"⚠️ Could not find original Redis key for tracking_id: {tracking_id}")

            except Exception:
                logging.exception(
                    f"❌ Failed to upload or clean up for tracking ID: {tracking_id}")


# ----- UPLOAD EVENTS TO GCS -----
upload_event_group("normal", files_by_date, is_error=False)
upload_event_group("error", errors_by_date, is_error=True)

logging.info(f"🎉 All uploads complete in {OUTPUT_FORMAT.upper()} format")
