export type IAccountCard = {
    accountName: string;
    accountTotal: number;
    subAccounts: {
        subAccountName: string;
        subAccountTotal: number;
    }[];
};

export type Account = {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: null;
    user_id: string;
    category: string;
    name: string;
    balance: number;
    is_default_account: boolean;
    currency: string;
};
