export const migrationsV5 = [
    {
        version: 5,
        sql: `
            PRAGMA journal_mode = WAL;

            -- Performance optimization indexes for transactions table

            -- Single column indexes for common filters
            CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
            CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
            CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
            CREATE INDEX IF NOT EXISTS idx_transactions_from_account ON transactions(from_account);
            CREATE INDEX IF NOT EXISTS idx_transactions_to_account ON transactions(to_account);

            -- Composite indexes for common query patterns
            -- Most common: filter by account + date range + type
            CREATE INDEX IF NOT EXISTS idx_transactions_account_date ON transactions(account_id, created_at DESC) WHERE deleted_at IS NULL;

            -- For account transaction queries with date filtering
            CREATE INDEX IF NOT EXISTS idx_transactions_account_type_date ON transactions(account_id, type, created_at DESC) WHERE deleted_at IS NULL;

            -- For budget queries (budget_id + category + type)
            CREATE INDEX IF NOT EXISTS idx_transactions_budget_category ON transactions(budget_id, category, type) WHERE deleted_at IS NULL AND budget_id IS NOT NULL;

            -- For transfer queries
            CREATE INDEX IF NOT EXISTS idx_transactions_transfer ON transactions(from_account, to_account) WHERE deleted_at IS NULL AND (from_account IS NOT NULL OR to_account IS NOT NULL);

            -- For category-based queries with date filtering
            CREATE INDEX IF NOT EXISTS idx_transactions_category_date ON transactions(category, created_at DESC) WHERE deleted_at IS NULL;
        `,
    },
    {
        version: 5,
        sql: `
            PRAGMA journal_mode = WAL;

            -- Add indexes for accounts table performance
            CREATE INDEX IF NOT EXISTS idx_accounts_category ON accounts(category) WHERE deleted_at IS NULL;
            CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id) WHERE deleted_at IS NULL;
            CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON accounts(created_at DESC);
        `,
    },
];
