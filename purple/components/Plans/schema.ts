import { Account } from '../Accounts/schema';

export type BudgetPlan = {
    category: string;
    startDate: string;
    endDate: string;
    percentageCompleted: number;
    spent: number;
    balance: number;
    budget: number;
};

export type Plan = {
    ID: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    user_id: string;
    type: 'expense' | 'saving';
    category: string;
    target: number;
    balance: number;
    account_id: string;
    account: Account;
    start_date: string;
    end_date: string;
    deposit_frequency: string;
    push_notification: boolean;
    CreatedAt: string;
    UpdatedAt: string;
    name: string;
    currency: string;
};

export type CreatePlan = {
    type: string;
    category: string;
    amount: number;
    start_date: string;
    end_date: string;
    deposit_frequency: string;
    push_notification: boolean;
    name: string;
    currency: string;
};
