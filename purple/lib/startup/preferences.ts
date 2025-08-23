import { usePreferencesStore } from '@/components/Settings/state';
import { type SQLiteDatabase } from 'expo-sqlite';
import { SettingsServiceFactory } from '../factory/SettingsFactory';
import { UserPreferences } from '@/components/Settings/schema';

export async function initializePreferences(db: SQLiteDatabase) {
    try {
        const defaultSettings: UserPreferences = {
            currency: 'USD',
            theme: 'light',
            allowOverdraw: false,
            hideCompletedPlans: true,
            trackUsageStatistics: true,
            sendDiagnosticData: true,
            allowCurrencyConversion: true,
            pushNotificationsEnabled: false,
            dailyNotificationsEnabled: false,
        } as UserPreferences;

        const settingsService = SettingsServiceFactory.create(db);
        await settingsService.ensureDefaults(defaultSettings);

        const transactionTypes = await settingsService.listTransactionTypes();
        const settingsEntries = await Promise.all(
            Object.keys(defaultSettings).map(async (key) => [
                key,
                await settingsService.getWithFallback(
                    key as keyof UserPreferences,
                    defaultSettings[key as keyof UserPreferences],
                ),
            ]),
        );
        const settings = Object.fromEntries(settingsEntries) as UserPreferences;

        usePreferencesStore.getState().setPreferences({
            ...settings,
            customTransactionTypes: transactionTypes,
        });
    } catch (error) {
        console.error('Failed to initialize preferences:', error);
        throw error;
    }
}
