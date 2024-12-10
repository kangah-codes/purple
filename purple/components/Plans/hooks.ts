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
import { Plan, PlanTransaction } from './schema';
import { createPlanStore } from './state';
import { stringify } from '@/lib/utils/string';
import { Transaction } from '../Transactions/schema';

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

export function useDeletePlan({
    sessionData,
    planID,
}: {
    sessionData: SessionData;
    planID: string;
}): UseMutationResult<GenericAPIResponse<undefined>, Error> {
    return useMutation(['delete-plan'], async () => {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/plan/${planID}`, {
            method: 'DELETE',
            headers: {
                'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                Authorization: sessionData.access_token,
            },
        });

        if (!res.ok) {
            throw new Error(res.status.toString());
        }

        const json = await res.json();
        return json;
    });
}

export function usePlan({
    sessionData,
    options,
    planID,
}: {
    sessionData: SessionData;
    options?: UseQueryOptions;
    planID: string;
}): UseQueryResult<GenericAPIResponse<Plan[]>, Error> {
    return useQuery(
        ['plan'],
        async () => {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/plan/${planID}`, {
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

export function useInfinitePlans({
    sessionData,
    requestQuery,
    options,
}: {
    sessionData: SessionData;
    requestQuery: RequestParamQuery;
    options?: Omit<
        UseInfiniteQueryOptions<GenericAPIResponse<Plan[]>, Error>,
        'queryKey' | 'queryFn'
    >;
}): UseInfiniteQueryResult<GenericAPIResponse<Plan[]>, Error> {
    return useInfiniteQuery<GenericAPIResponse<Plan[]>, Error>(
        ['plans', requestQuery],
        async ({ pageParam = 1 }) => {
            const queryParams = {
                ...requestQuery,
                page: pageParam,
                page_size: requestQuery.page_size || 10,
            };

            const res = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/plan?${stringify(queryParams)}`,
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

export function useCreatePlan({
    sessionData,
}: {
    sessionData: SessionData;
}): UseMutationResult<GenericAPIResponse<Plan>, Error> {
    return useMutation(['create-plan'], async (data) => {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/plan`, {
            method: 'POST',
            headers: {
                'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                Authorization: sessionData.access_token,
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error(res.status.toString());
        }

        const json = await res.json();
        return json;
    });
}

export function useCreatePlanTransaction({
    sessionData,
    planId,
}: {
    sessionData: SessionData;
    planId: string;
}): UseMutationResult<GenericAPIResponse<PlanTransaction>, Error> {
    return useMutation(['create-plan'], async (data) => {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/plan/${planId}/transaction`, {
            method: 'POST',
            headers: {
                'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                Authorization: sessionData.access_token,
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error(res.status.toString());
        }

        const json = await res.json();
        return json;
    });
}

export function useInfinitePlanTransactions({
    sessionData,
    requestQuery,
    options,
    planID,
}: {
    sessionData: SessionData;
    requestQuery: RequestParamQuery;
    options?: Omit<
        UseInfiniteQueryOptions<GenericAPIResponse<PlanTransaction[]>, Error>,
        'queryKey' | 'queryFn'
    >;
    planID: string;
}): UseInfiniteQueryResult<GenericAPIResponse<PlanTransaction[]>, Error> {
    return useInfiniteQuery<GenericAPIResponse<PlanTransaction[]>, Error>(
        ['plan-transactions', requestQuery],
        async ({ pageParam = 1 }) => {
            const queryParams = {
                ...requestQuery,
                page: pageParam,
                page_size: requestQuery.page_size || 10,
            };

            const res = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/plan/${planID}/transactions?${stringify(
                    queryParams,
                )}`,
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
