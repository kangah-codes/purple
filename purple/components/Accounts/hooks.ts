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
import { useTransactions } from '../Transactions/hooks';
import { Transaction } from '../Transactions/schema';
import { Account, AccountDataCalculation, EditAccount, TimePeriod } from './schema';
import { createAccountsReportStore, createAccountStore } from './state';
import { getEffectiveBalance, groupAccountsByCategory, isLiabilityAccount } from './utils';

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
            onError: (error) => {
                console.error('[useAccounts] Error fetching accounts:', error);
                options?.onError?.(error);
            },
        },
    );
}

export function useHasAnyAccounts(): UseQueryResult<boolean, Error> {
    const db = useSQLiteContext();

    return useQuery(['accounts-exists'], async () => {
        try {
            const row = await db.getFirstAsync<{ has_account: number }>(
                // Exclude the default Cash account created on first run
                // only conside this complete if user has added at least one non default account
                `SELECT 1 as has_account
                 FROM accounts
                 WHERE deleted_at IS NULL
                   AND COALESCE(is_default_account, 0) = 0
                 LIMIT 1`,
            );
            return !!row?.has_account;
        } catch (error) {
            // if tables arent initialized yet treat as none
            if (String(error).includes('no such table')) return false;
            throw error;
        }
    });
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
            onError: (error) => {
                console.error(`[useAccount] Error fetching account ${accountID}:`, error);
                options?.onError?.(error);
            },
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

export function useEditAccount(): UseMutationResult<
    GenericAPIResponse<Account>,
    Error,
    {
        id: string;
        data: EditAccount;
    }
> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useMutation(['edit-account'], async ({ id, data }) => {
        const service = ServiceFactory.create<Account>('accounts', db, sessionData);
        return service.update(id, data);
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

    // Memoize grouped accounts to avoid recalculation
    const groupedAccounts = useMemo(() => groupAccountsByCategory(accounts), [accounts]);

    // Memoize relevant accounts selection
    const relevantAccounts = useMemo(() => {
        if (accountGroup && accountGroup !== '📈 NET WORTH') {
            return groupedAccounts[accountGroup] || [];
        }
        return accounts;
    }, [accountGroup, groupedAccounts, accounts]);

    // Memoize account IDs set for faster lookup
    const relevantAccountIds = useMemo(
        () => new Set(relevantAccounts.map((a) => a.id)),
        [relevantAccounts],
    );

    // Filter transactions once and memoize
    const filteredTransactions = useMemo(() => {
        if (!relevantAccountIds.size) return [];
        return transactions.filter(
            (tx) =>
                relevantAccountIds.has(tx.account_id) &&
                new Date(tx.created_at) >= start_date &&
                new Date(tx.created_at) <= end_date,
        );
    }, [transactions, relevantAccountIds, start_date, end_date]);

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

            // calc balance at the start of the period - use pre-filtered transactions
            const previousBalance = relevantAccounts.reduce((sum, account) => {
                // get transactions for this account within the time period
                const accountTransactions = filteredTransactions.filter(
                    (tx) => tx.account_id === account.id,
                );

                // calc the account balance at the start of the period
                const transactionSum = accountTransactions.reduce((txSum, tx) => {
                    const isLiability = isLiabilityAccount(account.category);

                    // For liability accounts, reverse the logic:
                    // - Credit increases liability (negative impact on net worth)
                    // - Debit decreases liability (positive impact on net worth)
                    if (isLiability) {
                        return txSum + (tx.type === 'credit' ? -tx.amount : tx.amount);
                    } else {
                        // For asset accounts, normal logic:
                        // - Credit increases balance
                        // - Debit decreases balance
                        return txSum + (tx.type === 'credit' ? tx.amount : -tx.amount);
                    }
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

            // Handle percentage change calculation with safeguards for very small balances
            let percentageChange: number;
            const minThreshold = 0.01; // Minimum balance threshold for meaningful percentage calculation

            if (Math.abs(previousBalance) < minThreshold) {
                // If previous balance is very small, treat it as zero
                percentageChange = 0;
            } else {
                const rawPercentage = (absoluteChange / Math.abs(previousBalance)) * 100;
                // Cap the percentage at a reasonable maximum to avoid extreme values
                const maxPercentage = 10000; // 10,000% maximum
                percentageChange = Math.max(-maxPercentage, Math.min(maxPercentage, rawPercentage));
            }

            const formattedPercentageChange = Number(percentageChange.toFixed(1));

            let trend: 'increase' | 'decrease' | 'neutral';
            if (Math.abs(percentageChange) < 0.01) {
                trend = 'neutral';
            } else if (absoluteChange > 0) {
                trend = 'increase';
            } else {
                trend = 'decrease';
            }

            const transformedTransactions =
                accountGroup && !accountGroup.includes('Liability')
                    ? transactions.map((tx) => {
                          const account = accounts.find((acc) => acc.id === tx.account_id);
                          if (account && isLiabilityAccount(account.category)) {
                              return {
                                  ...tx,
                                  type:
                                      tx.type === 'credit'
                                          ? ('debit' as const)
                                          : ('credit' as const),
                              };
                          }
                          return tx;
                      })
                    : transactions;

            return {
                currentBalance,
                previousBalance,
                absoluteChange,
                percentageChange: formattedPercentageChange,
                trend,
                currency: preferredCurrency,
                isLoading: false,
                transactions: transformedTransactions,
            };
        } catch (error) {
            console.error('[useCalculateAccountData] Error calculating account data:', error);
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
    }, [
        relevantAccounts,
        filteredTransactions,
        accounts,
        transactions,
        preferredCurrency,
        isLoading,
        accountGroup,
    ]);
}
