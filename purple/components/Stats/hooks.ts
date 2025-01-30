import { GenericAPIResponse } from '@/@types/request';
import { UseQueryOptions, UseQueryResult, useQuery } from 'react-query';
import { SessionData } from '../Auth/schema';
import { MonthlyStats } from './schema';
import { createStatsStore } from './state';
import { useStore } from 'zustand';

export function useStatsStore() {
    const [stats, setStats, isStatsLoading, setIsStatsLoading] = useStore(
        createStatsStore,
        (state) => [state.stats, state.setStats, state.isStatsLoading, state.setIsStatsLoading],
    );

    return {
        stats,
        setStats,
        isStatsLoading,
        setIsStatsLoading,
    };
}

export function useMonthlyStats({
    sessionData,
    options,
}: {
    sessionData: SessionData;
    options?: UseQueryOptions;
}): UseQueryResult<GenericAPIResponse<MonthlyStats>, Error> {
    return useQuery(
        [`stats`],
        async () => {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/stats`, {
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
