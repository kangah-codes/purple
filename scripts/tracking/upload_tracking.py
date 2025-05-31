"""
Script to move analytics data from Redis into cold storage in GCS buckets
"""

import redis
import json
import csv
import os
from datetime import datetime
from dateutil import parser
from io import StringIO
from google.cloud import storage

# ----- CONFIG -----
REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD')
KEY_PREFIX = 'analytics:'
GCS_BUCKET_NAME = os.getenv('GCS_BUCKET_NAME')
GCS_FOLDER_FORMAT = '%d-%m-%y'

# Initialize GCS client
storage_client = storage.Client()
bucket = storage_client.bucket(GCS_BUCKET_NAME)

# ----- REDIS CONNECTION -----
r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD, decode_responses=True)

# ----- FETCH ALL TRACKING IDS -----
tracking_keys = [key for key in r.scan_iter(f'{KEY_PREFIX}*')]

# ----- ORGANIZE BY DATE AND TRACKING ID -----
files_by_date = {}
errors_by_date = {}

for key in tracking_keys:
    tracking_id = key.replace(KEY_PREFIX, '')
    entries = r.lrange(key, 0, -1)

    if not entries:
        continue

    for entry in entries:
        try:
            event = json.loads(entry)
            if 'created_at' not in event:
                continue

            dt = parser.isoparse(event['created_at'])
            date_folder = dt.strftime(GCS_FOLDER_FORMAT)

            # Separate errors
            if event.get('type') == 'error':
                if date_folder not in errors_by_date:
                    errors_by_date[date_folder] = {}
                if tracking_id not in errors_by_date[date_folder]:
                    errors_by_date[date_folder][tracking_id] = []
                errors_by_date[date_folder][tracking_id].append(event)
            else:
                if date_folder not in files_by_date:
                    files_by_date[date_folder] = {}
                if tracking_id not in files_by_date[date_folder]:
                    files_by_date[date_folder][tracking_id] = []
                files_by_date[date_folder][tracking_id].append(event)

        except json.JSONDecodeError:
            continue

# ----- FUNCTION TO WRITE EVENTS TO GCS -----
def upload_event_group(date_folder, tracking_data, is_error=False):
    for tracking_id, events in tracking_data.items():
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=events[0].keys())
        writer.writeheader()
        writer.writerows(events)

        subfolder = "errors" if is_error else ""
        blob_path = f"{date_folder}/{subfolder}/{tracking_id}.csv" if subfolder else f"{date_folder}/{tracking_id}.csv"

        blob = bucket.blob(blob_path)
        blob.upload_from_string(output.getvalue(), content_type='text/csv')

        print(f"✅ Uploaded {blob_path} to GCS bucket: {GCS_BUCKET_NAME}")

        # Delete Redis key only after both success & error logs are processed
        redis_key = f"{KEY_PREFIX}{tracking_id}"
        r.delete(redis_key)
        print(f"🗑️ Deleted Redis key: {redis_key}")

# ----- UPLOAD EVENTS TO GCS -----
upload_event_group(files_by_date, files_by_date, is_error=False)
upload_event_group(errors_by_date, errors_by_date, is_error=True)
