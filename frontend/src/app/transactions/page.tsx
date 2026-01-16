'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Landmark, Filter, ChevronLeft, ChevronRight, Hash, Clock, User, ArrowRight, Blocks } from 'lucide-react'
import { useState } from 'react'
import { Navbar } from '@/components/Navbar'

async function fetchChains() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/api/chains`)
    return response.json()
}

async function fetchTransactions(params: any) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const queryParams = new URLSearchParams(params)
    const response = await fetch(`${apiUrl}/api/transactions?${queryParams}`)
    return response.json()
}

export default function TransactionsPage() {
    const [filters, setFilters] = useState({
        chainId: '',
        search: '',
        limit: 50,
        offset: 0,
    })

    const { data: chainsData } = useQuery({
        queryKey: ['chains'],
        queryFn: fetchChains,
    })

    const { data, isLoading } = useQuery({
        queryKey: ['transactions', filters],
        queryFn: () => fetchTransactions(filters),
        refetchInterval: 5000,
    })

    const transactions = data?.data || []
    const pagination = data?.pagination || {}
    const chains = chainsData || []

    const formatAddress = (address: string) => {
        if (!address) return 'N/A'
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const formatValue = (value: string, chainId: string) => {
        try {
            if (!value) return '0'
            // Simplified: treat as 18 decimals for most, adapt if needed
            const val = BigInt(value)
            const divisor = BigInt(10 ** 18)
            const integerPart = val / divisor
            const fractionalPart = val % divisor

            if (integerPart === 0n && fractionalPart > 0n) {
                return `< 0.001`
            }
            return integerPart.toString()
        } catch (e) {
            return value
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-12">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 rounded-2xl bg-primary-500/10 border border-primary-500/20">
                            <Landmark className="w-8 h-8 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold gradient-text">Transactions</h2>
                            <p className="text-dark-400 mt-1 text-lg">Real-time multi-chain transaction monitoring</p>
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <div className="glass p-6 rounded-2xl border border-dark-700/50 mb-8 backdrop-blur-md">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-bold text-dark-500 uppercase tracking-widest ml-1">Search Any</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by hash, address or block number..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value, offset: 0 })}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500/50 focus:outline-none transition-all placeholder:text-dark-600 font-medium"
                                />
                                <Hash className="w-5 h-5 text-dark-500 absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                        <div className="md:w-64 space-y-2">
                            <label className="text-xs font-bold text-dark-500 uppercase tracking-widest ml-1">Network</label>
                            <select
                                value={filters.chainId}
                                onChange={(e) => setFilters({ ...filters, chainId: e.target.value, offset: 0 })}
                                className="w-full px-4 py-3.5 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500/50 focus:outline-none transition-all appearance-none cursor-pointer font-medium"
                            >
                                <option value="">All Networks</option>
                                {chains.map((chain: any) => (
                                    <option key={chain.chain_id} value={chain.chain_id}>
                                        {chain.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:w-40 space-y-2">
                            <label className="text-xs font-bold text-dark-500 uppercase tracking-widest ml-1">Per Page</label>
                            <select
                                value={filters.limit}
                                onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), offset: 0 })}
                                className="w-full px-4 py-3.5 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500/50 focus:outline-none transition-all appearance-none cursor-pointer font-medium"
                            >
                                <option value="25">25 items</option>
                                <option value="50">50 items</option>
                                <option value="100">100 items</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="glass rounded-3xl border border-dark-700/50 overflow-hidden backdrop-blur-md">
                    {isLoading ? (
                        <div className="p-12 space-y-6">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse flex space-x-6 items-center">
                                    <div className="w-12 h-12 bg-dark-700 rounded-2xl"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-dark-700 rounded w-1/4"></div>
                                        <div className="h-4 bg-dark-700 rounded w-1/2"></div>
                                    </div>
                                    <div className="w-24 h-8 bg-dark-700 rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="p-20 text-center">
                            <Landmark className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-dark-300">No transactions found</h3>
                            <p className="text-dark-500">Try adjusting your filters or wait for new data.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-dark-700/50">
                            {transactions.map((tx: any) => (
                                <div
                                    key={tx.id}
                                    className="p-6 hover:bg-white/[0.02] transition-colors group cursor-default"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center space-x-6">
                                            <div className="w-12 h-12 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center group-hover:border-primary-500/30 group-hover:bg-primary-500/5 transition-all">
                                                <Hash className="w-5 h-5 text-dark-400 group-hover:text-primary-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-3 mb-1">
                                                    <Link href={`/transactions/${tx.id}`}>
                                                        <span className="font-mono text-primary-400 text-lg hover:underline cursor-pointer group-hover:text-primary-300 transition-colors">
                                                            {tx.tx_hash.slice(0, 14)}...{tx.tx_hash.slice(-10)}
                                                        </span>
                                                    </Link>
                                                    <span className="px-2 py-0.5 rounded-md bg-dark-800 text-[10px] font-bold text-dark-400 border border-dark-700 uppercase tracking-wider">
                                                        {tx.chain?.name || tx.chain_id}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400">
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{new Date(tx.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Blocks className="w-3.5 h-3.5" />
                                                        <span>Block {tx.block_number}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
                                            <div className="flex items-center space-x-8">
                                                <div className="text-right">
                                                    <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-1">From</div>
                                                    <div className="font-mono text-sm text-dark-300 hover:text-white transition-colors cursor-pointer">
                                                        {formatAddress(tx.from_address)}
                                                    </div>
                                                </div>
                                                <div className="p-2 rounded-full bg-dark-800 border border-dark-700">
                                                    <ArrowRight className="w-4 h-4 text-dark-500" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-1">To</div>
                                                    <div className="font-mono text-sm text-dark-300 hover:text-white transition-colors cursor-pointer">
                                                        {formatAddress(tx.to_address)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end min-w-[120px]">
                                                <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-1">Value</div>
                                                <div className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
                                                    {formatValue(tx.value, tx.chain_id)} <span className="text-xs text-dark-500 font-medium">ETH</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="p-6 bg-dark-900/40 border-t border-dark-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-dark-400">
                            Showing <span className="text-white font-medium">{filters.offset + 1}</span> to <span className="text-white font-medium">{Math.min(filters.offset + filters.limit, pagination.total || 0)}</span> of <span className="text-white font-medium">{pagination.total?.toLocaleString() || 0}</span> transactions
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setFilters({ ...filters, offset: Math.max(0, filters.offset - filters.limit) })}
                                disabled={filters.offset === 0}
                                className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-dark-700 text-sm font-medium"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Previous</span>
                            </button>
                            <button
                                onClick={() => setFilters({ ...filters, offset: filters.offset + filters.limit })}
                                disabled={!pagination.hasMore}
                                className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-dark-700 text-sm font-medium"
                            >
                                <span>Next</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
