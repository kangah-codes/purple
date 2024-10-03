import { create } from 'zustand';
import { Account } from './schema';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nativeStorage } from '@/lib/utils/storage';

type AccountStore = {
    accounts: Account[];
    setAccounts: (accounts: Account[]) => void;
    updateAccounts: (account: Account) => void;
};

export const createAccountStore = create<AccountStore>()(
    persist(
        (set) => ({
            accounts: [],
            setAccounts: (accounts) => set({ accounts }),
            updateAccounts: (account) =>
                set((state) => ({ accounts: [...state.accounts, account] })),
        }),
        {
            name: 'account-store',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
