import React, {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
    AnalyticsConfig,
    AnalyticsTracker,
    ErrorLevel,
    EventProperties,
} from '../services/Analytics';

type AnalyticsContextType = {
    analytics: AnalyticsTracker | null;
    isInitialized: boolean;
    queueSize: number;
    isOnline: boolean;
    sessionId: string | null;
    userId: string | null;
    logEvent: <T extends keyof EventProperties>(
        name: T,
        properties: EventProperties[T] | Record<string, unknown>,
    ) => Promise<void>;
    logError: (
        error: Error | string,
        extraMetadata?: Record<string, unknown>,
        level?: ErrorLevel,
    ) => Promise<void>;
    setUserId: (userId: string | null) => void;
    flush: () => Promise<void>;
    clearQueue: () => Promise<void>;
};

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);
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
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const initializeAnalytics = async () => {
            try {
                const analytics = new AnalyticsTracker({
                    enableDebugLogs: __DEV__,
                    ...config,
                });

                analyticsRef.current = analytics;
                setSessionId(analytics.getSessionId());
                setUserId(analytics.getUserId());
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
    }, []);

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
        if (!autoFlushOnBackground || !analyticsRef.current) return;

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
        [onError],
    );

    const logError = useCallback(
        async (
            error: Error | string,
            extraMetadata?: Record<string, unknown>,
            level: ErrorLevel = 'error',
        ): Promise<void> => {
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
        [onError],
    );

    const handleSetUserId = useCallback((newUserId: string | null) => {
        if (!analyticsRef.current) {
            console.warn('[AnalyticsProvider] Analytics not initialized, user ID not set');
            return;
        }

        analyticsRef.current.setUserId(newUserId);
        setUserId(newUserId);
    }, []);

    const flush = useCallback(async (): Promise<void> => {
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
    }, [onError]);

    const clearQueue = useCallback(async (): Promise<void> => {
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
    }, [onError]);

    const contextValue: AnalyticsContextType = {
        analytics: analyticsRef.current,
        isInitialized,
        queueSize,
        isOnline,
        sessionId,
        userId,
        logEvent: logEvent as any,
        logError,
        setUserId: handleSetUserId,
        flush,
        clearQueue,
    };

    return <AnalyticsContext.Provider value={contextValue}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = (): AnalyticsContextType => {
    const context = useContext(AnalyticsContext);

    if (context === undefined) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider');
    }

    return context;
};

export const useAnalyticsEvent = () => {
    const { logEvent, isInitialized } = useAnalytics();

    return useCallback(
        <T extends keyof EventProperties>(name: T, properties: EventProperties[T]) => {
            if (!isInitialized) {
                console.warn('[useAnalyticsEvent] Analytics not initialized, event ignored:', name);
                return Promise.resolve();
            }
            return logEvent(name, properties);
        },
        [logEvent, isInitialized],
    );
};

export const useAnalyticsError = () => {
    const { logError, isInitialized } = useAnalytics();

    return useCallback(
        (
            error: Error | string,
            extraMetadata?: Record<string, unknown>,
            level: ErrorLevel = 'error',
        ) => {
            if (!isInitialized) {
                console.warn(
                    '[useAnalyticsError] Analytics not initialized, error ignored:',
                    error,
                );
                return Promise.resolve();
            }
            return logError(error, extraMetadata, level);
        },
        [logError, isInitialized],
    );
};

export const useScreenTracking = (
    screenName: string,
    additionalProperties?: Record<string, unknown>,
) => {
    const logEvent = useAnalyticsEvent();

    useEffect(() => {
        logEvent('screen_view', {
            screen: screenName,
            ...additionalProperties,
        }).catch(console.error);
    }, [screenName, logEvent, additionalProperties]);
};

export const useAnalyticsUser = () => {
    const { setUserId, userId, sessionId } = useAnalytics();

    return {
        setUserId,
        userId,
        sessionId,
        isLoggedIn: userId !== null,
    };
};

export const useAnalyticsStatus = () => {
    const { isInitialized, queueSize, isOnline } = useAnalytics();

    return {
        isInitialized,
        queueSize,
        isOnline,
        hasQueuedItems: queueSize > 0,
    };
};

export type { AnalyticsContextType, AnalyticsProviderProps };
