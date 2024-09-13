import { useStore } from 'zustand';
import { createUserStore } from './state';
import { SessionData, User } from '../Auth/schema';
import { RequestParamQuery, GenericAPIResponse } from '@/@types/request';
import { UseQueryOptions, UseQueryResult, useQuery } from 'react-query';
import { stringify } from '@/lib/utils/string';

export function useUserStore() {
    const [user, setUser] = useStore(createUserStore, (state) => [state.user, state.setUser]);

    return {
        user,
        setUser,
    };
}

export function useUser({
    sessionData,
    options,
    id,
}: {
    sessionData: SessionData;
    options?: UseQueryOptions;
    id: number | string | undefined;
}): UseQueryResult<GenericAPIResponse<User>, Error> {
    return useQuery(
        ['user', id],
        async () => {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user/${id}`, {
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
