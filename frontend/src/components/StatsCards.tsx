'use client'

import { useQuery } from '@tanstack/react-query'
import { Activity, TrendingUp, Blocks, Zap, Landmark } from 'lucide-react'

async function fetchStats() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    const [events, txs, blocks, chains] = await Promise.all([
        fetch(`${apiUrl}/api/events?limit=1`).then(r => r.json()),
        fetch(`${apiUrl}/api/transactions?limit=1`).then(r => r.json()),
        fetch(`${apiUrl}/api/blocks?limit=1`).then(r => r.json()),
        fetch(`${apiUrl}/api/chains`).then(r => r.json()),
    ])

    return {
        totalEvents: events.pagination?.total || 0,
        totalTransactions: txs.pagination?.total || 0,
        totalBlocks: blocks.pagination?.total || 0,
        activeChains: Array.isArray(chains) ? chains.length : 0,
    }
}

export function StatsCards() {
    const { data, isLoading } = useQuery({
        queryKey: ['stats'],
        queryFn: fetchStats,
        refetchInterval: 10000,
    })

    const stats = [
        {
            name: 'Total Events',
            value: data?.totalEvents.toLocaleString() || '0',
            icon: Activity,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
        },
        {
            name: 'Transactions',
            value: data?.totalTransactions.toLocaleString() || '0',
            icon: Landmark,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
        },
        {
            name: 'Total Blocks',
            value: data?.totalBlocks.toLocaleString() || '0',
            icon: Blocks,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
        },
        {
            name: 'Active Chains',
            value: data?.activeChains || '0',
            icon: TrendingUp,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
                const Icon = stat.icon
                return (
                    <div
                        key={stat.name}
                        className="glass-card p-6 rounded-3xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} border border-white/5`}>
                                <Icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div className="flex items-center space-x-1 text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                <Zap className="w-3 h-3" />
                                <span>Live</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm font-semibold tracking-wide uppercase">{stat.name}</p>
                            <p className="text-3xl font-black mt-1 text-white tracking-tight">
                                {isLoading ? (
                                    <div className="h-9 w-24 bg-dark-700 rounded-lg animate-pulse" />
                                ) : (
                                    stat.value
                                )}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
