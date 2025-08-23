import { CurrencyCode } from '../Settings/molecules/ExchangeRateItem';
import { Transaction } from '../Transactions/schema';

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
    currency: CurrencyCode;
    created_at_unix: string;
    updated_at_unix: string;
    deleted_at_unix: string | null;
};

export type CurrentAccountRequestParams = {
    accountID?: string;
    page_size?: number;
    currentSelection?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
    startDate?: string;
    endDate?: string;
};

export type AccountStore = {
    accounts: Account[];
    getAccountById: (id?: string) => Account | null;
    setAccounts: (accounts: Account[]) => void;
    updateAccounts: (account: Account) => void;
    // TODO: fix this
    currentAccount?: Account | null;
    setCurrentAccount: (account: Account | null) => void;
    currentAccountRequestParams: CurrentAccountRequestParams;
    setCurrentAccountRequestParams: (
        params: Partial<CurrentAccountRequestParams> | CurrentAccountRequestParams,
    ) => void;
    currentAccountTransactions: Transaction[];
    setCurrentAccountTransactions: (transactions: Transaction[]) => void;
    reset: () => void;
};
