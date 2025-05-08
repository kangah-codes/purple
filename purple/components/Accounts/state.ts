import { nativeStorage } from '@/lib/utils/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AccountStore, CurrentAccountRequestParams } from './schema';

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
            currentAccountRequestParams: {},
            setCurrentAccountRequestParams: (
                currentAccountRequestParams: Partial<CurrentAccountRequestParams>,
            ) =>
                set((state) => ({
                    currentAccountRequestParams: {
                        ...state.currentAccountRequestParams,
                        ...currentAccountRequestParams,
                    },
                })),
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
