import { nativeStorage } from '@/lib/utils/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AccountsReportStore, AccountStore, CurrentAccountRequestParams } from './schema';

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

export const createAccountsReportStore = create<AccountsReportStore>()(
    persist(
        (set) => ({
            category: '📈 NET WORTH',
            setCategory: (category) => set({ category }),
            period: '1M',
            setTimePeriod: (period) => set({ period }),
            showChart: true,
            setShowChart: (showChart) => set({ showChart }),
        }),
        {
            name: 'accounts-report-store',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
