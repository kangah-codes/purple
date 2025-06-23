import { usePreferences } from '@/components/Settings/hooks';
import React, { ReactNode, createContext, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { AnalyticsConfig, AnalyticsTracker, EventProperties } from '../services/AnalyticsService';

type AnalyticsContextType = {
    analytics: AnalyticsTracker | null;
    isInitialized: boolean;
    queueSize: number;
    isOnline: boolean;
    sessionId: string | null;
    uniqueId: string | null;
    logEvent: <T extends keyof EventProperties>(
        name: T,
        properties: EventProperties[T] | Record<string, unknown>,
    ) => Promise<void>;
    flush: () => Promise<void>;
    clearQueue: () => Promise<void>;
    flushQueue: () => Promise<void>;
};

export const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

type AnalyticsProviderProps = {
    children: ReactNode;
    config?: AnalyticsConfig;
    onInitialized?: (analytics: AnalyticsTracker) => void;
    onError?: (error: Error) => void;
    autoFlushOnBackground?: boolean;
};

export function AnalyticsProvider({
    children,
    config = {},
    onInitialized,
    onError,
    autoFlushOnBackground = true,
}: AnalyticsProviderProps) {
    const analyticsRef = useRef<AnalyticsTracker | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [queueSize, setQueueSize] = useState(0);
    const [isOnline, setIsOnline] = useState(true);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [uniqueId, setUniqueId] = useState<string | null>(null);
    const { preferences } = usePreferences();
    const shouldTrackEvents = preferences?.trackUsageStatistics ?? true;
    const shouldSendDiagnostics = preferences?.sendDiagnosticData ?? true;

    useEffect(() => {
        if (!shouldTrackEvents && !shouldSendDiagnostics) {
            // clean up if tracking is disabled
            if (analyticsRef.current) {
                analyticsRef.current.destroy();
                analyticsRef.current = null;
                setIsInitialized(false);
                setSessionId(null);
                setUniqueId(null);
                setQueueSize(0);
            }
            return;
        }

        if (analyticsRef.current) return;

        const initializeAnalytics = async () => {
            try {
                const analytics = new AnalyticsTracker({
                    enableDebugLogs: __DEV__,
                    ...config,
                });

                analyticsRef.current = analytics;

                // wait for init to complete before setting state
                await new Promise((resolve) => setTimeout(resolve, 100));

                setSessionId(analytics.getSessionId());
                setUniqueId(analytics.getUniqueId());
                setIsOnline(analytics.isOnlineStatus());
                setQueueSize(analytics.getQueueSize());
                setIsInitialized(true);

                onInitialized?.(analytics);
            } catch (error) {
                const analyticsError =
                    error instanceof Error ? error : new Error('Analytics initialization failed');
                onError?.(analyticsError);
                console.error('[AnalyticsProvider] Initialization failed:', analyticsError);
            }
        };

        initializeAnalytics();

        return () => {
            if (analyticsRef.current) {
                analyticsRef.current.destroy();
                analyticsRef.current = null;
                setIsInitialized(false);
            }
        };
    }, [shouldTrackEvents, shouldSendDiagnostics, config, onInitialized, onError]);

    useEffect(() => {
        if (!isInitialized || !analyticsRef.current) return;

        const updateStatus = () => {
            if (analyticsRef.current) {
                setQueueSize(analyticsRef.current.getQueueSize());
                setIsOnline(analyticsRef.current.isOnlineStatus());
            }
        };

        updateStatus();

        const interval = setInterval(updateStatus, 5000);
        return () => clearInterval(interval);
    }, [isInitialized]);

    useEffect(() => {
        if (!autoFlushOnBackground || !isInitialized || !analyticsRef.current) return;

        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background' && analyticsRef.current) {
                analyticsRef.current.flush().catch((error) => {
                    onError?.(error instanceof Error ? error : new Error('Auto-flush failed'));
                });
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [isInitialized, autoFlushOnBackground, onError]);

    const logEvent = useCallback(
        async <T extends keyof EventProperties>(
            name: T | string,
            properties?: EventProperties[T] | Record<string, unknown>,
        ): Promise<void> => {
            if (!shouldTrackEvents || !analyticsRef.current) {
                return;
            }

            try {
                await analyticsRef.current.logEvent(name as any, properties);
                setQueueSize(analyticsRef.current.getQueueSize());
            } catch (error) {
                const analyticsError =
                    error instanceof Error ? error : new Error('Failed to log event');
                onError?.(analyticsError);
            }
        },
        [shouldTrackEvents, onError],
    );

    const flush = useCallback(async (): Promise<void> => {
        if (!analyticsRef.current) {
            return;
        }

        try {
            await analyticsRef.current.flush();
            setQueueSize(analyticsRef.current.getQueueSize());
        } catch (error) {
            const analyticsError = error instanceof Error ? error : new Error('Failed to flush');
            onError?.(analyticsError);
        }
    }, [onError]);

    const clearQueue = useCallback(async (): Promise<void> => {
        if (!analyticsRef.current) {
            return;
        }

        try {
            await analyticsRef.current.clearQueue();
            setQueueSize(0);
        } catch (error) {
            const analyticsError =
                error instanceof Error ? error : new Error('Failed to clear queue');
            onError?.(analyticsError);
        }
    }, [onError]);

    const flushQueue = useCallback(async (): Promise<void> => {
        if (!analyticsRef.current) {
            return;
        }

        try {
            await analyticsRef.current.flushQueue();
            setQueueSize(0);
        } catch (error) {
            const analyticsError =
                error instanceof Error ? error : new Error('Failed to clear queue');
            onError?.(analyticsError);
        }
    }, [onError]);

    const contextValue: AnalyticsContextType = {
        analytics: analyticsRef.current,
        isInitialized,
        queueSize,
        isOnline,
        sessionId,
        uniqueId,
        logEvent: logEvent as any,
        flush,
        clearQueue,
        flushQueue,
    };

    return <AnalyticsContext.Provider value={contextValue}>{children}</AnalyticsContext.Provider>;
}

export type { AnalyticsContextType, AnalyticsProviderProps };
