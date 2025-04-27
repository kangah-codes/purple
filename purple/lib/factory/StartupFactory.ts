import * as SQLite from 'expo-sqlite';
import StartupService, { StartupTask } from '../services/StartupService';

export class StartupServiceFactory {
    private static startupService: StartupService | null = null;
    private static pendingTasks: StartupTask[] = [];

    static registerTask(task: StartupTask): void {
        if (this.startupService) {
            this.startupService.registerStartupTask(task);
        } else {
            this.pendingTasks.push(task);
        }
    }

    static init(db: SQLite.SQLiteDatabase) {
        if (!this.startupService) {
            this.startupService = new StartupService(db);

            this.pendingTasks.forEach((task) => {
                this.startupService!.registerStartupTask(task);
            });
            this.pendingTasks = [];
        }

        return this.startupService.initialise(db);
    }

    static getInstance(): StartupService {
        if (!this.startupService) {
            throw new Error('StartupService not initialized');
        }
        return this.startupService;
    }
}
