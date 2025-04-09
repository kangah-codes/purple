import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import {
    useMutation,
    UseMutationResult,
    useQuery,
    UseQueryOptions,
    UseQueryResult,
} from 'react-query';
import { useStore } from 'zustand';
import { SessionData } from '../Auth/schema';
import { Account } from './schema';
import { createAccountStore } from './state';
import { stringify } from '@/lib/utils/string';
import { ServiceFactory } from '@/lib/factory/ServiceFactory';
import { useSQLiteContext } from 'expo-sqlite';

export function useAccountStore() {
    const [
        accounts,
        setAccounts,
        updateAccounts,
        currentAccount,
        setCurrentAccount,
        currentAccountTransactions,
        setCurrentAccountTransactions,
    ] = useStore(createAccountStore, (state) => [
        state.accounts,
        state.setAccounts,
        state.updateAccounts,
        state.currentAccount,
        state.setCurrentAccount,
        state.currentAccountTransactions,
        state.setCurrentAccountTransactions,
    ]);

    return {
        accounts,
        setAccounts,
        updateAccounts,
        currentAccount,
        setCurrentAccount,
        currentAccountTransactions,
        setCurrentAccountTransactions,
    };
}

export function useAccounts({
    sessionData,
    requestQuery,
    options,
}: {
    sessionData: SessionData;
    requestQuery: RequestParamQuery;
    options?: UseQueryOptions;
}): UseQueryResult<GenericAPIResponse<Account>, Error> {
    const db = useSQLiteContext();
    console.log(db, 'database');
    db.getFirstAsync<{ user_version: number }>('PRAGMA user_version').then((res) => {
        console.log('res', res);
    });
    return useQuery(
        ['accounts', requestQuery],
        async () => {
            const service = await ServiceFactory.create<Account>('accounts', db, sessionData);
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

export function useAccount({
    sessionData,
    options,
    accountID,
}: {
    sessionData: SessionData;
    options?: UseQueryOptions;
    accountID: string;
}): UseQueryResult<GenericAPIResponse<Account>, Error> {
    const db = useSQLiteContext();
    return useQuery(
        [`account-${accountID}`],
        async () => {
            const service = await ServiceFactory.create<Account>('accounts', db, sessionData);
            return service.get(accountID);
        },
        {
            ...(options as Omit<
                UseQueryOptions<any, any, any, any>,
                'queryKey' | 'queryFn' | 'initialData'
            >),
        },
    );
}

export function useAccountGroups({
    sessionData,
    options,
}: {
    sessionData: SessionData;
    options?: UseQueryOptions;
}): UseQueryResult<GenericAPIResponse<string>, Error> {
    return useQuery(
        ['account-groups'],
        async () => {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/utils/account-groups`, {
                method: 'GET',
                headers: {
                    'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                    Authorization: sessionData.access_token,
                },
            });

            const statusCode = res.status;
            const json = await res.json();

            if (!res.ok) {
                const err = new Error(json.message || 'Unknown error occurred');
                // @ts-ignore
                err.statusCode = statusCode;
                throw err;
            }

            return json;
        },
        {
            ...(options as Omit<
                UseQueryOptions<any, any, any, any>,
                'queryKey' | 'queryFn' | 'initialData'
            >),
        },
    );
}

export function useCreateAccount({
    sessionData,
}: {
    sessionData: SessionData;
}): UseMutationResult<GenericAPIResponse<Account>, Error> {
    const db = useSQLiteContext();
    return useMutation(['create-account'], async (accountInformation) => {
        const service = await ServiceFactory.create<Account>('accounts', db, sessionData);
        return service.create(accountInformation as Partial<Account>);
    });
}
