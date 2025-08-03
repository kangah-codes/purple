import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { ServiceFactory } from '@/lib/factory/ServiceFactory';
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
import { TransactionSQLiteService } from '@/lib/services/TransactionSQLiteService';

export function useTransactionStore() {
    const [
        transactions,
        setTransactions,
        currentTransaction,
        setCurrentTransaction,
        updateTransactions,
    ] = useStore(createTransactionStore, (state) => [
        state.transactions,
        state.setTransactions,
        state.currentTransaction,
        state.setCurrentTransaction,
        state.updateTransactions,
    ]);

    return {
        transactions,
        setTransactions,
        currentTransaction,
        setCurrentTransaction,
        updateTransactions,
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
