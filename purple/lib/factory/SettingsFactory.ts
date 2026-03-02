import * as SQLite from 'expo-sqlite';
import { SettingsSQLiteService } from '../services/SettingsSQLiteService';

export class SettingsServiceFactory {
    private static settingsService: SettingsSQLiteService | null = null;
    private static cachedDb: SQLite.SQLiteDatabase | null = null;

    static create(db: SQLite.SQLiteDatabase): SettingsSQLiteService {
        if (this.cachedDb !== null && this.cachedDb !== db) {
            this.settingsService = null;
        }
        this.cachedDb = db;
        if (!this.settingsService) this.settingsService = new SettingsSQLiteService(db);
        return this.settingsService as SettingsSQLiteService;
    }
}
