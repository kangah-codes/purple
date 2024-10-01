import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { useStore } from 'zustand';
import { SessionData } from '../Auth/schema';
import { Plan } from './schema';
import { createPlanStore } from './state';
import { stringify } from '@/lib/utils/string';

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
    ] = useStore(createPlanStore, (state) => [
        state.plans,
        state.setPlans,
        state.currentPlan,
        state.setCurrentPlan,
        state.expensePlans,
        state.savingPlans,
        state.setExpensePlans,
        state.setSavingPlans,
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
    };
}

export function usePlans({
    sessionData,
    requestParams,
    options,
}: {
    sessionData: SessionData;
    requestParams: RequestParamQuery;
    options?: UseQueryOptions;
}): UseQueryResult<GenericAPIResponse<Plan[]>, Error> {
    return useQuery(
        ['plans', requestParams],
        async () => {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/plan?${stringify(requestParams)}`,
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
