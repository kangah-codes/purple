import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    const DATABASE_VERSION = 1;
    let { user_version: currentDbVersion } = await db.getFirstAsync<{
        user_version: number;
    }>('PRAGMA user_version');

    if (currentDbVersion >= DATABASE_VERSION) {
        return;
    }

    if (currentDbVersion === 0) {
        await db.execAsync(`
          PRAGMA journal_mode = WAL;
      		CREATE TABLE IF NOT EXISTS accounts (
      			id TEXT NOT NULL,
      			created_at TEXT DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
      			updated_at TEXT DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
      			deleted_at TEXT,
      			user_id TEXT,
      			category TEXT NOT NULL,
      			name TEXT NOT NULL,
      			balance NUMERIC NOT NULL,
      			is_default_account BOOLEAN DEFAULT 0,
      			currency TEXT,
      			PRIMARY KEY (id)
      		);
      		CREATE INDEX IF NOT EXISTS idx_accounts_deleted_at ON accounts(deleted_at);
        `);
        currentDbVersion = 1;
    }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
