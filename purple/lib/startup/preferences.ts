import { usePreferencesStore } from '@/components/Settings/state';
import { type SQLiteDatabase } from 'expo-sqlite';
import { SettingsServiceFactory } from '../factory/SettingsFactory';

export async function initializePreferences(db: SQLiteDatabase) {
    try {
        const settingsService = SettingsServiceFactory.create(db);
        await settingsService.ensureDefaults({
            currency: 'GHS',
            theme: 'light',
            allowOverdraw: false,
            hideCompletedPlans: true,
        });

        const [transactionTypes, allowOverdraw] = await Promise.all([
            settingsService.listTransactionTypes(),
            settingsService.getWithFallback('allowOverdraw', false),
        ]);

        usePreferencesStore.getState().setPreferences({
            customTransactionTypes: transactionTypes,
            allowOverdraw: allowOverdraw,
        });
    } catch (error) {
        console.error('Failed to initialize preferences:', error);
        throw error;
    }
}
