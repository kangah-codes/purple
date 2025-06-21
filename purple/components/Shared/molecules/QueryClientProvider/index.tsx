import React, { PropsWithChildren, useState } from 'react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import {
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientProvider as ReactQueryClientProvider,
} from 'react-query';

export default function AppQueryClientProvider({ children }: PropsWithChildren<{}>) {
    const { logError } = useAnalytics();

    const [queryClient] = useState(
        () =>
            new QueryClient({
                queryCache: new QueryCache({
                    onError: (error, query) => {
                        logError(error as Error, { ...query }, 'error');
                    },
                }),
                mutationCache: new MutationCache({
                    onError: (error, mutation) => {
                        logError(error as Error, { mutation }, 'error');
                    },
                }),
            }),
    );

    return <ReactQueryClientProvider client={queryClient}>{children}</ReactQueryClientProvider>;
}
