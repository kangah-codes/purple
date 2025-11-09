import { dedupeByKey } from '@/lib/utils/array';
import { nativeStorage } from '@/lib/utils/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { RecurringTransaction, Transaction, TransactionsFilter } from './schema';

type TransactionStore = {
    transactions: Transaction[];
    recurringTransactions: RecurringTransaction[];
    setTransactions: (accounts: Transaction[]) => void;
    setRecurringTransactions: (transactions: RecurringTransaction[]) => void;
    currentTransaction: Transaction | null;
    currentRecurringTransaction: RecurringTransaction | null;
    setCurrentTransaction: (transaction: Transaction | null) => void;
    setCurrentRecurringTransaction: (transaction: RecurringTransaction | null) => void;
    updateTransactions: (transaction: Transaction | Transaction[]) => void;
    updateRecurringTransactions: (
        transaction: RecurringTransaction | RecurringTransaction[],
    ) => void;
    resetRecurringTransactions: () => void;
    reset: () => void;
    deleteTransaction: (id: string) => void;
    transactionsFilter: TransactionsFilter;
    setTransactionsFilter: (filter: TransactionsFilter) => void;
    resetTransactionsFilter: () => void;
};

/**
 *     type?: Transaction['type'][];
    category?: string[];
    account_ids?: string[];
    min_amount?: number;
    max_amount?: number;
    start_date?: string;
    end_date?: string;
 */

export const createTransactionStore = create<TransactionStore>()(
    persist(
        (set) => ({
            transactions: [],
            recurringTransactions: [],
            setTransactions: (transactions) => set({ transactions }),
            setRecurringTransactions: (transactions) =>
                set({ recurringTransactions: transactions }),
            currentTransaction: null,
            currentRecurringTransaction: null,
            setCurrentTransaction: (transaction) => set({ currentTransaction: transaction }),
            setCurrentRecurringTransaction: (transaction) =>
                set({ currentRecurringTransaction: transaction }),
            updateTransactions: (transaction) =>
                set((state) => ({
                    // TODO: probably not optimal but idgaf
                    transactions: dedupeByKey(
                        Array.isArray(transaction)
                            ? [...transaction, ...state.transactions]
                            : [transaction, ...state.transactions],
                        'id',
                    ),
                })),
            updateRecurringTransactions: (transaction) =>
                set((state) => ({
                    recurringTransactions: dedupeByKey(
                        Array.isArray(transaction)
                            ? [...transaction, ...state.recurringTransactions]
                            : [transaction, ...state.recurringTransactions],
                        'id',
                    ),
                })),
            resetRecurringTransactions: () => set({ recurringTransactions: [] }),
            reset: () => set({ transactions: [], currentTransaction: null }),
            deleteTransaction: (id: string) =>
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.id !== id),
                })),
            transactionsFilter: {
                type: [],
                category: [],
                account_ids: [],
                min_amount: undefined,
                max_amount: undefined,
                start_date: undefined,
                end_date: undefined,
            },
            setTransactionsFilter: (filter) => set({ transactionsFilter: filter }),
            resetTransactionsFilter: () =>
                set({
                    transactionsFilter: {
                        type: [],
                        category: [],
                        account_ids: [],
                        min_amount: undefined,
                        max_amount: undefined,
                        start_date: undefined,
                        end_date: undefined,
                    },
                }),
        }),
        {
            name: 'transaction-store',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
