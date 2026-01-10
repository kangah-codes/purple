export const migrationsV4 = [
    {
        version: 4,
        sql: `
            PRAGMA journal_mode = WAL;

            -- Update budget triggers to exclude transfers from budget spend.
            -- We treat any debit with from_account/to_account set as a transfer-like transaction.
            DROP TRIGGER IF EXISTS trg_before_delete_transaction_budget;
            DROP TRIGGER IF EXISTS trg_after_update_transaction_budget;

            CREATE TRIGGER trg_before_delete_transaction_budget
            AFTER DELETE ON transactions
            WHEN OLD.budget_id IS NOT NULL AND OLD.type = 'debit'
            BEGIN
                UPDATE budget_summaries
                SET total_spent = (
                        SELECT COALESCE(SUM(amount), 0)
                        FROM transactions
                        WHERE budget_id = OLD.budget_id
                            AND type = 'debit'
                            AND (from_account IS NULL OR from_account = '')
                            AND (to_account IS NULL OR to_account = '')
                            AND deleted_at IS NULL
                    ),
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE budget_id = OLD.budget_id;

                UPDATE budget_category_limits
                SET spent_amount = (
                        SELECT COALESCE(SUM(amount), 0)
                        FROM transactions
                        WHERE budget_id = OLD.budget_id
                            AND type = 'debit'
                            AND (from_account IS NULL OR from_account = '')
                            AND (to_account IS NULL OR to_account = '')
                            AND category = budget_category_limits.category
                            AND deleted_at IS NULL
                    ),
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE budget_id = OLD.budget_id
                    AND deleted_at IS NULL;

                UPDATE budget_allocations
                SET spent_amount = (
                        SELECT COALESCE(SUM(amount), 0)
                        FROM transactions
                        WHERE budget_id = OLD.budget_id
                            AND type = 'debit'
                            AND (from_account IS NULL OR from_account = '')
                            AND (to_account IS NULL OR to_account = '')
                            AND category = budget_allocations.category
                            AND deleted_at IS NULL
                    ),
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE budget_id = OLD.budget_id
                    AND deleted_at IS NULL;
            END;

            CREATE TRIGGER trg_after_update_transaction_budget
            AFTER UPDATE ON transactions
            WHEN (NEW.budget_id IS NOT NULL OR OLD.budget_id IS NOT NULL)
            BEGIN
                -- Recompute for OLD budget (if any)
                UPDATE budget_summaries
                SET total_spent = (
                        SELECT COALESCE(SUM(amount), 0)
                        FROM transactions
                        WHERE budget_id = OLD.budget_id
                            AND type = 'debit'
                            AND (from_account IS NULL OR from_account = '')
                            AND (to_account IS NULL OR to_account = '')
                            AND deleted_at IS NULL
                    ),
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE OLD.budget_id IS NOT NULL
                    AND budget_id = OLD.budget_id;

                UPDATE budget_category_limits
                SET spent_amount = (
                        SELECT COALESCE(SUM(amount), 0)
                        FROM transactions
                        WHERE budget_id = OLD.budget_id
                            AND type = 'debit'
                            AND (from_account IS NULL OR from_account = '')
                            AND (to_account IS NULL OR to_account = '')
                            AND category = budget_category_limits.category
                            AND deleted_at IS NULL
                    ),
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE OLD.budget_id IS NOT NULL
                    AND budget_id = OLD.budget_id
                    AND deleted_at IS NULL;

                UPDATE budget_allocations
                SET spent_amount = (
                        SELECT COALESCE(SUM(amount), 0)
                        FROM transactions
                        WHERE budget_id = OLD.budget_id
                            AND type = 'debit'
                            AND (from_account IS NULL OR from_account = '')
                            AND (to_account IS NULL OR to_account = '')
                            AND category = budget_allocations.category
                            AND deleted_at IS NULL
                    ),
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE OLD.budget_id IS NOT NULL
                    AND budget_id = OLD.budget_id
                    AND deleted_at IS NULL;

                -- Recompute for NEW budget (if it is different from OLD budget)
                UPDATE budget_summaries
                SET total_spent = (
                        SELECT COALESCE(SUM(amount), 0)
                        FROM transactions
                        WHERE budget_id = NEW.budget_id
                            AND type = 'debit'
                            AND (from_account IS NULL OR from_account = '')
                            AND (to_account IS NULL OR to_account = '')
                            AND deleted_at IS NULL
                    ),
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE NEW.budget_id IS NOT NULL
                    AND NEW.budget_id IS NOT OLD.budget_id
                    AND budget_id = NEW.budget_id;

                UPDATE budget_category_limits
                SET spent_amount = (
                        SELECT COALESCE(SUM(amount), 0)
                        FROM transactions
                        WHERE budget_id = NEW.budget_id
                            AND type = 'debit'
                            AND (from_account IS NULL OR from_account = '')
                            AND (to_account IS NULL OR to_account = '')
                            AND category = budget_category_limits.category
                            AND deleted_at IS NULL
                    ),
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE NEW.budget_id IS NOT NULL
                    AND NEW.budget_id IS NOT OLD.budget_id
                    AND budget_id = NEW.budget_id
                    AND deleted_at IS NULL;

                UPDATE budget_allocations
                SET spent_amount = (
                        SELECT COALESCE(SUM(amount), 0)
                        FROM transactions
                        WHERE budget_id = NEW.budget_id
                            AND type = 'debit'
                            AND (from_account IS NULL OR from_account = '')
                            AND (to_account IS NULL OR to_account = '')
                            AND category = budget_allocations.category
                            AND deleted_at IS NULL
                    ),
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE NEW.budget_id IS NOT NULL
                    AND NEW.budget_id IS NOT OLD.budget_id
                    AND budget_id = NEW.budget_id
                    AND deleted_at IS NULL;
            END;
        `,
    },
];
