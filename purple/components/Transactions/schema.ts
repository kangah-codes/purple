import { Account } from '../Accounts/schema';

export type TransactionData = {
    type: string;
    category: string;
    description: string;
    amount: string;
    dateTime: string;
};

export type Transaction = {
    id: string;
    updated_at: string;
    deleted_at: string | null;
    account_id: string;
    user_id: string;
    type: 'debit' | 'credit' | 'transfer';
    amount: number;
    account: Account;
    note: string;
    category: string;
    from_account: string;
    to_account: string;
    created_at: string;
    currency: string;
    plan_id: string;
    created_at_unix: string;
    updated_at_unix: string;
    deleted_at_unix: string | null;
};

export type RecurringTransaction = {
    id: string;
    amount: number;
    category: string;
    type: 'debit' | 'credit' | 'transfer'; // Add 'transfer' support
    account_id: string;
    // Add fields needed for transfer transactions
    from_account?: string;
    to_account?: string;
    recurrence_rule: string;
    is_active: boolean;
    start_date: string;
    end_date: string;
    create_next_at: string;
    create_next_at_unix: number;
    last_created_at: string;
    last_created_at_unix: number | null;
    start_date_unix: number;
    end_date_unix: number | null;
    metadata: Record<string, any>;
    status: 'active' | 'paused' | 'cancelled';
    created_at: string;
    updated_at: string;
    deleted_at: string;
    created_at_unix: string;
    updated_at_unix: string;
    deleted_at_unix: string | null;
};

export type CreateTransaction = {
    account_id: string;
    type: Transaction['type'];
    amount: number;
    note?: string;
    category: string;
    from_account?: string;
    to_account?: string;
    currency: string;
    plan_id?: string;
    date: string;
    charges: number;
};

export type EditTransaction = {
    account_id: string;
    type: 'debit' | 'credit';
    amount: number;
    note: string;
    category: string;
    date: string;
    currency: string;
};

export type CreateRecurringTransaction = {
    account_id: string;
    type: Transaction['type']; // This already supports 'transfer'
    amount: number;
    category: string;
    recurrence_rule: string;
    start_date: string;
    end_date?: string;
    metadata?: Record<string, any>;
    currency: string;
    // Add fields needed for transfer transactions
    from_account?: string;
    to_account?: string;
};
