import { create } from 'zustand';
import { Transaction } from './schema';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nativeStorage } from '@/lib/utils/storage';

type TransactionStore = {
    transactions: Transaction[];
    setTransactions: (accounts: Transaction[]) => void;
    currentTransaction: Transaction | null;
    setCurrentTransaction: (transaction: Transaction | null) => void;
    updateTransactions: (transaction: Transaction | Transaction[]) => void;
};

export const createTransactionStore = create<TransactionStore>()(
    persist(
        (set) => ({
            transactions: [],
            setTransactions: (transactions) => set({ transactions }),
            currentTransaction: null,
            setCurrentTransaction: (transaction) => set({ currentTransaction: transaction }),
            updateTransactions: (transaction) =>
                set((state) => ({
                    transactions: Array.isArray(transaction)
                        ? [...transaction, ...state.transactions]
                        : [transaction, ...state.transactions],
                })),
        }),
        {
            name: 'transaction-store',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
