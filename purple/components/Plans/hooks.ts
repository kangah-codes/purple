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
import { CreatePlan, CreatePlanTransaction, Plan, PlanTransaction } from './schema';
import { createNewPlanStore, createPlanStore } from './state';
import { useSQLiteContext } from 'expo-sqlite';
import { useAuth } from '../Auth/hooks';
import {
    BudgetSQLiteService,
    CreateBudgetData,
    Budget,
    BudgetWithDetails,
} from '@/lib/services/BudgetSQLiteService';
import { startOfMonth, endOfMonth } from 'date-fns';
import { ServiceFactory } from '@/lib/factory/ServiceFactory';
import { Transaction } from '@/components/Transactions/schema';
import { isTransferTransaction } from '@/components/Transactions/utils';

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
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        return months[monthNumber - 1];
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
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        return months.indexOf(monthName);
    };

    return useQuery(
        ['budget-earned-income', month, year],
        async () => {
            if (!month || !year) return 0;

            const monthIndex = getMonthIndex(month);
            if (monthIndex === -1) return 0;

            const budgetDate = new Date(year, monthIndex, 1);
            const startDate = startOfMonth(budgetDate).toISOString();
            const endDate = endOfMonth(budgetDate).toISOString();

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
