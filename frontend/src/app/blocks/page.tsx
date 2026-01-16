'use client'

import { useQuery } from '@tanstack/react-query'
import { Box, Filter, ChevronLeft, ChevronRight, Hash, Clock, ArrowRight, Activity } from 'lucide-react'
import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

async function fetchChains() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/api/chains`)
    return response.json()
}

async function fetchBlocks(params: { chainId: string; search: string; limit: number; offset: number }) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const queryParams = new URLSearchParams(params as any) // Cast to any because URLSearchParams expects string values
    const response = await fetch(`${apiUrl}/api/blocks?${queryParams}`)
    return response.json()
}

export default function BlocksPage() {
    const [filters, setFilters] = useState({
        chainId: '',
        search: '',
        limit: 12,
        offset: 0,
    })

    const { data: chainsData } = useQuery({
        queryKey: ['chains'],
        queryFn: fetchChains,
    })

    const { data, isLoading } = useQuery({
        queryKey: ['blocks', filters],
        queryFn: () => fetchBlocks(filters),
        refetchInterval: 5000,
    })

    const blocks = data?.data || []
    const pagination = data?.pagination || {}
    const chains = chainsData || []

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-12">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 rounded-2xl bg-primary-500/10 border border-primary-500/20">
                            <Box className="w-8 h-8 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold gradient-text">Blocks Explorer</h2>
                            <p className="text-dark-400 mt-1 text-lg">Cross-chain block history and finality</p>
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <div className="glass p-6 rounded-2xl border border-dark-700/50 mb-12 backdrop-blur-md">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black text-dark-500 uppercase tracking-widest ml-1">Search Blocks</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by block hash or number..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value, offset: 0 })}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500/50 focus:outline-none transition-all placeholder:text-dark-600 font-medium"
                                />
                                <Hash className="w-5 h-5 text-dark-500 absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                        <div className="md:w-64 space-y-2">
                            <label className="text-[10px] font-black text-dark-500 uppercase tracking-widest ml-1">Network</label>
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
                            <label className="text-[10px] font-black text-dark-500 uppercase tracking-widest ml-1">Per Page</label>
                            <select
                                value={filters.limit}
                                onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), offset: 0 })}
                                className="w-full px-4 py-3.5 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500/50 focus:outline-none transition-all appearance-none cursor-pointer font-medium"
                            >
                                <option value="12">12 items</option>
                                <option value="24">24 items</option>
                                <option value="48">48 items</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Blocks Grid/Table */}
                <div className="glass-card rounded-[2.5rem] overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse h-40 bg-white/5 rounded-3xl"></div>
                            ))}
                        </div>
                    ) : blocks.length === 0 ? (
                        <div className="p-24 text-center">
                            <Box className="w-16 h-16 text-dark-700 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-dark-400 uppercase tracking-widest">No blocks found</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-white/5">
                            {blocks.map((block: any) => (
                                <div
                                    key={`${block.chain_id}-${block.block_number}`}
                                    className="p-8 hover:bg-white/[0.02] transition-all group flex flex-col justify-between h-56"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center border border-white/5 group-hover:border-primary-500/30 transition-colors">
                                                    <Box className="w-5 h-5 text-dark-400 group-hover:text-primary-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xl font-black text-white group-hover:text-primary-400 transition-colors leading-none mb-1">
                                                        #{block.block_number}
                                                    </span>
                                                    <span className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">
                                                        {block.chain?.name || block.chain_id}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="px-2 py-1 rounded-lg bg-green-500/10 text-[9px] font-black text-green-400 uppercase tracking-widest border border-green-500/20">
                                                Finalized
                                            </div>
                                        </div>

                                        <div className="space-y-3 mt-6">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-dark-500 font-bold uppercase tracking-widest">Hash</span>
                                                <span className="font-mono text-dark-300 truncate max-w-[120px]">{block.block_hash}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-dark-500 font-bold uppercase tracking-widest">Timestamp</span>
                                                <div className="flex items-center space-x-1 text-dark-300">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 flex items-center justify-end">
                                        <Link
                                            href={`/blocks/${block.chain_id}/${block.block_number}`}
                                            className="text-xs font-black uppercase tracking-widest text-primary-400 group-hover:text-white flex items-center space-x-2 transition-colors cursor-pointer"
                                        >
                                            <span>Full Details</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="p-8 bg-white/[0.01] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-sm font-bold text-dark-500 uppercase tracking-widest">
                            Found <span className="text-white">{pagination.total?.toLocaleString() || 0}</span> Blocks
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setFilters({ ...filters, offset: Math.max(0, filters.offset - filters.limit) })}
                                disabled={filters.offset === 0}
                                className="px-6 py-3 rounded-2xl bg-dark-800 hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/5 text-xs font-black uppercase tracking-[0.2em]"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="px-4 text-xs font-black text-dark-500 uppercase tracking-widest">
                                PAGE {Math.floor(filters.offset / filters.limit) + 1}
                            </div>
                            <button
                                onClick={() => setFilters({ ...filters, offset: filters.offset + filters.limit })}
                                disabled={!pagination.hasMore}
                                className="px-6 py-3 rounded-2xl bg-dark-800 hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/5 text-xs font-black uppercase tracking-[0.2em]"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
