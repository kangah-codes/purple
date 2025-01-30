import { create } from 'zustand';
import { Account } from './schema';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nativeStorage } from '@/lib/utils/storage';
import { Transaction } from '../Transactions/schema';

type AccountStore = {
    accounts: Account[];
    setAccounts: (accounts: Account[]) => void;
    updateAccounts: (account: Account) => void;
    currentAccount?: Account;
    setCurrentAccount: (account: Account) => void;
    currentAccountTransactions: Transaction[];
    setCurrentAccountTransactions: (transactions: Transaction[]) => void;
    reset: () => void;
};

export const createAccountStore = create<AccountStore>()(
    persist(
        (set) => ({
            accounts: [],
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
