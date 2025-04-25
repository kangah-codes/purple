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
};
