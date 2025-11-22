import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { ServiceFactory } from '@/lib/factory/ServiceFactory';
import { TransactionSQLiteService } from '@/lib/services/TransactionSQLiteService';
import { formPreprocessor } from '@/lib/utils/object';
import { useSQLiteContext } from 'expo-sqlite';
import {
    UseInfiniteQueryOptions,
    UseInfiniteQueryResult,
    UseMutationResult,
    UseQueryOptions,
    UseQueryResult,
    useInfiniteQuery,
    useMutation,
    useQuery,
} from 'react-query';
import { useStore } from 'zustand';
import { useAuth } from '../Auth/hooks';
import {
    CreateRecurringTransaction,
    CreateTransaction,
    EditTransaction,
    RecurringTransaction,
    Transaction,
    TransactionsFilter,
} from './schema';
import { createTransactionStore } from './state';

export function useTransactionStore() {
    const [
        transactions,
        recurringTransactions,
        setTransactions,
        setRecurringTransactions,
        currentTransaction,
        currentRecurringTransaction,
        setCurrentTransaction,
        setCurrentRecurringTransaction,
        updateTransactions,
        updateRecurringTransactions,
        deleteTransaction,
        transactionsFilter,
        pendingTransactionsFilter,
        setTransactionsFilter,
        setPendingTransactionsFilter,
        applyPendingFilters,
        resetTransactionsFilter,
    ] = useStore(createTransactionStore, (state) => [
        state.transactions,
        state.recurringTransactions,
        state.setTransactions,
        state.setRecurringTransactions,
        state.currentTransaction,
        state.currentRecurringTransaction,
        state.setCurrentTransaction,
        state.setCurrentRecurringTransaction,
        state.updateTransactions,
        state.updateRecurringTransactions,
        state.deleteTransaction,
        state.transactionsFilter,
        state.pendingTransactionsFilter,
        state.setTransactionsFilter,
        state.setPendingTransactionsFilter,
        state.applyPendingFilters,
        state.resetTransactionsFilter,
    ]);

    return {
        transactions,
        setTransactions,
        currentTransaction,
        setCurrentTransaction,
        updateTransactions,

        recurringTransactions,
        setRecurringTransactions,
        currentRecurringTransaction,
        setCurrentRecurringTransaction,
        updateRecurringTransactions,
        deleteTransaction,

        // Filter functionality
        transactionsFilter,
        pendingTransactionsFilter,
        setTransactionsFilter,
        setPendingTransactionsFilter,
        applyPendingFilters,
        resetTransactionsFilter,
    };
}

export function useTransactions({
    requestQuery,
    options,
}: {
    requestQuery: RequestParamQuery;
    options?: UseQueryOptions;
}): UseQueryResult<GenericAPIResponse<Transaction[]>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useQuery(
        ['transactions', requestQuery],
        async () => {
            const service = ServiceFactory.create<Transaction>('transactions', db, sessionData);
            return service.list(requestQuery);
        },
        {
            ...(options as Omit<
                UseQueryOptions<any, any, any, any>,
                'queryKey' | 'queryFn' | 'initialData'
            >),
        },
    );
}

export function useRecurringTransactions({
    requestQuery,
    options,
}: {
    requestQuery: {
        startDate: Date;
        endDate: Date;
        n: number;
    };
    options?: UseQueryOptions;
}): UseQueryResult<GenericAPIResponse<RecurringTransaction[]>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useQuery(
        ['recurring-transactions', requestQuery],
        async () => {
            const service = ServiceFactory.create<Transaction>(
                'transactions',
                db,
                sessionData,
            ) as TransactionSQLiteService;
            return service.listUpcomingRecurringTransactions(
                requestQuery.startDate,
                requestQuery.endDate,
                requestQuery.n,
            );
        },
        {
            ...(options as Omit<
                UseQueryOptions<any, any, any, any>,
                'queryKey' | 'queryFn' | 'initialData'
            >),
        },
    );
}

export function useUpcomingRecurringTransactions({
    requestQuery,
    options,
}: {
    requestQuery: {
        startDate: Date;
        endDate: Date;
        n: number;
    };
    options?: UseQueryOptions;
}): UseQueryResult<GenericAPIResponse<RecurringTransaction[]>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useQuery(
        ['recurring-transactions', requestQuery],
        async () => {
            const service = ServiceFactory.create<Transaction>(
                'transactions',
                db,
                sessionData,
            ) as TransactionSQLiteService;
            return service.listUpcomingRecurringTransactions(
                requestQuery.startDate,
                requestQuery.endDate,
                requestQuery.n,
            );
        },
        {
            ...(options as Omit<
                UseQueryOptions<any, any, any, any>,
                'queryKey' | 'queryFn' | 'initialData'
            >),
        },
    );
}

export function useInfiniteTransactions({
    requestQuery,
    options,
}: {
    requestQuery: RequestParamQuery;
    options?: Omit<
        UseInfiniteQueryOptions<GenericAPIResponse<Transaction[]>, Error>,
        'queryKey' | 'queryFn'
    >;
}): UseInfiniteQueryResult<GenericAPIResponse<Transaction[]>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();
    const { transactionsFilter } = useTransactionStore();

    // Process and clean the filter data
    const processedFilter = formPreprocessor({
        data: transactionsFilter,
        omit: [undefined, null, '', []],
        omitKeys: [],
    });

    return useInfiniteQuery<GenericAPIResponse<Transaction[]>, Error>(
        ['transactions', requestQuery, processedFilter],
        async ({ pageParam = 1 }) => {
            const queryParams = {
                ...requestQuery,
                ...processedFilter,
                page: pageParam,
                page_size: requestQuery.page_size || 10,
            };
            const service = ServiceFactory.create<Transaction>('transactions', db, sessionData);
            return service.list(queryParams);
        },
        {
            ...options,
            getNextPageParam: (lastPage) => {
                const nextPage = lastPage.page + 1;
                return nextPage <= Math.ceil(lastPage.total_items / lastPage.page_size)
                    ? nextPage
                    : undefined;
            },
        },
    );
}

export function useInfiniteRecurringTransactions({
    requestQuery,
    options,
}: {
    requestQuery: RequestParamQuery;
    options?: Omit<
        UseInfiniteQueryOptions<GenericAPIResponse<RecurringTransaction[]>, Error>,
        'queryKey' | 'queryFn'
    >;
}): UseInfiniteQueryResult<GenericAPIResponse<RecurringTransaction[]>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useInfiniteQuery<GenericAPIResponse<RecurringTransaction[]>, Error>(
        ['recurring-transactions', requestQuery],
        async ({ pageParam = 1 }) => {
            const queryParams = {
                ...requestQuery,
                page: pageParam,
                page_size: requestQuery.page_size || 10,
                start_date: requestQuery.startDate || false,
                end_date: requestQuery.endDate || false,
                accountID: requestQuery.accountID || false,
            };
            const service = ServiceFactory.create<Transaction>('transactions', db, sessionData);
            // @ts-expect-error: listRecurringTransactions exists on TransactionSQLiteService
            return service.listRecurringTransactions(queryParams);
        },
        {
            ...options,
            getNextPageParam: (lastPage) => {
                const nextPage = lastPage.page + 1;
                return nextPage <= Math.ceil(lastPage.total_items / lastPage.page_size)
                    ? nextPage
                    : undefined;
            },
        },
    );
}

export function useCreateTransaction(): UseMutationResult<GenericAPIResponse<Transaction>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useMutation(['create-transaction'], async (transactionInformation) => {
        const service = ServiceFactory.create<Transaction>('transactions', db, sessionData);
        return service.create(transactionInformation as CreateTransaction);
    });
}

export function useEditTransaction(): UseMutationResult<
    GenericAPIResponse<Transaction>,
    Error,
    { id: string; data: EditTransaction }
> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useMutation(['edit-transaction'], async ({ id, data }) => {
        const service = ServiceFactory.create<Transaction>('transactions', db, sessionData);
        return service.update(id, data);
    });
}

export function useCreateRecurringTransaction(): UseMutationResult<
    GenericAPIResponse<RecurringTransaction>,
    Error
> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useMutation(['create-recurring-transaction'], async (recurringTransaction) => {
        const service = ServiceFactory.create<Transaction>(
            'transactions',
            db,
            sessionData,
        ) as TransactionSQLiteService;
        return service.createRecurringTransaction(
            recurringTransaction as CreateRecurringTransaction,
        );
    });
}

export function useEditRecurringTransaction(): UseMutationResult<
    GenericAPIResponse<RecurringTransaction>,
    Error,
    {
        id: string;
        data: Partial<CreateRecurringTransaction> & {
            is_active?: boolean;
            status?: 'active' | 'paused' | 'cancelled';
        };
    }
> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useMutation(['edit-recurring-transaction'], async ({ id, data }) => {
        const service = ServiceFactory.create<Transaction>(
            'transactions',
            db,
            sessionData,
        ) as TransactionSQLiteService;
        return service.updateRecurringTransaction(id, data);
    });
}

export function useUpdateTransaction(): UseMutationResult<
    GenericAPIResponse<Transaction>,
    Error,
    { id: string; data: CreateTransaction }
> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useMutation(['update-transaction'], async ({ id, data }) => {
        const service = ServiceFactory.create<Transaction>('transactions', db, sessionData);
        return service.update(id, data);
    });
}

export function useDeleteTransaction({
    transactionID,
}: {
    transactionID: string;
}): UseMutationResult<GenericAPIResponse<null>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useMutation(['delete-transaction'], async () => {
        const service = ServiceFactory.create<Transaction>('transactions', db, sessionData);
        return service.delete(transactionID);
    });
}

export function useDeleteRecurringTransaction({
    transactionID,
}: {
    transactionID: string;
}): UseMutationResult<GenericAPIResponse<null>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useMutation(['delete-recurring-transaction'], async () => {
        const service = ServiceFactory.create<Transaction>(
            'transactions',
            db,
            sessionData,
        ) as TransactionSQLiteService;
        return service.deleteRecurring(transactionID);
    });
}

// Utility function to check if any filters are active
export function hasActiveTransactionFilters(filter: TransactionsFilter): boolean {
    return (
        (filter.type && filter.type.length > 0) ||
        (filter.category && filter.category.length > 0) ||
        (filter.account_ids && filter.account_ids.length > 0) ||
        filter.min_amount !== undefined ||
        filter.max_amount !== undefined ||
        filter.start_date !== undefined ||
        filter.end_date !== undefined
    );
}
