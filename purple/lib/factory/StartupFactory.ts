import * as SQLite from 'expo-sqlite';
import StartupService from '../services/StartupService';

export class StartupServiceFactory {
    private static startupService: StartupService | null = null;

    static async init(db: SQLite.SQLiteDatabase) {
        if (!this.startupService) {
            this.startupService = new StartupService(db);
        }

        return this.startupService;
    }

    static getInstance(): StartupService {
        if (!this.startupService) {
            throw new Error('StartupService not initialized');
        }
        return this.startupService;
    }
}
