export type Migration = {
    version: number;
    sql: string;
};

const migrations: Migration[] = [
    {
        version: 1,
        sql: `
          PRAGMA journal_mode = WAL;
      		CREATE TABLE IF NOT EXISTS accounts (
       			id TEXT NOT NULL,
       			created_at TEXT DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
       			updated_at TEXT DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
       			deleted_at TEXT,
            	created_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
            	updated_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
            	deleted_at_unix INTEGER,
       			user_id TEXT,
       			category TEXT NOT NULL,
       			name TEXT NOT NULL,
       			balance NUMERIC NOT NULL,
       			is_default_account BOOLEAN DEFAULT 0,
       			currency TEXT,
       			PRIMARY KEY (id)
      		);
      		CREATE INDEX IF NOT EXISTS idx_accounts_deleted_at ON accounts(deleted_at);`,
    },
    {
        version: 1,
        sql: `
          PRAGMA journal_mode = WAL;
      		CREATE TABLE IF NOT EXISTS plans (
       			id TEXT NOT NULL,
       			created_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
       			updated_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
       			deleted_at TEXT,
            	created_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
             	updated_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
             	deleted_at_unix INTEGER,
       			user_id TEXT,
       			type TEXT NOT NULL,
       			category TEXT NOT NULL,
       			target NUMERIC NOT NULL,
       			balance NUMERIC NOT NULL,
       			account_id TEXT,
       			start_date TEXT,
       			end_date TEXT,
       			deposit_frequency TEXT NOT NULL,
       			push_notification BOOLEAN,
       			name TEXT,
       			currency TEXT NOT NULL,
       			debit_account_id TEXT,
          		is_completed BOOLEAN DEFAULT 0,
       			PRIMARY KEY (id)
      		);
      		CREATE INDEX IF NOT EXISTS idx_plans_deleted_at ON plans(deleted_at);`,
    },
    {
        version: 1,
        sql: `
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS transactions (
            id TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
            updated_at TEXT DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
            deleted_at TEXT,
            created_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
            updated_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
            deleted_at_unix INTEGER,
            account_id TEXT,
            user_id TEXT,
            type TEXT NOT NULL,
            amount NUMERIC NOT NULL,
            note TEXT,
            category TEXT,
            from_account TEXT,
            to_account TEXT,
            currency TEXT,
            plan_id TEXT,
            PRIMARY KEY (id)
          );
          CREATE INDEX IF NOT EXISTS idx_transactions_deleted_at ON transactions(deleted_at);`,
    },
    {
        version: 1,
        sql: `
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);`,
    },
    {
        version: 1,
        sql: `
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS transaction_types (
            category TEXT NOT NULL UNIQUE ON CONFLICT IGNORE,
            emoji TEXT NOT NULL UNIQUE ON CONFLICT IGNORE,
            is_custom BOOLEAN DEFAULT 0
          );`,
    },
    {
        version: 2,
        sql: `
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS recurring_transactions (
            id TEXT NOT NULL,
            amount NUMERIC NOT NULL,
            category TEXT NOT NULL,
            type TEXT NOT NULL,
            account_id TEXT NOT NULL,
            recurrence_rule TEXT NOT NULL,
            start_date TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
            end_date TEXT,
            start_date_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
            end_date_unix INTEGER,
            metadata JSONB,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
            updated_at TEXT DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
            created_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
            updated_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW'))
          );
          CREATE INDEX IF NOT EXISTS idx_recurring_transactions_account_id ON recurring_transactions(account_id);
          CREATE INDEX IF NOT EXISTS idx_recurring_transactions_start_date ON recurring_transactions(start_date);
          CREATE INDEX IF NOT EXISTS idx_recurring_transactions_end_date ON recurring_transactions(end_date);
          CREATE INDEX IF NOT EXISTS idx_recurring_transactions_status ON recurring_transactions(status);
          CREATE INDEX IF NOT EXISTS idx_recurring_transactions_created_at_unix ON recurring_transactions(created_at_unix);
          CREATE INDEX IF NOT EXISTS idx_recurring_transactions_updated_at_unix ON recurring_transactions(updated_at_unix);
        `,
    },
];

export default migrations;
