import { usePreferencesStore } from '@/components/Settings/state';
import { type SQLiteDatabase } from 'expo-sqlite';
import { SettingsServiceFactory } from '../factory/SettingsFactory';

export async function initializePreferences(db: SQLiteDatabase) {
    try {
        const settingsService = SettingsServiceFactory.create(db);
        const transactionTypes = await settingsService.listTransactionTypes();

        usePreferencesStore.getState().setPreferences({
            customTransactionTypes: transactionTypes,
        });

        await settingsService.ensureDefaults(usePreferencesStore.getState().preferences);
    } catch (error) {
        console.error('Failed to initialize preferences:', error);
        throw error;
    }
}
