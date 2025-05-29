import { type SQLiteDatabase } from 'expo-sqlite';
import { StartupServiceFactory } from '../factory/StartupFactory';
import { loadFonts } from './fonts';
import { initializePreferences } from './preferences';
import CurrencyService from '../services/CurrencyService';

export async function initializeApp(db: SQLiteDatabase) {
    try {
        // init startup service
        const startupService = await StartupServiceFactory.init(db);
        const currencyService = CurrencyService.getInstance();

        // load startup tasks here
        startupService.registerStartupTask(loadFonts);
        startupService.registerStartupTask(() => initializePreferences(db));
        startupService.registerStartupTask(() => currencyService.fetchExchangeRates('ghs'));

        await startupService.runMigrations(db);
        await startupService.executeStartupTasks();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        throw error;
    }
}
