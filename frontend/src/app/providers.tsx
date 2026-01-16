'use client'

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    const [apolloClient] = useState(() =>
        new ApolloClient({
            uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
            cache: new InMemoryCache(),
        })
    )

    return (
        <QueryClientProvider client={queryClient}>
            <ApolloProvider client={apolloClient}>
                {children}
            </ApolloProvider>
        </QueryClientProvider>
    )
}
