import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { useStore } from 'zustand';
import { SessionData } from '../Auth/schema';
import { Transaction } from './schema';
import { createTransactionStore } from './state';
import { stringify } from '@/lib/utils/string';

export function useTransactionStore() {
    const [transactions, setTransactions] = useStore(createTransactionStore, (state) => [
        state.transactions,
        state.setTransactions,
    ]);

    return {
        transactions,
        setTransactions,
    };
}

export function useTransactions({
    sessionData,
    requestParams,
    options,
}: {
    sessionData: SessionData;
    requestParams: RequestParamQuery;
    options?: UseQueryOptions;
}): UseQueryResult<GenericAPIResponse<Transaction[]>, Error> {
    return useQuery(
        ['transactions', requestParams],
        async () => {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/transaction?${stringify(requestParams)}`,
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
