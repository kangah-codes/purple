import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { useEffect, useMemo } from 'react';
import {
    useInfiniteQuery,
    UseInfiniteQueryOptions,
    UseInfiniteQueryResult,
    useMutation,
    UseMutationResult,
    useQueryClient,
    useQuery,
    UseQueryOptions,
    UseQueryResult,
} from 'react-query';
import { useStore } from 'zustand';
import { SessionData } from '../Auth/schema';
import { CreatePlan, CreatePlanTransaction, Plan, PlanTransaction } from './schema';
import { createNewPlanStore, createPlanStore } from './state';
import { useSQLiteContext } from 'expo-sqlite';
import { useAuth } from '../Auth/hooks';
import {
    BudgetSQLiteService,
    CreateBudgetData,
    Budget,
    BudgetWithDetails,
    BudgetCategoryBudgetStats,
} from '@/lib/services/BudgetSQLiteService';
import {
    differenceInCalendarDays,
    endOfMonth,
    format,
    formatISO,
    getDaysInMonth,
    isSameMonth,
    min,
    startOfMonth,
} from 'date-fns';
import { ServiceFactory } from '@/lib/factory/ServiceFactory';
import { Transaction } from '@/components/Transactions/schema';
import { isTransferTransaction } from '@/components/Transactions/utils';
import { MONTHS } from './constants';
import { getBudgetPaceInsightCopy } from './utils';

export type BudgetPaceInsight = {
    tone: 'negative' | 'positive' | 'neutral';
    title: string;
    message: string;
};

export function useBudgetPaceInsight(
    budget: BudgetWithDetails | null | undefined,
    month: Date,
): BudgetPaceInsight | null {
    return useMemo(() => {
        if (!budget) return null;

        const totalAllocated = budget.summary?.total_allocated ?? 0;
        const totalSpent = budget.summary?.total_spent ?? 0;

        // If there is no allocated budget, we can't compute a meaningful pace.
        if (totalAllocated <= 0) return null;

        const monthStart = startOfMonth(month);
        const currentMonthStart = startOfMonth(new Date());

        // Don't show pace insights for previous months.
        if (monthStart.getTime() < currentMonthStart.getTime()) {
            return null;
        }
        const monthEnd = endOfMonth(monthStart);
        const today = new Date();
        const intervalEnd = isSameMonth(monthStart, today) ? min([today, monthEnd]) : monthEnd;

        const daysInMonth = getDaysInMonth(monthStart);
        const dayIndex = Math.min(
            Math.max(differenceInCalendarDays(intervalEnd, monthStart) + 1, 1),
            daysInMonth,
        );
        const progress = dayIndex / daysInMonth;

        const expectedSpentToDate = totalAllocated * progress;
        const delta = totalSpent - expectedSpentToDate;

        // Category-level pace: compare each category's spend vs proportional expected-to-date.
        const categories = budget.categoryLimits ?? [];
        const pacedCategories = categories.filter((c) => (c.limit_amount ?? 0) > 0);

        const overCategories = pacedCategories.filter((c) => {
            const limit = Number(c.limit_amount) || 0;
            const spent = Number(c.spent_amount) || 0;
            const expected = limit * progress;

            // Allow some slack early in the month to avoid noisy warnings.
            const slack = Math.max(limit * 0.1, totalAllocated * 0.01);
            return spent > expected + slack;
        });

        const overCount = overCategories.length;
        const categoryCount = pacedCategories.length;

        // Overall status based primarily on total spend vs expected-to-date,
        // with category overspends as a secondary signal.
        const overThreshold = expectedSpentToDate * 0.12; // 12% behind pace
        const underThreshold = expectedSpentToDate * 0.15; // 15% ahead/under pace

        if (delta > overThreshold || overCount >= 2) {
            return getBudgetPaceInsightCopy('negative', { overCount, categoryCount });
        }

        if (delta < -underThreshold) {
            return getBudgetPaceInsightCopy('positive', { overCount, categoryCount });
        }

        return getBudgetPaceInsightCopy('neutral', { overCount, categoryCount });
    }, [budget, month]);
}

export function usePrefetchBudgetsForMonths(
    months: Date[],
    options?: { enabled?: boolean; staleTimeMs?: number },
) {
    const db = useSQLiteContext();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (options?.enabled === false) return;
        if (!months.length) return;

        const service = new BudgetSQLiteService(db);
        const staleTime = options?.staleTimeMs ?? 60_000;

        for (const monthDate of months) {
            const monthNumber = monthDate.getMonth() + 1;
            const year = monthDate.getFullYear();
            const monthName = format(monthDate, 'MMMM');

            void queryClient.prefetchQuery(
                ['budget', monthNumber, year],
                () => service.getBudgetForMonth(monthName, year),
                { staleTime },
            );
        }
    }, [db, months, options?.enabled, options?.staleTimeMs, queryClient]);
}

export function useCreateNewPlanStore() {
    const [
        amount,
        startDate,
        endDate,
        categories,
        setAmount,
        setStartDate,
        setEndDate,
        setCategories,
        reset,
        addCategory,
        removeCategory,
        updateCategory,
    ] = useStore(createNewPlanStore, (state) => [
        state.amount,
        state.startDate,
        state.endDate,
        state.categories,
        state.setAmount,
        state.setStartDate,
        state.setEndDate,
        state.setCategories,
        state.reset,
        state.addCategory,
        state.removeCategory,
        state.updateCategory,
    ]);

    return {
        amount,
        startDate,
        endDate,
        categories,
        setAmount,
        setStartDate,
        setEndDate,
        setCategories,
        reset,
        addCategory,
        removeCategory,
        updateCategory,
    };
}

export function usePlanStore() {
    const [
        plans,
        setPlans,
        currentPlan,
        setCurrentPlan,
        expensePlans,
        savingPlans,
        setExpensePlans,
        setSavingPlans,
        updateExpenseplans,
        updateSavingPlans,
        removeSavingPlan,
        removeExpensePlan,
    ] = useStore(createPlanStore, (state) => [
        state.plans,
        state.setPlans,
        state.currentPlan,
        state.setCurrentPlan,
        state.expensePlans,
        state.savingPlans,
        state.setExpensePlans,
        state.setSavingPlans,
        state.updateExpenseplans,
        state.updateSavingPlans,
        state.removeSavingPlan,
        state.removeExpensePlan,
    ]);

    return {
        plans,
        setPlans,
        currentPlan,
        setCurrentPlan,
        expensePlans,
        savingPlans,
        setExpensePlans,
        setSavingPlans,
        updateExpenseplans,
        updateSavingPlans,
        removeSavingPlan,
        removeExpensePlan,
    };
}

export function usePlans({
    requestQuery,
    options,
}: {
    requestQuery: RequestParamQuery;
    options?: UseQueryOptions;
}): UseQueryResult<GenericAPIResponse<Plan[]>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useQuery(
        ['plans', requestQuery],
        async () => {
            const service = ServiceFactory.create<Plan>('plans', db, sessionData);
            return service.list(requestQuery);
        },
        {
            ...(options as Omit<
                UseQueryOptions<any, any, any, any>,
                'queryKey' | 'queryFn' | 'initialData'
            >),
            onError: (error) => {
                console.error('[usePlans] Error fetching plans:', error);
                options?.onError?.(error);
            },
        },
    );
}

export function useDeletePlan({
    planID,
}: {
    planID: string;
}): UseMutationResult<GenericAPIResponse<null>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useMutation(['delete-plan'], async () => {
        const service = ServiceFactory.create<Plan>('plans', db, sessionData);
        return service.delete(planID);
    });
}

export function usePlan({
    options,
    planID,
}: {
    options?: UseQueryOptions;
    planID: string;
}): UseQueryResult<GenericAPIResponse<Plan>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useQuery(
        [`plan-${planID}`],
        async () => {
            const service = ServiceFactory.create<Plan>('plans', db, sessionData);
            return service.get(planID);
        },
        {
            ...(options as Omit<
                UseQueryOptions<any, any, any, any>,
                'queryKey' | 'queryFn' | 'initialData'
            >),
            onError: (error) => {
                console.error(`[usePlan] Error fetching plan ${planID}:`, error);
                options?.onError?.(error);
            },
        },
    );
}

export function usePlanStatus({
    sessionData,
    options,
    planID,
}: {
    sessionData: SessionData;
    options?: UseQueryOptions;
    planID: string;
}): UseQueryResult<GenericAPIResponse<unknown>, Error> {
    return useQuery(
        [`plan-${planID}-status`],
        async () => {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/plan/${planID}/track-status`,
                {
                    method: 'GET',
                    headers: {
                        'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                        Authorization: sessionData.access_token,
                    },
                },
            );

            const statusCode = res.status;
            const json = await res.json();

            if (!res.ok) {
                const err = new Error(json.message || 'Unknown error occurred');
                // @ts-expect-error expect
                err.statusCode = statusCode;
                console.error(`[usePlanStatus] Error fetching status for plan ${planID}:`, json);
                throw err;
            }

            return json;
        },
        {
            ...(options as Omit<
                UseQueryOptions<any, any, any, any>,
                'queryKey' | 'queryFn' | 'initialData'
            >),
            onError: (error) => {
                console.error(`[usePlanStatus] Error fetching status for plan ${planID}:`, error);
                options?.onError?.(error);
            },
        },
    );
}

export function useInfinitePlans({
    requestQuery,
    options,
}: {
    requestQuery: RequestParamQuery;
    options?: Omit<
        UseInfiniteQueryOptions<GenericAPIResponse<Plan[]>, Error>,
        'queryKey' | 'queryFn'
    >;
}): UseInfiniteQueryResult<GenericAPIResponse<Plan[]>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useInfiniteQuery<GenericAPIResponse<Plan[]>, Error>(
        ['plans', requestQuery],
        async ({ pageParam = 1 }) => {
            const queryParams = {
                ...requestQuery,
                page: pageParam,
                page_size: requestQuery.page_size || 10,
            };

            const service = ServiceFactory.create<Plan>('plans', db, sessionData);
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
            enabled: !!sessionData,
            onError: (error) => {
                console.error('[useInfinitePlans] Error fetching plans:', error);
                options?.onError?.(error);
            },
        },
    );
}

export function useCreatePlan(): UseMutationResult<GenericAPIResponse<Plan>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useMutation(['create-plan'], async (data) => {
        const service = ServiceFactory.create<Plan>('plans', db, sessionData);
        return service.create(data as CreatePlan);
    });
}

// todo: refactor this to take the data in one object and not pass plandata
export function useCreatePlanTransaction({
    planData,
}: {
    planData: { type: Plan['type']; id: string; name: string };
}): UseMutationResult<GenericAPIResponse<PlanTransaction>, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    return useMutation(['create-plan'], async (data) => {
        const service = ServiceFactory.create<Plan>('plans', db, sessionData);
        const planService = service as typeof service & {
            createTransaction(
                data: CreatePlanTransaction,
                planData: { type: Plan['type']; id: string; name: string },
            ): Promise<GenericAPIResponse<PlanTransaction>>;
        };
        return planService.createTransaction(data as CreatePlanTransaction, planData);
    });
}

export function useCreateBudget(): UseMutationResult<
    GenericAPIResponse<Budget>,
    Error,
    CreateBudgetData
> {
    const db = useSQLiteContext();

    return useMutation(['create-budget'], async (data: CreateBudgetData) => {
        const service = new BudgetSQLiteService(db);
        return service.create(data);
    });
}

export function useBudgetForMonth(
    month: number,
    year: number,
): UseQueryResult<GenericAPIResponse<BudgetWithDetails | null>, Error> {
    const db = useSQLiteContext();

    const getMonthName = (monthNumber: number): string => {
        return MONTHS[monthNumber - 1];
    };

    return useQuery(
        ['budget', month, year],
        async () => {
            const service = new BudgetSQLiteService(db);
            return service.getBudgetForMonth(getMonthName(month), year);
        },
        {
            enabled: month > 0 && month <= 12,
        },
    );
}

// TODO: abstract these back into service functions
export function useHasAnyBudgets(): UseQueryResult<boolean, Error> {
    const db = useSQLiteContext();

    return useQuery(['budgets-exists'], async () => {
        try {
            const row = await db.getFirstAsync<{ has_budget: number }>(
                `SELECT 1 as has_budget FROM budgets WHERE deleted_at IS NULL LIMIT 1`,
            );
            return !!row?.has_budget;
        } catch (error) {
            // if tables arent initialized yet treat as none
            if (String(error).includes('no such table')) return false;
            throw error;
        }
    });
}

export function useBudgetCategoryStats(
    category: string | undefined,
): UseQueryResult<BudgetCategoryBudgetStats, Error> {
    const db = useSQLiteContext();

    return useQuery(
        ['budget-category-stats', category],
        async () => {
            if (!category) {
                return { lastMonthBudgeted: 0, averageBudgeted: 0 };
            }
            const service = new BudgetSQLiteService(db);
            const res = await service.getCategoryBudgetStats(category);
            return res.data;
        },
        {
            enabled: !!category,
        },
    );
}

/**
 * Hook to calculate earned income for a budget period.
 * Calculates the sum of credit transactions (excluding transfers) within the budget's month/year.
 */
export function useBudgetEarnedIncome(
    month: string | undefined,
    year: number | undefined,
): UseQueryResult<number, Error> {
    const db = useSQLiteContext();
    const { sessionData } = useAuth();

    const getMonthIndex = (monthName: string): number => {
        return MONTHS.indexOf(monthName);
    };

    return useQuery(
        ['budget-earned-income', month, year],
        async () => {
            if (!month || !year) return 0;

            const monthIndex = getMonthIndex(month);
            if (monthIndex === -1) return 0;

            const budgetDate = new Date(year, monthIndex, 1);
            const startDate = formatISO(startOfMonth(budgetDate));
            const endDate = formatISO(endOfMonth(budgetDate));

            const service = ServiceFactory.create<Transaction>('transactions', db, sessionData);
            const response = await service.list({
                start_date: startDate,
                end_date: endDate,
                type: 'credit',
                page_size: Infinity,
            });

            const transactions = response.data || [];
            const earnedIncome = transactions
                .filter((t) => !isTransferTransaction(t))
                .reduce((sum, t) => sum + Number(t.amount), 0);

            return earnedIncome;
        },
        {
            enabled: !!month && !!year,
        },
    );
}
