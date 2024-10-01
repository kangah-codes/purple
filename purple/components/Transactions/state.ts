import { create } from 'zustand';
import { Transaction } from './schema';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nativeStorage } from '@/lib/utils/storage';

type TransactionStore = {
    transactions: Transaction[];
    setTransactions: (accounts: Transaction[]) => void;
    currentTransaction: Transaction | null;
    setCurrentTransaction: (transaction: Transaction | null) => void;
};

export const createTransactionStore = create<TransactionStore>()(
    persist(
        (set) => ({
            transactions: [],
            setTransactions: (transactions) => set({ transactions }),
            currentTransaction: null,
            setCurrentTransaction: (transaction) => set({ currentTransaction: transaction }),
        }),
        {
            name: 'transaction-store',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
