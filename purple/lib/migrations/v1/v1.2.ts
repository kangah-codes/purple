export const migrationsV1_2 = [
    {
        version: 1.2,
        sql: `
          PRAGMA journal_mode = WAL;
          ALTER TABLE recurring_transactions ADD COLUMN notes TEXT DEFAULT NULL;
        `,
    },
    {
        version: 1.2,
        sql: `
            PRAGMA journal_mode = WAL;
            ALTER TABLE accounts ADD COLUMN is_open BOOLEAN DEFAULT 1;
        `,
    },
    {
        version: 1.2,
        sql: `
            PRAGMA journal_mode = WAL;
            ALTER TABLE accounts ADD COLUMN closed_at TEXT DEFAULT NULL;
            ALTER TABLE accounts ADD COLUMN closed_at_unix INTEGER DEFAULT NULL;
            ALTER TABLE accounts ADD COLUMN closed_balance REAL DEFAULT NULL;
        `,
    },
    {
        version: 1.2,
        sql: `
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS budgets (
                id TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
                updated_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
                deleted_at TEXT,
                created_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
                updated_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
                deleted_at_unix INTEGER,
                user_id TEXT,
                name TEXT NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('flex', 'category')),
                month TEXT NOT NULL,
                year INTEGER NOT NULL,
                currency TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                is_disabled BOOLEAN DEFAULT 0,
                PRIMARY KEY (id),
                UNIQUE(user_id, month, year)
            );
            CREATE INDEX IF NOT EXISTS idx_budgets_deleted_at ON budgets(deleted_at);
            CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
            CREATE INDEX IF NOT EXISTS idx_budgets_month_year ON budgets(month, year);
            CREATE INDEX IF NOT EXISTS idx_budgets_is_active ON budgets(is_active);
        `,
    },
    {
        version: 1.21,
        sql: `
            PRAGMA journal_mode = WAL;
            ALTER TABLE budgets ADD COLUMN estimated_income NUMERIC DEFAULT 0;
        `,
    },
    {
        version: 1.22,
        sql: `
            PRAGMA journal_mode = WAL;
            ALTER TABLE budgets ADD COLUMN estimated_spend NUMERIC DEFAULT 0;
        `,
    },
    {
        version: 1.2,
        sql: `
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS budget_allocations (
                id TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
                updated_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
                deleted_at TEXT,
                created_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
                updated_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
                deleted_at_unix INTEGER,
                budget_id TEXT NOT NULL,
                allocation_type TEXT NOT NULL CHECK(allocation_type IN ('fixed', 'flexible')),
                category TEXT NOT NULL,
                allocated_amount NUMERIC NOT NULL,
                spent_amount NUMERIC DEFAULT 0,
                notes TEXT,
                PRIMARY KEY (id),
                FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_budget_allocations_budget_id ON budget_allocations(budget_id);
            CREATE INDEX IF NOT EXISTS idx_budget_allocations_deleted_at ON budget_allocations(deleted_at);
            CREATE INDEX IF NOT EXISTS idx_budget_allocations_type ON budget_allocations(allocation_type);
        `,
    },
    {
        version: 1.2,
        sql: `
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS budget_category_limits (
                id TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
                updated_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
                deleted_at TEXT,
                created_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
                updated_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
                deleted_at_unix INTEGER,
                budget_id TEXT NOT NULL,
                category TEXT NOT NULL,
                limit_amount NUMERIC NOT NULL,
                spent_amount NUMERIC DEFAULT 0,
                rollover_enabled BOOLEAN DEFAULT 0,
                notes TEXT,
                PRIMARY KEY (id),
                FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
                UNIQUE(budget_id, category)
            );
            CREATE INDEX IF NOT EXISTS idx_budget_category_limits_budget_id ON budget_category_limits(budget_id);
            CREATE INDEX IF NOT EXISTS idx_budget_category_limits_deleted_at ON budget_category_limits(deleted_at);
            CREATE INDEX IF NOT EXISTS idx_budget_category_limits_category ON budget_category_limits(category);
        `,
    },
    {
        version: 1.2,
        sql: `
            PRAGMA journal_mode = WAL;
            ALTER TABLE transactions ADD COLUMN budget_id TEXT DEFAULT NULL;
            CREATE INDEX IF NOT EXISTS idx_transactions_budget_id ON transactions(budget_id);
        `,
    },
    {
        version: 1.2,
        sql: `
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS budget_summaries (
                id TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
                updated_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')),
                deleted_at TEXT,
                created_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
                updated_at_unix INTEGER DEFAULT (STRFTIME('%s', 'NOW')),
                deleted_at_unix INTEGER,
                budget_id TEXT NOT NULL,
                total_allocated NUMERIC NOT NULL,
                total_spent NUMERIC DEFAULT 0,
                PRIMARY KEY (id),
                FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
                UNIQUE(budget_id)
            );
            CREATE INDEX IF NOT EXISTS idx_budget_summaries_budget_id ON budget_summaries(budget_id);
            CREATE INDEX IF NOT EXISTS idx_budget_summaries_deleted_at ON budget_summaries(deleted_at);
        `,
    },
];
