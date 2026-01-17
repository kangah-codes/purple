import * as Sentry from '@sentry/react-native';
import 'expo-dev-client';
import * as Updates from 'expo-updates';
import { usePreferencesStore } from '@/components/Settings/state';
import { nativeStorage } from '@/lib/utils/storage';

const UPDATE_CHECK_INTERVAL = 48 * 60 * 60 * 1000; // every 24 hours

export async function loadAndApplyUpdates() {
    if (!__DEV__) {
        const preferences = usePreferencesStore.getState().preferences;

        if (preferences.updateFrequency === 'interval') {
            const lastUpdateCheck = nativeStorage.getItem<string>('lastUpdateCheck');
            const now = Date.now();

            if (lastUpdateCheck && typeof lastUpdateCheck === 'string') {
                const timeSinceLastCheck = now - parseInt(lastUpdateCheck);
                if (timeSinceLastCheck < UPDATE_CHECK_INTERVAL) {
                    return;
                }
            }
        }
        try {
            nativeStorage.setItem('lastUpdateCheck', Date.now().toString());

            // Add timeout to prevent slow network from blocking too long
            const updateCheckPromise = Updates.checkForUpdateAsync();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Update check timeout')), 3000)
            );

            const update = await Promise.race([updateCheckPromise, timeoutPromise]) as any;

            if (update.isAvailable) {
                try {
                    const fetchResult = await Updates.fetchUpdateAsync();

                    if (fetchResult && 'isNew' in fetchResult && fetchResult.isNew) {
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                        await Updates.reloadAsync();
                        return;
                    } else {
                        await Updates.reloadAsync();
                        return;
                    }
                } catch (fetchError) {
                    const errorMessage =
                        fetchError instanceof Error ? fetchError.message : 'Download failed';

                    Sentry.captureException(fetchError, {
                        tags: { component: 'update_fetch' },
                        extra: {
                            updateInfo: update,
                            errorDetails: {
                                message: errorMessage,
                                stack: fetchError instanceof Error ? fetchError.stack : undefined,
                            },
                        },
                    });
                }
            }
        } catch (updateError) {
            const errorMessage =
                updateError instanceof Error ? updateError.message : 'Unknown error';
            Sentry.captureException(updateError, {
                tags: { component: 'update_check' },
                extra: {
                    errorDetails: {
                        message: errorMessage,
                        stack: updateError instanceof Error ? updateError.stack : undefined,
                    },
                },
            });
        }
    }
}
