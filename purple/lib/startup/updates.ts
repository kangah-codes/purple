import * as Sentry from '@sentry/react-native';
import 'expo-dev-client';
import * as Updates from 'expo-updates';

export async function loadAndApplyUpdates() {
    if (!__DEV__) {
        try {
            const update = await Updates.checkForUpdateAsync();

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
