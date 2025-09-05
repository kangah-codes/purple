import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { ServiceFactory } from '@/lib/factory/ServiceFactory';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import CurrencyService from '@/lib/services/CurrencyService';
import { getDateRange } from '@/lib/utils/date';
import HTTPError from '@/lib/utils/error';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';
import {
    useMutation,
    UseMutationResult,
    useQuery,
    UseQueryOptions,
    UseQueryResult,
} from 'react-query';
import { useStore } from 'zustand';
import { useAuth } from '../Auth/hooks';
import { usePreferences } from '../Settings/hooks';
import { CurrencyCode } from '../Settings/molecules/ExchangeRateItem';
import { useTransactions } from '../Transactions/hooks';
import { Transaction } from '../Transactions/schema';
import { Account, TimePeriod } from './schema';
import { createAccountsReportStore, createAccountStore } from './state';
import { getEffectiveBalance, groupAccountsByCategory } from './utils';

export function useAccountStore() {
    const [
        accounts,
        setAccounts,
        updateAccounts,
        getAccountById,
        currentAccount,
        setCurrentAccount,
        currentAccountTransactions,
        currentAccountRequestParams,
        setCurrentAccountTransactions,
        setCurrentAccountRequestParams,
    ] = useStore(createAccountStore, (state) => [
        state.accounts,
        state.setAccounts,
        state.updateAccounts,
        state.getAccountById,
        state.currentAccount,
        state.setCurrentAccount,
        state.currentAccountTransactions,
        state.currentAccountRequestParams,
        state.setCurrentAccountTransactions,
        state.setCurrentAccountRequestParams,
    ]);

    return {
        accounts,
        setAccounts,
        getAccountById,
        updateAccounts,
        currentAccount,
        setCurrentAccount,
        currentAccountTransactions,
        currentAccountRequestParams,
        setCurrentAccountTransactions,
        setCurrentAccountRequestParams,
    };
}

export function useAccountReportStore() {
    const [category, setCategory, period, setPeriod, showChart, setShowChart] = useStore(
        createAccountsReportStore,
        ({ category, setCategory, period, setTimePeriod, showChart, setShowChart }) => [
            category,
            setCategory,
            period,
            setTimePeriod,
            showChart,
            setShowChart,
        ],
    );

    return {
        category,
        setCategory,
        period,
        setPeriod,
        showChart,
        setShowChart,
    };
}

export function useAccounts({
    requestQuery,
    options,
}: {
    requestQuery: RequestParamQuery;
    options?: UseQueryOptions;
}): UseQueryResult<GenericAPIResponse<Account[]>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useQuery(
        ['accounts', requestQuery],
        async () => {
            const service = ServiceFactory.create<Account>('accounts', db, sessionData);
            return service.list(requestQuery);
        },
        {
            ...(options as Omit<
                UseQueryOptions<
                    GenericAPIResponse<Account[]>,
                    Error,
                    GenericAPIResponse<Account[]>,
                    [string, RequestParamQuery]
                >,
                'queryKey' | 'queryFn' | 'initialData'
            >),
        },
    );
}

export function useAccount({
    options,
    accountID,
}: {
    options?: UseQueryOptions;
    accountID: string;
}): UseQueryResult<GenericAPIResponse<Account>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useQuery(
        [`account-${accountID}`],
        async () => {
            const service = ServiceFactory.create<Account>('accounts', db, sessionData);
            return service.get(accountID);
        },
        {
            ...(options as Omit<
                UseQueryOptions<
                    GenericAPIResponse<Account>,
                    Error,
                    GenericAPIResponse<Account>,
                    [string]
                >,
                'queryKey' | 'queryFn' | 'initialData'
            >),
        },
    );
}

export function useCreateAccount(): UseMutationResult<GenericAPIResponse<Account>, HTTPError> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useMutation(['create-account'], async (accountInformation) => {
        const service = ServiceFactory.create<Account>('accounts', db, sessionData);
        return service.create(accountInformation as Partial<Account>);
    });
}

export function useDeleteAccount({
    id,
}: {
    id: string;
}): UseMutationResult<GenericAPIResponse<null>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useMutation(['delete-account'], async () => {
        const service = ServiceFactory.create<Transaction>('accounts', db, sessionData);
        return service.delete(id);
    });
}

export interface AccountDataCalculation {
    currentBalance: number;
    previousBalance: number;
    absoluteChange: number;
    percentageChange: number;
    trend: 'increase' | 'decrease' | 'neutral';
    currency: CurrencyCode;
    isLoading: boolean;
    error?: string;
    transactions: Transaction[];
}

export function useCalculateAccountData({
    accountGroup,
    timePeriod,
}: {
    accountGroup?: string;
    timePeriod: TimePeriod;
}): AccountDataCalculation {
    const {
        preferences: { currency: preferredCurrency },
    } = usePreferences();
    const { startDate: start_date, endDate: end_date } = getDateRange(timePeriod);
    const currencyService = CurrencyService.getInstance();

    const {
        data: accountsData,
        isLoading: accountsLoading,
        refetch: refetchAccounts,
    } = useAccounts({
        requestQuery: {},
    });

    const {
        data: transactionsData,
        isLoading: transactionsLoading,
        refetch: refetchTransactions,
    } = useTransactions({
        requestQuery: {
            page_size: Infinity,
            start_date: start_date.toISOString(),
            end_date: end_date.toISOString(),
            ...(accountGroup !== '📈 NET WORTH' && { accountGroup }),
        },
    });

    useRefreshOnFocus(refetchAccounts);
    useRefreshOnFocus(refetchTransactions);

    const isLoading = accountsLoading || transactionsLoading;
    const accounts = accountsData?.data || [];
    const transactions = transactionsData?.data || [];

    // @ts-expect-error ignore
    return useMemo(() => {
        if (isLoading) {
            return {
                currentBalance: 0,
                previousBalance: 0,
                absoluteChange: 0,
                percentageChange: 0,
                trend: 'neutral' as const,
                currency: preferredCurrency,
                isLoading: true,
                transactions,
            };
        }

        try {
            let relevantAccounts = accounts;
            if (accountGroup && accountGroup !== '📈 NET WORTH') {
                // TODO: fix import cycle
                const groupedAccounts = groupAccountsByCategory(accounts);
                relevantAccounts = groupedAccounts[accountGroup] || [];
            }

            if (relevantAccounts.length === 0) {
                return {
                    currentBalance: 0,
                    previousBalance: 0,
                    absoluteChange: 0,
                    percentageChange: 0,
                    trend: 'neutral' as const,
                    currency: preferredCurrency,
                    isLoading: false,
                    transactions,
                };
            }

            // calc current balance (convert all to preferred currency)
            const currentBalance = relevantAccounts.reduce((sum, account) => {
                const effectiveBalance = getEffectiveBalance(account);
                const converted = currencyService.convertCurrencySync({
                    from: { currency: account.currency, amount: effectiveBalance },
                    // @ts-expect-error ignore
                    to: { currency: preferredCurrency },
                });
                return sum + converted;
            }, 0);

            // calc balance at the start of the period
            const previousBalance = relevantAccounts.reduce((sum, account) => {
                // get transactions for this account within the time period
                const accountTransactions = transactions.filter(
                    (tx) =>
                        tx.account_id === account.id &&
                        new Date(tx.created_at) >= start_date &&
                        new Date(tx.created_at) <= end_date,
                );

                // calc the account balance at the start of the period
                const transactionSum = accountTransactions.reduce((txSum, tx) => {
                    return txSum + (tx.type === 'credit' ? tx.amount : -tx.amount);
                }, 0);

                const balanceAtStart = getEffectiveBalance(account) - transactionSum;

                // convert to preferred currency
                const converted = currencyService.convertCurrencySync({
                    from: { currency: account.currency, amount: balanceAtStart },
                    // @ts-expect-error ignore
                    to: { currency: preferredCurrency.toLowerCase() },
                });

                return sum + converted;
            }, 0);

            const absoluteChange = currentBalance - previousBalance;
            const percentageChange = (
                previousBalance !== 0 ? (absoluteChange / Math.abs(previousBalance)) * 100 : 0
            ).toFixed(1);

            let trend: 'increase' | 'decrease' | 'neutral';
            if (Math.abs(Number(percentageChange)) < 0.01) {
                trend = 'neutral';
            } else if (absoluteChange > 0) {
                trend = 'increase';
            } else {
                trend = 'decrease';
            }

            return {
                currentBalance,
                previousBalance,
                absoluteChange,
                percentageChange:
                    Number(percentageChange) % 1 === 0
                        ? Number(percentageChange)
                        : percentageChange,
                trend,
                currency: preferredCurrency,
                isLoading: false,
                transactions,
            };
        } catch (error) {
            console.error('Error calculating account data:', error);
            return {
                currentBalance: 0,
                previousBalance: 0,
                absoluteChange: 0,
                percentageChange: 0,
                trend: 'neutral' as const,
                currency: preferredCurrency,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                transactions,
            };
        }
    }, [accountGroup, timePeriod, accounts, transactions, preferredCurrency, isLoading]);
}
