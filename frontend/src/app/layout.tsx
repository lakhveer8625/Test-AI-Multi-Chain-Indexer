import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Multi-Chain Event Indexer | Enterprise Blockchain Analytics',
    description: 'High-throughput, fault-tolerant multi-chain blockchain event indexing platform',
    keywords: ['blockchain', 'indexer', 'ethereum', 'solana', 'events', 'analytics'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
