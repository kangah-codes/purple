import { UserPreferences } from '@/components/Settings/schema';
import { usePreferencesStore } from '@/components/Settings/state';
import { type SQLiteDatabase } from 'expo-sqlite';
import { SettingsServiceFactory } from '../factory/SettingsFactory';

export async function initializePreferences(db: SQLiteDatabase) {
    try {
        const settingsService = SettingsServiceFactory.create(db);
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
            updateFrequency: 'interval',
        } as UserPreferences;
        await settingsService.ensureDefaults(defaultSettings);

        // Single query to fetch all settings at once
        const allSettings = await db.getAllAsync<{ key: string; value: string }>(
            'SELECT key, value FROM settings WHERE key IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            Object.keys(defaultSettings),
        );

        // Build settings object from query results
        const settings: UserPreferences = { ...defaultSettings };
        // Keys that are stored as plain strings (not JSON)
        const stringKeys: (keyof UserPreferences)[] = ['currency', 'theme', 'updateFrequency'];

        for (const row of allSettings) {
            const key = row.key as keyof UserPreferences;
            try {
                // String values should not be JSON.parsed
                if (stringKeys.includes(key)) {
                    settings[key] = row.value as any;
                } else {
                    settings[key] = JSON.parse(row.value) as any;
                }
            } catch {
                settings[key] = defaultSettings[key];
            }
        }

        const transactionTypes = await settingsService.listTransactionTypes();

        usePreferencesStore.getState().setPreferences({
            ...settings,
            customTransactionTypes: transactionTypes,
        });
    } catch (error) {
        console.error('Failed to initialize preferences:', error);
        throw error;
    }
}
