import React, { PropsWithChildren, useState } from 'react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { QueryClient, QueryClientProvider as ReactQueryClientProvider } from 'react-query';

export default function AppQueryClientProvider({ children }: PropsWithChildren<{}>) {
    const { logError } = useAnalytics();

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false,
                        onError: (err: unknown) => {
                            // @ts-expect-error
                            logError(err, {}, 'error');
                        },
                    },
                    mutations: {
                        onError: (err: unknown) => {
                            // @ts-expect-error
                            logError(err, {}, 'error');
                        },
                    },
                },
            }),
    );

    return <ReactQueryClientProvider client={queryClient}>{children}</ReactQueryClientProvider>;
}
