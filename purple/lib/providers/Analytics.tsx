import { usePreferences } from '@/components/Settings/hooks';
import React, { ReactNode, createContext, useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
    AnalyticsConfig,
    AnalyticsTracker,
    ErrorLevel,
    EventProperties,
} from '../services/AnalyticsService';

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
    logError: (
        error: Error | string,
        extraMetadata?: Record<string, unknown>,
        level?: ErrorLevel,
    ) => Promise<void>;
    flush: () => Promise<void>;
    clearQueue: () => Promise<void>;
};

export const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);
type AnalyticsProviderProps = {
    children: ReactNode;
    config?: AnalyticsConfig;
    onInitialized?: (analytics: AnalyticsTracker) => void;
    onError?: (error: Error) => void;
    autoFlushOnBackground?: boolean;
};

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
    children,
    config = {},
    onInitialized,
    onError,
    autoFlushOnBackground = true,
}) => {
    const analyticsRef = useRef<AnalyticsTracker | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [queueSize, setQueueSize] = useState(0);
    const [isOnline, setIsOnline] = useState(true);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [uniqueId, setUniqueId] = useState<string | null>(null);
    const { preferences } = usePreferences();

    const shouldTrackEvents = preferences?.trackUsageStatistics ?? false;
    const shouldSendDiagnostics = preferences?.sendDiagnosticData ?? false;

    useEffect(() => {
        if (!shouldTrackEvents && !shouldSendDiagnostics) return;

        const initializeAnalytics = async () => {
            try {
                const analytics = new AnalyticsTracker({
                    enableDebugLogs: __DEV__,
                    ...config,
                });

                analyticsRef.current = analytics;
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
            }
        };
    }, [shouldTrackEvents, shouldSendDiagnostics]);

    useEffect(() => {
        if (!analyticsRef.current) return;

        const updateQueueSize = () => {
            if (analyticsRef.current) {
                setQueueSize(analyticsRef.current.getQueueSize());
                setIsOnline(analyticsRef.current.isOnlineStatus());
            }
        };

        const interval = setInterval(updateQueueSize, 5000);

        return () => clearInterval(interval);
    }, [isInitialized]);

    useEffect(() => {
        if (!autoFlushOnBackground || !analyticsRef.current || !shouldTrackEvents) return;

        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'background') {
                analyticsRef.current!.flush().catch((error) => {
                    onError?.(error instanceof Error ? error : new Error('Auto-flush failed'));
                });
            }
        });

        return () => subscription.remove();
    }, [isInitialized, autoFlushOnBackground, shouldTrackEvents]);

    const logEvent = useCallback(
        async <T extends keyof EventProperties>(
            name: T | string,
            properties?: EventProperties[T] | Record<string, unknown>,
        ): Promise<void> => {
            if (!shouldTrackEvents || !analyticsRef.current) return;

            if (!analyticsRef.current) {
                console.warn('[AnalyticsProvider] Analytics not initialized, event ignored:', name);
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
        [onError, shouldTrackEvents],
    );

    const logError = useCallback(
        async (
            error: Error | string,
            extraMetadata?: Record<string, unknown>,
            level: ErrorLevel = 'error',
        ): Promise<void> => {
            if (!shouldSendDiagnostics || !analyticsRef.current) return;

            if (!analyticsRef.current) {
                console.warn(
                    '[AnalyticsProvider] Analytics not initialized, error ignored:',
                    error,
                );
                return;
            }

            try {
                await analyticsRef.current.logError(error, extraMetadata, level);
                setQueueSize(analyticsRef.current.getQueueSize());
            } catch (err) {
                const analyticsError =
                    err instanceof Error ? err : new Error('Failed to log error');
                onError?.(analyticsError);
            }
        },
        [onError, shouldSendDiagnostics],
    );

    const flush = useCallback(async (): Promise<void> => {
        if (!shouldTrackEvents || !analyticsRef.current) return;

        if (!analyticsRef.current) {
            console.warn('[AnalyticsProvider] Analytics not initialized, flush ignored');
            return;
        }

        try {
            await analyticsRef.current.flush();
            setQueueSize(analyticsRef.current.getQueueSize());
        } catch (error) {
            const analyticsError = error instanceof Error ? error : new Error('Failed to flush');
            onError?.(analyticsError);
        }
    }, [onError, shouldTrackEvents]);

    const clearQueue = useCallback(async (): Promise<void> => {
        if (!shouldTrackEvents || !analyticsRef.current) return;

        if (!analyticsRef.current) {
            console.warn('[AnalyticsProvider] Analytics not initialized, clear ignored');
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
    }, [onError, shouldTrackEvents]);

    const contextValue: AnalyticsContextType = {
        analytics: analyticsRef.current,
        isInitialized,
        queueSize,
        isOnline,
        sessionId,
        uniqueId,
        logEvent: logEvent as any,
        logError,
        flush,
        clearQueue,
    };

    return <AnalyticsContext.Provider value={contextValue}>{children}</AnalyticsContext.Provider>;
};

export type { AnalyticsContextType, AnalyticsProviderProps };
