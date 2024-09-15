import { Account } from '../Accounts/schema';

export type TransactionData = {
    type: string;
    category: string;
    description: string;
    amount: string;
    dateTime: string;
};

export type Transaction = {
    ID: string;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    account_id: string;
    user_id: string;
    Type: string;
    amount: number;
    account: Account;
    note: string;
    category: string;
    from_account: number;
    to_account: number;
};
