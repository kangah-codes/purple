export const migrationsV4 = [
    {
        version: 4,
        sql: `
            PRAGMA journal_mode = WAL;

            -- Feature flags table
            CREATE TABLE IF NOT EXISTS feature_flags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                enabled INTEGER NOT NULL DEFAULT 0,
                description TEXT,
                created_at TEXT DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
                updated_at TEXT DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime'))
            );

            -- Index for quick lookups by name
            CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(name);
        `,
    },
];
