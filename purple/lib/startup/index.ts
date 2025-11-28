import { type SQLiteDatabase } from 'expo-sqlite';
import { StartupServiceFactory } from '../factory/StartupFactory';
import { loadFonts } from './fonts';
import { initializePreferences } from './preferences';
import { processRecurringTransactions } from './transaction';
import { loadAndApplyUpdates } from './updates';

export async function initializeApp(db: SQLiteDatabase) {
    console.log('[InitializeApp] Starting app initialization');
    try {
        // init startup service
        console.log('[InitializeApp] Creating startup service');
        const startupService = await StartupServiceFactory.init(db);
        // const currencyService = CurrencyService.getInstance();

        // load startup tasks here
        console.log('[InitializeApp] Registering startup tasks');
        startupService.registerStartupTask({ task: loadFonts, name: 'Load Fonts', timeout: 5000 });
        startupService.registerStartupTask({
            task: () => initializePreferences(db),
            name: 'Initialize Preferences',
            timeout: 3000,
        });
        // startupService.registerStartupTask({ task: currencyService.fetchExchangeRates, name: 'Fetch Exchange Rates', timeout: 5000 });
        startupService.registerStartupTask({
            task: () => processRecurringTransactions(db),
            name: 'Process Recurring Transactions',
            timeout: 10000,
        });
        startupService.registerStartupTask({
            task: () => loadAndApplyUpdates(),
            name: 'Load and Apply Updates',
            timeout: 5000,
        });
        console.log('[InitializeApp] Registered 4 startup tasks');

        console.log('[InitializeApp] Running migrations');
        await startupService.runMigrations(db);
        console.log('[InitializeApp] Migrations complete');

        console.log('[InitializeApp] Executing startup tasks');
        await startupService.executeStartupTasks();
        console.log('[InitializeApp] App initialization complete');
    } catch (error) {
        console.error('[InitializeApp] Failed to initialize app:', error);
        throw error;
    }
}
