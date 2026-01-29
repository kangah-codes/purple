import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import { NativeStorage } from '../utils/storage';
import { UUID } from '../utils/helpers';
import { AppState } from 'react-native';

type EventName =
    | 'screen_view'
    | 'button_tap'
    | 'error_occurred'
    | 'object_created'
    | 'object_updated'
    | 'app_open'
    | 'app_exit'
    | 'settings_set'
    | string;
type EventProperties = {
    screen_view: {
        screen: string;
        source?: string;
        previous_screen?: string;
    };
    button_tap: {
        button: string;
        screen: string;
        element_id?: string;
    };
    error_occurred: {
        error_type: string;
        context: string;
        severity: 'low' | 'medium' | 'high';
    };
    object_created: {
        object_type: string;
        payload: Record<string, unknown>;
    };
    object_updated: {
        object_type: string;
        payload: Record<string, unknown>;
    };
    app_open: {
        launch_type: 'cold' | 'warm' | 'background';
        from_notification?: boolean;
    };
    app_exit: {
        screen: string;
        session_duration: number;
    };
    settings_set: {
        setting: string;
        old_value: unknown;
        new_value: unknown;
    };
    generic_event: Record<string, unknown>;
};
type BaseEventData = {
    name: string;
    properties?: Record<string, unknown>;
    timestamp: string;
    sessionId: string;
};
type TrackedItem = {
    id: string;
    type: 'event';
    payload: BaseEventData;
    retryCount: number;
    createdAt: string;
};
type AnalyticsConfig = {
    readonly syncEveryMs?: number;
    readonly maxQueueSize?: number;
    readonly maxRetries?: number;
    readonly enableDebugLogs?: boolean;
    readonly endpoint?: string;
    readonly apiKey?: string;
    readonly batchSize?: number;
    readonly flushOnBackground?: boolean;
    readonly timeoutMs?: number;
};
type RequiredAnalyticsConfig = Required<AnalyticsConfig>;
type DeviceMetadata = {
    readonly systemName: string;
    readonly systemVersion: string;
    readonly brand: string;
    readonly model: string;
    readonly deviceId: string;
    readonly appVersion: string;
    readonly buildNumber: string;
    readonly isEmulator: boolean;
    readonly carrier: string;
    readonly uniqueId: string;
};
type BatchPayload = {
    readonly items: TrackedItem[];
    readonly timestamp: string;
    readonly deviceMetadata: Partial<DeviceMetadata>;
};

class AnalyticsError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'NETWORK_ERROR'
            | 'STORAGE_ERROR'
            | 'VALIDATION_ERROR'
            | 'TIMEOUT_ERROR',
        public readonly originalError?: unknown,
    ) {
        super(message);
        this.name = 'AnalyticsError';
    }
}

export class AnalyticsTracker {
    private readonly queue: TrackedItem[] = [];
    private syncing = false;
    private readonly config: RequiredAnalyticsConfig;
    private readonly storageKey = 'analytics-data' as const;
    private readonly sessionId: string;
    private syncTimer?: NodeJS.Timeout;
    private saveTimer?: NodeJS.Timeout;
    private isOnline = true;
    private deviceMetadata: Partial<DeviceMetadata> = {};
    private readonly storage: NativeStorage;
    private uniqueId: string | null = null;
    private pendingSave = false;

    constructor(config: AnalyticsConfig = {}) {
        this.config = {
            syncEveryMs: 30000,
            maxQueueSize: 1000,
            maxRetries: 3,
            enableDebugLogs: false,
            endpoint: `${process.env.EXPO_PUBLIC_API_URL}/tracking`,
            apiKey: process.env.EXPO_PUBLIC_API_KEY as string,
            batchSize: 50,
            flushOnBackground: true,
            timeoutMs: 15000,
            ...config,
        } as const;

        this.sessionId = this.generateSessionId();
        this.storage = NativeStorage.getInstance();
        this.uniqueId = null;

        this.initialize().catch((error) => {
            this.handleError(new AnalyticsError('Initialization failed', 'STORAGE_ERROR', error));
        });
    }

    private async initialize(): Promise<void> {
        try {
            // Restore queue first (synchronous, fast)
            this.restoreQueue();

            // Setup listeners (fast)
            this.setupNetworkListener();
            this.scheduleSync();
            this.setupAppStateHandlers();

            // Load device metadata in background (slow, non-critical)
            this.loadDeviceMetadata().catch((error) => {
                this.handleError(
                    new AnalyticsError('Failed to load device metadata', 'STORAGE_ERROR', error),
                );
            });

            this.log('Analytics tracker initialized');
        } catch (error) {
            throw new AnalyticsError(
                'Failed to initialize analytics tracker',
                'STORAGE_ERROR',
                error,
            );
        }
    }

    public async logEvent<T extends keyof EventProperties>(
        name: T | string,
        properties?: EventProperties[T] | Record<string, unknown>,
    ): Promise<void> {
        // CRITICAL: Make this completely non-blocking by using setImmediate/setTimeout
        // This ensures the event logging never blocks the UI thread
        setImmediate(() => {
            try {
                const event: TrackedItem = {
                    id: this.generateId(),
                    type: 'event',
                    retryCount: 0,
                    createdAt: new Date().toISOString(),
                    payload: {
                        name,
                        properties: {
                            ...this.sanitizeProperties(properties),
                        },
                        timestamp: new Date().toISOString(),
                        sessionId: this.sessionId,
                    },
                };

                this.enqueue(event);
                this.log(`Event logged: ${name}`);
            } catch (error) {
                this.handleError(
                    new AnalyticsError(`Failed to log event: ${name}`, 'VALIDATION_ERROR', error),
                );
            }
        });

        // Return immediately without waiting
        return Promise.resolve();
    }

    public setUniqueId(uniqueId: string): void {
        this.uniqueId = uniqueId;
    }

    public getSessionId(): string {
        return this.sessionId;
    }

    public async flush(): Promise<void> {
        this.log('Manual flush requested');
        await this.syncQueue();
    }

    public async clearQueue(): Promise<void> {
        this.queue.length = 0;
        this.saveQueue();
        this.log('Queue cleared');
    }

    public async flushQueue(): Promise<void> {
        this.queue.length = 0;
        this.dropQueue();
        this.log('Queue dropped');
    }

    public getQueueSize(): number {
        return this.queue.length;
    }

    public getConfig(): Readonly<RequiredAnalyticsConfig> {
        return { ...this.config };
    }

    public isOnlineStatus(): boolean {
        return this.isOnline;
    }

    public getUniqueId(): string | null {
        return this.uniqueId;
    }

    private enqueue(item: TrackedItem): void {
        if (this.queue.length >= this.config.maxQueueSize) {
            this.log('Queue size limit reached, removing oldest items');
            const itemsToKeep = this.config.maxQueueSize - 100;
            this.queue.splice(0, this.queue.length - itemsToKeep);
        }

        this.queue.push(item);

        // Debounce storage writes - save after 1 second of inactivity or when queue is large
        this.debouncedSaveQueue();

        if (this.queue.length >= this.config.batchSize) {
            this.syncQueue().catch((error) => {
                this.handleError(new AnalyticsError('Auto-sync failed', 'NETWORK_ERROR', error));
            });
        }
    }

    private debouncedSaveQueue(): void {
        // If queue is getting full, save immediately
        if (this.queue.length >= this.config.maxQueueSize * 0.8) {
            if (this.saveTimer) clearTimeout(this.saveTimer);
            this.saveQueue();
            return;
        }

        // Otherwise debounce saves to reduce I/O
        this.pendingSave = true;
        if (this.saveTimer) clearTimeout(this.saveTimer);

        this.saveTimer = setTimeout(() => {
            if (this.pendingSave) {
                this.saveQueue();
                this.pendingSave = false;
            }
        }, 1000); // Save after 1 second of inactivity
    }

    private async syncQueue(): Promise<void> {
        if (this.syncing || this.queue.length === 0 || !this.isOnline) {
            return;
        }

        this.syncing = true;
        this.log(`Starting sync with ${this.queue.length} items`);

        try {
            const batches = this.createBatches(this.queue, this.config.batchSize);
            const failedItems: TrackedItem[] = [];

            for (const batch of batches) {
                try {
                    const success = await this.sendBatch(batch);
                    if (success) {
                        batch.forEach((item) => {
                            const index = this.queue.findIndex(
                                (queueItem) => queueItem.id === item.id,
                            );
                            if (index !== -1) {
                                this.queue.splice(index, 1);
                            }
                        });
                    } else {
                        batch.forEach((item) => {
                            item.retryCount++;
                            if (item.retryCount < this.config.maxRetries) {
                                failedItems.push(item);
                            } else {
                                this.log(`Item ${item.id} exceeded max retries, dropping`);
                            }
                        });
                    }
                } catch (error) {
                    this.handleError(
                        new AnalyticsError('Batch send failed', 'NETWORK_ERROR', error),
                    );
                    batch.forEach((item) => failedItems.push(item));
                }
            }

            this.queue.length = 0;
            this.queue.push(...failedItems);

            this.saveQueue();
        } catch (error) {
            this.handleError(new AnalyticsError('Sync queue failed', 'NETWORK_ERROR', error));
        } finally {
            this.syncing = false;
        }
    }

    private async sendBatch(batch: readonly TrackedItem[]): Promise<boolean> {
        try {
            const payload: BatchPayload = {
                items: batch as TrackedItem[],
                timestamp: new Date().toISOString(),
                deviceMetadata: this.deviceMetadata,
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

            try {
                this.log(`Sending batch with ${batch.length} events to ${this.config.endpoint}`);

                const response = await fetch('https://api.trypurpleapp.site/api/v1/tracking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': this.getUserAgent(),
                        'x-api-key': this.config.apiKey,
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    this.log(`Batch sent successfully (${batch.length} items)`);
                    return true;
                } else {
                    const errorText = await response.text().catch(() => 'Unknown error');
                    this.log(
                        `Batch send failed: ${response.status} ${response.statusText} - ${errorText}`,
                    );
                    return false;
                }
            } catch (fetchError) {
                clearTimeout(timeoutId);
                if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                    throw new AnalyticsError('Request timeout', 'TIMEOUT_ERROR', fetchError);
                }
                throw fetchError;
            }
        } catch (error) {
            this.handleError(new AnalyticsError('Send batch failed', 'NETWORK_ERROR', error));
            return false;
        }
    }

    private createBatches<T>(array: readonly T[], batchSize: number): T[][] {
        const batches: T[][] = [];
        for (let i = 0; i < array.length; i += batchSize) {
            batches.push(array.slice(i, i + batchSize));
        }
        return batches;
    }

    private saveQueue(): void {
        try {
            this.storage.setItem(this.storageKey, this.queue);
        } catch (error) {
            this.handleError(new AnalyticsError('Failed to save queue', 'STORAGE_ERROR', error));
        }
    }

    private dropQueue(): void {
        try {
            this.storage.removeItem(this.storageKey);
        } catch (error) {
            this.handleError(new AnalyticsError('Failed to drop queue', 'STORAGE_ERROR', error));
        }
    }

    private restoreQueue(): void {
        try {
            const stored = this.storage.getItem<TrackedItem[]>(this.storageKey);
            if (stored && Array.isArray(stored)) {
                const validItems = stored.filter(this.isValidTrackedItem);
                this.queue.push(...validItems);
                this.log(`Restored ${validItems.length} items from storage`);

                if (validItems.length !== stored.length) {
                    this.log(`Filtered out ${stored.length - validItems.length} invalid items`);
                }
            }
        } catch (error) {
            this.handleError(new AnalyticsError('Failed to restore queue', 'STORAGE_ERROR', error));
            this.queue.length = 0;
        }
    }

    private isValidTrackedItem(item: unknown): item is TrackedItem {
        if (typeof item !== 'object' || item === null) return false;

        const candidate = item as Record<string, unknown>;

        return (
            typeof candidate.id === 'string' &&
            (candidate.type === 'event' || candidate.type === 'error') &&
            typeof candidate.payload === 'object' &&
            candidate.payload !== null &&
            typeof candidate.retryCount === 'number'
        );
    }

    private scheduleSync(): void {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }

        this.syncTimer = setInterval(() => {
            this.syncQueue().catch((error) => {
                this.handleError(
                    new AnalyticsError('Scheduled sync failed', 'NETWORK_ERROR', error),
                );
            });
        }, this.config.syncEveryMs);
    }

    private async loadDeviceMetadata(): Promise<void> {
        try {
            this.deviceMetadata = {
                systemName: DeviceInfo.getSystemName(),
                systemVersion: DeviceInfo.getSystemVersion(),
                brand: DeviceInfo.getBrand(),
                model: DeviceInfo.getModel(),
                deviceId: DeviceInfo.getDeviceId(),
                appVersion: DeviceInfo.getVersion(),
                buildNumber: DeviceInfo.getBuildNumber(),
                isEmulator: await DeviceInfo.isEmulator(),
                carrier: await DeviceInfo.getCarrier(),
                uniqueId: await DeviceInfo.getUniqueId(),
            };
            this.uniqueId = this.deviceMetadata.uniqueId || null;
        } catch (error) {
            this.handleError(
                new AnalyticsError('Failed to load device metadata', 'STORAGE_ERROR', error),
            );
        }
    }

    private setupNetworkListener(): void {
        NetInfo.addEventListener((state: NetInfoState) => {
            const wasOnline = this.isOnline;
            this.isOnline = state.isConnected ?? false;

            if (!wasOnline && this.isOnline) {
                this.log('Network reconnected, attempting sync');
                this.syncQueue().catch((error) => {
                    this.handleError(
                        new AnalyticsError('Network reconnect sync failed', 'NETWORK_ERROR', error),
                    );
                });
            }
        });
    }

    private setupAppStateHandlers(): void {
        if (this.config.flushOnBackground) {
            AppState.addEventListener('change', (nextAppState) => {
                if (nextAppState === 'background') {
                    this.flush().catch((error) => this.handleError(error));
                }
            });
        }
    }

    private sanitizeProperties(props?: Record<string, unknown>): Record<string, unknown> {
        if (!props) return {};

        const sanitized: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(props)) {
            if (typeof value === 'function' || value === undefined) continue;

            try {
                JSON.stringify(value);
                sanitized[key] = value;
            } catch {
                sanitized[key] = String(value);
            }
        }

        return sanitized;
    }

    private generateId(): string {
        return UUID();
    }

    private generateSessionId(): string {
        return UUID();
    }

    private getUserAgent(): string {
        const {
            appVersion = 'unknown',
            systemName = 'unknown',
            systemVersion = 'unknown',
        } = this.deviceMetadata;
        return `Purple/${appVersion} (${systemName} ${systemVersion})`;
    }

    private log(message: string): void {
        if (this.config.enableDebugLogs) {
            console.log(`[Analytics] ${message}`);
        }
    }

    private handleError(error: AnalyticsError): void {
        this.log(`Error: ${error.message} (${error.code})`);
        if (this.config.enableDebugLogs && error.originalError) {
            console.error('[Analytics] Original error:', error.originalError);
        }
    }

    public destroy(): void {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = undefined;
        }
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
            this.saveTimer = undefined;
        }
        // Save any pending events before destroying
        if (this.pendingSave && this.queue.length > 0) {
            this.saveQueue();
        }
        this.log('Analytics tracker destroyed');
    }
}

export type { EventName, EventProperties, AnalyticsConfig, DeviceMetadata, AnalyticsError };
