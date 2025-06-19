import { useContext, useCallback, useMemo, useEffect } from 'react';
import { AnalyticsContext, AnalyticsContextType } from '../providers/Analytics';
import { EventProperties, ErrorLevel } from '../services/AnalyticsService';
import { useAppLifecycleEvents } from './useTrackLifecycle';
import { useDeepCompareMemo } from './useDeepCompareMemo';

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
    additionalProperties: Record<string, unknown> = {},
) => {
    const logEvent = useAnalyticsEvent();
    const { updateCurrentScreen } = useAppLifecycleEvents();
    const memoizedProps = useDeepCompareMemo(() => additionalProperties, [additionalProperties]);

    useEffect(() => {
        updateCurrentScreen(screenName);
        logEvent('screen_view', {
            screen: screenName,
            ...memoizedProps,
        }).catch(console.error);
    }, [screenName, logEvent, memoizedProps]);
};

export const useAnalyticsStatus = () => {
    const { isInitialized, queueSize, isOnline } = useAnalytics();

    return useMemo(
        () => ({
            isInitialized,
            queueSize,
            isOnline,
            hasQueuedItems: queueSize > 0,
        }),
        [isInitialized, queueSize, isOnline],
    );
};
