import migrations_v1 from '../migrations';
import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    const DATABASE_VERSION = 2;
    const dbVersion = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    let currentDBVersion = dbVersion ? dbVersion.user_version : 0;

    if (currentDBVersion >= DATABASE_VERSION) {
        return;
    }

    console.log(
        `db version ${DATABASE_VERSION}\nuser_version ${dbVersion}\ncurrent version ${currentDBVersion}`,
    );

    // version 0 to 1
    if (currentDBVersion === 0) {
        for (const migration of Object.values(migrations_v1)) {
            await db.execAsync(migration);
        }
        currentDBVersion = 1;
    }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
