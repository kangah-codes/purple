import * as SQLite from 'expo-sqlite';
import migrations from '../migrations';

export type StartupTask = () => Promise<any>;

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
        const isDev = __DEV__;

        const dbVersion = (await db.getFirstAsync<{ user_version: number }>(
            'PRAGMA user_version',
        )) ?? { user_version: 0 };

        let highestAppliedVersion = dbVersion.user_version;

        for (const { version, sql } of migrations) {
            // in dev mode run all migrations; in production only run new ones
            const shouldRunMigration = isDev || version > dbVersion.user_version;

            if (shouldRunMigration) {
                console.log(`Running migration v${version}${isDev ? ' (dev mode)' : ''}`);

                try {
                    await db.execAsync(sql);
                } catch (error) {
                    if (isDev) {
                        console.warn(
                            `Migration v${version} failed (continuing in dev mode):`,
                            error,
                        );
                    } else {
                        throw error;
                    }
                }

                if (version > highestAppliedVersion) {
                    highestAppliedVersion = version;
                }
            }
        }

        if (highestAppliedVersion > dbVersion.user_version) {
            await db.execAsync(`PRAGMA user_version = ${highestAppliedVersion}`);
        }
    }

    public async executeStartupTasks(): Promise<void> {
        for (const task of this.startupTasks) {
            await task();
        }
    }
}
