import * as Sentry from '@sentry/react-native';
import React, { PropsWithChildren, useState } from 'react';
import {
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientProvider as ReactQueryClientProvider,
} from 'react-query';

export default function AppQueryClientProvider({ children }: PropsWithChildren<{}>) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                queryCache: new QueryCache({
                    onError: (error) => {
                        Sentry.captureException(error);
                    },
                }),
                mutationCache: new MutationCache({
                    onError: (error) => {
                        Sentry.captureException(error);
                    },
                }),
            }),
    );

    return <ReactQueryClientProvider client={queryClient}>{children}</ReactQueryClientProvider>;
}
