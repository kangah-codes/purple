import { Account } from '../Accounts/schema';

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

export type User = {
    ID: string;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    phone_number: string;
    accounts: Account[];
    plans: any[]; // Assuming plans is an array of objects, you can replace `any` with the appropriate type if known
    transactions: Transaction[];
    role: string;
};

export type SessionData = {
    access_token: string;
    access_token_expires_at: string;
    refresh_token: string;
    refresh_token_expires_at: string;
    user: User;
};

export type SignUpScreenData = {
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
};
