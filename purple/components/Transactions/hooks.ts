import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { useStore } from 'zustand';
import { SessionData } from '../Auth/schema';
import { Transaction } from './schema';
import { createTransactionStore } from './state';
import { stringify } from '@/lib/utils/string';

export function useTransactionStore() {
    const [transactions, setTransactions, currentTransaction, setCurrentTransaction] = useStore(
        createTransactionStore,
        (state) => [
            state.transactions,
            state.setTransactions,
            state.currentTransaction,
            state.setCurrentTransaction,
        ],
    );

    return {
        transactions,
        setTransactions,
        currentTransaction,
        setCurrentTransaction,
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
