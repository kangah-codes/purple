import { usePreferencesStore } from '@/components/Settings/state';
import { type SQLiteDatabase } from 'expo-sqlite';
import { SettingsServiceFactory } from '../factory/SettingsFactory';
import { UserPreferences } from '@/components/Settings/schema';

export async function initializePreferences(db: SQLiteDatabase) {
    try {
        const defaultSettings: UserPreferences = {
            currency: 'GHS',
            theme: 'light',
            allowOverdraw: false,
            hideCompletedPlans: true,
            trackUsageStatistics: true,
            sendDiagnosticData: true,
            allowCurrencyConversion: true,
        } as UserPreferences;

        const settingsService = SettingsServiceFactory.create(db);
        await settingsService.ensureDefaults(defaultSettings);

        const [
            transactionTypes,
            allowOverdraw,
            hideCompletedPlans,
            trackUsageStatistics,
            sendDiagnosticData,
            allowCurrencyConversion,
        ] = await Promise.all([
            settingsService.listTransactionTypes(),
            settingsService.getWithFallback('allowOverdraw', defaultSettings.allowOverdraw),
            settingsService.getWithFallback(
                'hideCompletedPlans',
                defaultSettings.hideCompletedPlans,
            ),
            settingsService.getWithFallback(
                'trackUsageStatistics',
                defaultSettings.trackUsageStatistics,
            ),
            settingsService.getWithFallback(
                'sendDiagnosticData',
                defaultSettings.sendDiagnosticData,
            ),
            settingsService.getWithFallback(
                'allowCurrencyConversion',
                defaultSettings.allowCurrencyConversion,
            ),
        ]);

        usePreferencesStore.getState().setPreferences({
            customTransactionTypes: transactionTypes,
            allowOverdraw,
            hideCompletedPlans,
            trackUsageStatistics,
            sendDiagnosticData,
            allowCurrencyConversion,
        });
    } catch (error) {
        console.error('Failed to initialize preferences:', error);
        throw error;
    }
}
