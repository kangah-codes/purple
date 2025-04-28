import { StartupServiceFactory } from '../factory/StartupFactory';
import { loadFonts } from './fonts';
import { type SQLiteDatabase } from 'expo-sqlite';
import { SettingsServiceFactory } from '../factory/SettingsFactory';
import { initializePreferences } from './preferences';

export async function initializeApp(db: SQLiteDatabase) {
    try {
        // init startup service
        const startupService = await StartupServiceFactory.init(db);
        startupService.registerStartupTask(loadFonts);
        startupService.registerStartupTask(() => initializePreferences(db));

        await startupService.runMigrations(db);
        await startupService.executeStartupTasks();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        throw error;
    }
}
