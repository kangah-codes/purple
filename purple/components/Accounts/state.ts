import { create } from 'zustand';
import { Account } from './schema';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nativeStorage } from '@/lib/utils/storage';
import { Transaction } from '../Transactions/schema';

type AccountStore = {
    accounts: Account[];
    getAccountById: (id?: string) => Account | null;
    setAccounts: (accounts: Account[]) => void;
    updateAccounts: (account: Account) => void;
    currentAccount?: Account | null;
    setCurrentAccount: (account: Account | null) => void;
    currentAccountTransactions: Transaction[];
    setCurrentAccountTransactions: (transactions: Transaction[]) => void;
    reset: () => void;
};

export const createAccountStore = create<AccountStore>()(
    persist(
        (set, get) => ({
            accounts: [],
            getAccountById: (id?: string) => {
                if (!id) return null;
                const account = get().accounts.find((acc) => acc.id === id);
                return account ?? null;
            },
            setAccounts: (accounts) => set({ accounts }),
            updateAccounts: (account) =>
                set((state) => ({ accounts: [...state.accounts, account] })),
            currentAccount: undefined,
            setCurrentAccount: (account) => set({ currentAccount: account }),
            currentAccountTransactions: [],
            setCurrentAccountTransactions: (transactions) =>
                set({ currentAccountTransactions: transactions }),
            reset: () =>
                set({ accounts: [], currentAccount: undefined, currentAccountTransactions: [] }),
        }),
        {
            name: 'account-store',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
