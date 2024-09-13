export type IAccountCard = {
    accountName: string;
    accountTotal: number;
    subAccounts: {
        subAccountName: string;
        subAccountTotal: number;
    }[];
};

export type Account = {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: null;
    user_id: number;
    category: string;
    name: string;
    balance: number;
    is_default_account: boolean;
};
