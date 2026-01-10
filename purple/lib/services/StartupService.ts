import * as SQLite from 'expo-sqlite';
import migrations from '../migrations';

export type StartupTask = () => Promise<any>;

export interface StartupTaskConfig {
    task: StartupTask;
    timeout?: number;
    name?: string;
}

export default class StartupService {
    protected db: SQLite.SQLiteDatabase;
    private startupTasks: StartupTaskConfig[] = [];

    constructor(protected sqlite: SQLite.SQLiteDatabase) {
        this.db = sqlite;
    }

    public registerStartupTask(task: StartupTask | StartupTaskConfig, timeout?: number): void {
        if (typeof task === 'function') {
            this.startupTasks.push({ task, timeout });
        } else {
            this.startupTasks.push(task);
        }
    }

    public async runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
        const isDev = __DEV__;

        const dbVersion = (await db.getFirstAsync<{ user_version: number }>(
            'PRAGMA user_version',
        )) ?? { user_version: 0 };

        console.info(`[StartupService] Current DB version: v${dbVersion.user_version}`);

        let highestAppliedVersion = dbVersion.user_version;

        for (const { version, sql } of migrations) {
            // in dev mode run all migrations; in production only run new ones
            const shouldRunMigration = isDev || version > dbVersion.user_version;

            if (shouldRunMigration) {
                console.log(
                    `[StartupService] Running migration v${version}${isDev ? ' (dev mode)' : ''}`,
                );

                try {
                    await db.execAsync(sql);
                } catch (error) {
                    if (isDev) {
                        console.warn(
                            `[StartupService] Migration v${version} failed (continuing in dev mode):`,
                            error,
                        );
                    } else {
                        // ignore this for now. this is just to fix a version mismatch error in the build
                        throw error;
                    }
                }

                if (version > highestAppliedVersion) {
                    highestAppliedVersion = version;
                }
            }
        }

        if (highestAppliedVersion > dbVersion.user_version) {
            // await db.execAsync(`PRAGMA user_version = ${highestAppliedVersion}`);
            await db.execAsync(`PRAGMA user_version = ${3}`);
        }
    }

    public async executeStartupTasks(): Promise<void> {
        console.log(`[StartupService] Executing ${this.startupTasks.length} startup tasks`);
        for (let i = 0; i < this.startupTasks.length; i++) {
            const taskConfig = this.startupTasks[i];
            const taskName = taskConfig.name || `Task ${i + 1}`;
            const timeout = taskConfig.timeout || 10000;

            console.log(
                `[StartupService] Running ${taskName} (${i + 1}/${
                    this.startupTasks.length
                }) with ${timeout}ms timeout`,
            );

            try {
                await Promise.race([
                    taskConfig.task(),
                    new Promise((_, reject) =>
                        setTimeout(
                            () => reject(new Error(`Task timed out after ${timeout}ms`)),
                            timeout,
                        ),
                    ),
                ]);
                console.log(`[StartupService] ${taskName} completed successfully`);
            } catch (error) {
                console.error(`[StartupService] ${taskName} failed:`, error);
                // Don't throw - continue with next task
            }
        }
        console.log('[StartupService] All startup tasks completed');
    }
}
