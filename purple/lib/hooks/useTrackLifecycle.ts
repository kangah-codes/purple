import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAnalytics } from './useAnalytics';

export function useAppLifecycleEvents() {
    const appState = useRef<AppStateStatus>(AppState.currentState);
    const sessionStartTime = useRef<number | null>(null);
    const currentScreen = useRef<string>('');
    const { logEvent } = useAnalytics();

    useEffect(() => {
        if (AppState.currentState === 'active') {
            sessionStartTime.current = Date.now();
        }

        const subscription = AppState.addEventListener('change', async (nextAppState) => {
            const now = Date.now();
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                sessionStartTime.current = now;

                await logEvent('app_open', {
                    launch_type: appState.current === 'background' ? 'background' : 'warm',
                });
            }

            if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
                const sessionDuration = sessionStartTime.current
                    ? Math.floor((now - sessionStartTime.current) / 1000)
                    : 0;
                await logEvent('app_exit', {
                    screen: currentScreen.current,
                    session_duration: sessionDuration,
                });
                sessionStartTime.current = null;
            }

            appState.current = nextAppState;
        });

        return () => subscription.remove();
    }, [logEvent]);

    const updateCurrentScreen = (screenName: string) => {
        currentScreen.current = screenName;
    };

    const getCurrentSessionDuration = (): number => {
        if (!sessionStartTime.current) return 0;
        return Math.floor((Date.now() - sessionStartTime.current) / 1000);
    };

    return {
        updateCurrentScreen,
        getCurrentSessionDuration,
    };
}
