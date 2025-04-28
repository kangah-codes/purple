import * as SQLite from 'expo-sqlite';
import migrations from '../migrations';

export type StartupTask = () => Promise<void>;

export default class StartupService {
    protected db: SQLite.SQLiteDatabase;
    private startupTasks: StartupTask[] = [];

    constructor(protected sqlite: SQLite.SQLiteDatabase) {
        this.db = sqlite;
    }

    public registerStartupTask(task: StartupTask): void {
        this.startupTasks.push(task);
    }

    public async runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
        const dbVersion = (await db.getFirstAsync<{ user_version: number }>(
            'PRAGMA user_version',
        )) ?? { user_version: 0 };

        for (const { version, sql } of migrations) {
            if (version > dbVersion.user_version) {
                console.log(`Running migration v${version}`);
                await db.execAsync(sql);
                await db.execAsync(`PRAGMA user_version = ${version}`);
            }
        }
    }

    public async executeStartupTasks(): Promise<void> {
        await Promise.all(this.startupTasks.map((task) => task()));
    }
}
