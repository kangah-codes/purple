export const migrationsV3 = [
    {
        version: 3,
        sql: `
            PRAGMA journal_mode = WAL;
            
            -- Trigger to reverse budget totals when a debit transaction is deleted
            CREATE TRIGGER IF NOT EXISTS trg_before_delete_transaction_budget
            BEFORE DELETE ON transactions
            WHEN OLD.budget_id IS NOT NULL AND OLD.type = 'debit'
            BEGIN
                -- Decrease total_spent in budget_summaries
                UPDATE budget_summaries 
                SET total_spent = total_spent - OLD.amount,
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE budget_id = OLD.budget_id;
                
                -- Decrease spent_amount in budget_category_limits for the category
                UPDATE budget_category_limits 
                SET spent_amount = spent_amount - OLD.amount,
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE budget_id = OLD.budget_id 
                  AND category = OLD.category 
                  AND deleted_at IS NULL;
                
                -- Decrease spent_amount in budget_allocations for flex budgets
                UPDATE budget_allocations 
                SET spent_amount = spent_amount - OLD.amount,
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE budget_id = OLD.budget_id 
                  AND category = OLD.category 
                  AND deleted_at IS NULL;
            END;
        `,
    },
    {
        version: 3,
        sql: `
            PRAGMA journal_mode = WAL;
            
            -- Trigger to adjust budget totals when a transaction is updated
            CREATE TRIGGER IF NOT EXISTS trg_after_update_transaction_budget
            AFTER UPDATE ON transactions
            WHEN (NEW.budget_id IS NOT NULL OR OLD.budget_id IS NOT NULL) 
                AND (NEW.type = 'debit' OR OLD.type = 'debit')
                AND (
                    OLD.budget_id != NEW.budget_id 
                    OR OLD.amount != NEW.amount 
                    OR OLD.category != NEW.category 
                    OR OLD.type != NEW.type
                )
            BEGIN
                -- If old transaction was a debit with budget, reverse it
                UPDATE budget_summaries 
                SET total_spent = total_spent - OLD.amount,
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE OLD.budget_id IS NOT NULL 
                  AND OLD.type = 'debit' 
                  AND budget_id = OLD.budget_id;
                
                UPDATE budget_category_limits 
                SET spent_amount = spent_amount - OLD.amount,
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE OLD.budget_id IS NOT NULL 
                  AND OLD.type = 'debit'
                  AND budget_id = OLD.budget_id 
                  AND category = OLD.category 
                  AND deleted_at IS NULL;
                  
                UPDATE budget_allocations 
                SET spent_amount = spent_amount - OLD.amount,
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE OLD.budget_id IS NOT NULL 
                  AND OLD.type = 'debit'
                  AND budget_id = OLD.budget_id 
                  AND category = OLD.category 
                  AND deleted_at IS NULL;
                
                -- If new transaction is a debit with budget, add it
                UPDATE budget_summaries 
                SET total_spent = total_spent + NEW.amount,
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE NEW.budget_id IS NOT NULL 
                  AND NEW.type = 'debit'
                  AND budget_id = NEW.budget_id;
                
                UPDATE budget_category_limits 
                SET spent_amount = spent_amount + NEW.amount,
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE NEW.budget_id IS NOT NULL 
                  AND NEW.type = 'debit'
                  AND budget_id = NEW.budget_id 
                  AND category = NEW.category 
                  AND deleted_at IS NULL;
                  
                UPDATE budget_allocations 
                SET spent_amount = spent_amount + NEW.amount,
                    updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime')
                WHERE NEW.budget_id IS NOT NULL 
                  AND NEW.type = 'debit'
                  AND budget_id = NEW.budget_id 
                  AND category = NEW.category 
                  AND deleted_at IS NULL;
            END;
        `,
    },
];
