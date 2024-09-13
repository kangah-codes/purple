import { create } from 'zustand';
import { Account } from './schema';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nativeStorage } from '@/lib/utils/storage';

type AccountStore = {
    accounts: Account[];
    setAccounts: (accounts: Account[]) => void;
};

export const createAccountStore = create<AccountStore>()(
    persist(
        (set) => ({
            accounts: [],
            setAccounts: (accounts) => set({ accounts }),
        }),
        {
            name: 'account-store',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
