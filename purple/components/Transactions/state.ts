import { dedupeByKey } from '@/lib/utils/array';
import { nativeStorage } from '@/lib/utils/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Transaction } from './schema';

type TransactionStore = {
    transactions: Transaction[];
    setTransactions: (accounts: Transaction[]) => void;
    currentTransaction: Transaction | null;
    setCurrentTransaction: (transaction: Transaction | null) => void;
    updateTransactions: (transaction: Transaction | Transaction[]) => void;
    reset: () => void;
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
                    // TODO: probably not optimal but idgaf
                    transactions: dedupeByKey(
                        Array.isArray(transaction)
                            ? [...transaction, ...state.transactions]
                            : [transaction, ...state.transactions],
                        'ID',
                    ),
                })),
            reset: () => set({ transactions: [], currentTransaction: null }),
        }),
        {
            name: 'transaction-store',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
