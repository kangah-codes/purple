import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { ServiceFactory } from '@/lib/factory/ServiceFactory';
import { TransactionSQLiteService } from '@/lib/services/TransactionSQLiteService';
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
    RecurringTransaction,
    Transaction,
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
            const service = ServiceFactory.create<Transaction>('transactions', db, sessionData);
            // @ts-expect-error: listUpcomingRecurringTransactions exists on TransactionSQLiteService
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

    return useInfiniteQuery<GenericAPIResponse<Transaction[]>, Error>(
        ['transactions', requestQuery],
        async ({ pageParam = 1 }) => {
            const queryParams = {
                ...requestQuery,
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
