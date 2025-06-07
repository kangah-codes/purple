import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { stringify } from '@/lib/utils/string';
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
import { createPlanStore } from './state';
import { useSQLiteContext } from 'expo-sqlite';
import { ServiceFactory } from '@/lib/factory/ServiceFactory';
import { useAuth } from '../Auth/hooks';

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
    sessionData,
    requestQuery,
    options,
}: {
    sessionData: SessionData;
    requestQuery: RequestParamQuery;
    options?: UseQueryOptions;
}): UseQueryResult<GenericAPIResponse<Plan[]>, Error> {
    return useQuery(
        ['plans', requestQuery],
        async () => {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/plan?${stringify(requestQuery)}`,
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
