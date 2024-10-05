import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import {
    useInfiniteQuery,
    UseInfiniteQueryOptions,
    UseInfiniteQueryResult,
    useMutation,
    UseMutationResult,
    useQuery,
    UseQueryOptions,
    UseQueryResult,
} from 'react-query';
import { useStore } from 'zustand';
import { SessionData } from '../Auth/schema';
import { Transaction } from './schema';
import { createTransactionStore } from './state';
import { stringify } from '@/lib/utils/string';

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
    sessionData,
    requestQuery,
    options,
}: {
    sessionData: SessionData;
    requestQuery: RequestParamQuery;
    options?: UseQueryOptions;
}): UseQueryResult<GenericAPIResponse<Transaction[]>, Error> {
    return useQuery(
        ['transactions', requestQuery],
        async () => {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/transaction?${stringify(requestQuery)}`,
                {
                    method: 'GET',
                    headers: {
                        'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                        Authorization: sessionData.access_token,
                    },
                },
            );

            if (!res.ok) {
                throw new Error(`${res.status}`);
            }

            return res.json();
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
    sessionData,
    requestQuery,
    options,
}: {
    sessionData: SessionData;
    requestQuery: RequestParamQuery;
    options?: Omit<
        UseInfiniteQueryOptions<GenericAPIResponse<Transaction[]>, Error>,
        'queryKey' | 'queryFn'
    >;
}): UseInfiniteQueryResult<GenericAPIResponse<Transaction[]>, Error> {
    return useInfiniteQuery<GenericAPIResponse<Transaction[]>, Error>(
        ['transactions', requestQuery],
        async ({ pageParam = 1 }) => {
            const queryParams = {
                ...requestQuery,
                page: pageParam,
                page_size: requestQuery.page_size || 10,
            };

            const res = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/transaction?${stringify(queryParams)}`,
                {
                    method: 'GET',
                    headers: {
                        'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                        Authorization: sessionData.access_token,
                    },
                },
            );

            if (!res.ok) {
                throw new Error(`${res.status}`);
            }

            return res.json();
        },
        {
            ...options,
            getNextPageParam: (lastPage) => {
                const nextPage = lastPage.page + 1;
                return nextPage <= Math.ceil(lastPage.total_items / lastPage.page_size)
                    ? nextPage
                    : undefined;
            },
            enabled: !!sessionData,
        },
    );
}

export function useCreateTransaction({
    sessionData,
}: {
    sessionData: SessionData;
}): UseMutationResult<GenericAPIResponse<Transaction>, Error> {
    return useMutation(['create-transaction'], async (transactionInformation) => {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/transaction`, {
            method: 'POST',
            headers: {
                'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                Authorization: sessionData.access_token,
            },
            body: JSON.stringify(transactionInformation),
        });

        if (!res.ok) {
            throw new Error(res.status.toString());
        }

        const json = await res.json();
        return json;
    });
}
