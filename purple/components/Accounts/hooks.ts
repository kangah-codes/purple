import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { useStore } from 'zustand';
import { SessionData } from '../Auth/schema';
import { Account } from './schema';
import { createAccountStore } from './state';

export function useAccountStore() {
    const [accounts, setAccounts] = useStore(createAccountStore, (state) => [
        state.accounts,
        state.setAccounts,
    ]);

    return {
        accounts,
        setAccounts,
    };
}

export function useAccounts({
    sessionData,
    requestParams,
    options,
}: {
    sessionData: SessionData;
    requestParams: RequestParamQuery;
    options?: UseQueryOptions;
}): UseQueryResult<GenericAPIResponse<Account>, Error> {
    return useQuery(
        ['accounts', requestParams],
        async () => {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/account`, {
                method: 'GET',
                headers: {
                    'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                    Authorization: sessionData.access_token,
                },
            });

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
