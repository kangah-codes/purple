import { create } from 'zustand';
import { Transaction } from './schema';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nativeStorage } from '@/lib/utils/storage';

type TransactionStore = {
    transactions: Transaction[];
    setTransactions: (accounts: Transaction[]) => void;
};

export const createTransactionStore = create<TransactionStore>()(
    persist(
        (set) => ({
            transactions: [],
            setTransactions: (transactions) => set({ transactions }),
        }),
        {
            name: 'transaction-store',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
