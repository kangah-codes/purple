export type IAccountCard = {
    accountName: string;
    accountTotal: number;
    subAccounts: {
        subAccountName: string;
        subAccountTotal: number;
    }[];
};

export type Account = {
    ID: string;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: null;
    user_id: string;
    category: string;
    name: string;
    balance: number;
    is_default_account: boolean;
    currency: string;
};
