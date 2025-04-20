import { GenericAPIResponse } from '@/@types/request';
import { ServiceFactory } from '@/lib/factory/ServiceFactory';
import { useSQLiteContext } from 'expo-sqlite';
import { UseQueryOptions, UseQueryResult, useQuery } from 'react-query';
import { useStore } from 'zustand';
import { Account } from '../Accounts/schema';
import { useAuth } from '../Auth/hooks';
import { User } from '../Auth/schema';
import { Plan } from '../Plans/schema';
import { Transaction } from '../Transactions/schema';
import { createUserStore } from './state';

export function useUserStore() {
    const [user, setUser, reset] = useStore(createUserStore, (state) => [
        state.user,
        state.setUser,
        state.reset,
    ]);

    return {
        user,
        reset,
        setUser,
    };
}

// TODO: rename this hook
export function useUser({
    options,
}: {
    options?: UseQueryOptions;
}): UseQueryResult<GenericAPIResponse<User>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useQuery(
        ['user'],
        async () => {
            const planService = await ServiceFactory.create<Plan>('plans', db, sessionData);
            const transactionService = await ServiceFactory.create<Transaction>(
                'transactions',
                db,
                sessionData,
            );
            const accountService = await ServiceFactory.create<Account>(
                'accounts',
                db,
                sessionData,
            );

            const [accounts, transactions, plans] = await Promise.all([
                accountService.list({
                    page_size: 99,
                    page: 1,
                }),
                transactionService.list({
                    page_size: 10,
                    page: 1,
                }),
                planService.list({
                    page_size: 5,
                    page: 1,
                }),
            ]).catch(() => {
                throw new Error("Couldn't fetch your data");
            });

            return {
                data: {
                    accounts: accounts.data,
                    transactions: transactions.data,
                    plans: plans.data,
                },
            };
        },
        {
            ...(options as Omit<
                UseQueryOptions<any, any, any, any>,
                'queryKey' | 'queryFn' | 'initialData'
            >),
        },
    ) as UseQueryResult<GenericAPIResponse<User>, Error>;
}
