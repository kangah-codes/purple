import { Currency } from '@/@types/common';
import { Account } from '../Accounts/schema';
import { Plan } from '../Plans/schema';
import { Transaction } from '../Transactions/schema';

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
    plans: Plan[];
    transactions: Transaction[];
    role: string;
};

export type UserSettings = {
    default_currency: string;
};

export type SessionData = {
    access_token: string;
    access_token_expires_at: string;
    refresh_token: string;
    refresh_token_expires_at: string;
    user: User;
    account_groups: string[];
    currencies: Currency[];
    transaction_types: string[];
};

export type SignUpScreenData = {
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
};
