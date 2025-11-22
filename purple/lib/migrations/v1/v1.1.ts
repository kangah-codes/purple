export const migrationsV1_1 = [
    {
        version: 1.1,
        sql: `
          PRAGMA journal_mode = WAL;
          ALTER TABLE recurring_transactions ADD COLUMN notes TEXT DEFAULT NULL;
        `,
    },
    {
        version: 1.1,
        sql: `
            PRAGMA journal_mode = WAL;
            ALTER TABLE accounts ADD COLUMN is_open BOOLEAN DEFAULT 1;
        `,
    },
    {
        version: 1.1,
        sql: `
            PRAGMA journal_mode = WAL;
            ALTER TABLE accounts ADD COLUMN closed_at TEXT DEFAULT NULL;
            ALTER TABLE accounts ADD COLUMN closed_at_unix INTEGER DEFAULT NULL;
            ALTER TABLE accounts ADD COLUMN closed_balance REAL DEFAULT NULL;
        `,
    },
];
