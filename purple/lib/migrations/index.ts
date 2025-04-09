const migrations_v1: Record<string, string> = {
    accounts: `
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
  		CREATE INDEX IF NOT EXISTS idx_accounts_deleted_at ON accounts(deleted_at);`,
    plans: `
      PRAGMA journal_mode = WAL;
  		CREATE TABLE IF NOT EXISTS plans (
  			id TEXT NOT NULL,
  			created_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
  			updated_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
  			deleted_at TEXT,
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
  			PRIMARY KEY (id)
  		);
  		CREATE INDEX IF NOT EXISTS idx_plans_deleted_at ON plans(deleted_at);`,
    transactions: `
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
        updated_at TEXT DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
        deleted_at TEXT,
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
};

export default migrations_v1;
