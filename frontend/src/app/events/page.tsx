'use client'

import { useQuery } from '@tanstack/react-query'
import { Activity, Filter, ChevronLeft, ChevronRight, Hash, Clock, Box, Zap } from 'lucide-react'
import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

async function fetchChains() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/api/chains`)
    return response.json()
}

async function fetchEvents(params: any) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const queryParams = new URLSearchParams(params)
    const response = await fetch(`${apiUrl}/api/events?${queryParams}`)
    return response.json()
}

export default function EventsPage() {
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
        queryKey: ['events', filters],
        queryFn: () => fetchEvents(filters),
        refetchInterval: 5000,
    })

    const events = data?.data || []
    const pagination = data?.pagination || {}
    const chains = chainsData || []

    const formatAddress = (address: string) => {
        if (!address) return 'N/A'
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-12">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 rounded-2xl bg-primary-500/10 border border-primary-500/20">
                            <Zap className="w-8 h-8 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold gradient-text">Events Explorer</h2>
                            <p className="text-dark-400 mt-1 text-lg">Smart contract event logs across all networks</p>
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <div className="glass p-6 rounded-2xl border border-dark-700/50 mb-8 backdrop-blur-md">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-bold text-dark-500 uppercase tracking-widest ml-1">Universal Search</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by contract, hash, address or block..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value, offset: 0 })}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500/50 focus:outline-none transition-all placeholder:text-dark-600 font-medium"
                                />
                                <Filter className="w-5 h-5 text-dark-500 absolute left-4 top-1/2 -translate-y-1/2" />
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

                {/* Events Table */}
                <div className="glass rounded-3xl border border-dark-700/50 overflow-hidden backdrop-blur-md">
                    {isLoading ? (
                        <div className="p-12 space-y-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="animate-pulse flex space-x-4 h-12 bg-dark-800 rounded-xl"></div>
                            ))}
                        </div>
                    ) : events.length === 0 ? (
                        <div className="p-20 text-center">
                            <Activity className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-dark-300">No events found</h3>
                            <p className="text-dark-500">Waiting for smart contract interactions...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-dark-900/40 text-[10px] font-bold text-dark-500 uppercase tracking-widest border-b border-dark-700/50">
                                        <th className="px-6 py-4">Event</th>
                                        <th className="px-6 py-4">Chain</th>
                                        <th className="px-6 py-4">Contract</th>
                                        <th className="px-6 py-4">Addresses</th>
                                        <th className="px-6 py-4">Block</th>
                                        <th className="px-6 py-4">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-700/50">
                                    {events.map((event: any) => (
                                        <tr key={event.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20">
                                                    {event.event_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-dark-300">{event.chain?.name || event.chain_id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-mono text-xs text-dark-400 group-hover:text-white transition-colors">
                                                    {formatAddress(event.contract_address)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center space-x-2 text-[10px]">
                                                        <span className="text-dark-600 w-8">FROM</span>
                                                        <span className="font-mono text-dark-400">{formatAddress(event.from_address)}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-[10px]">
                                                        <span className="text-dark-600 w-8">TO</span>
                                                        <span className="font-mono text-dark-400">{formatAddress(event.to_address)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <Link href={`/blocks/${event.chain_id}/${event.block_number}`}>
                                                    <div className="flex items-center space-x-1 font-mono text-sm text-primary-400 hover:underline cursor-pointer">
                                                        <Box className="w-3.5 h-3.5" />
                                                        <span>{event.block_number}</span>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center space-x-1 text-xs text-dark-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="p-6 bg-dark-900/40 border-t border-dark-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-dark-400">
                            Showing <span className="text-white font-medium">{filters.offset + 1}</span> to <span className="text-white font-medium">{Math.min(filters.offset + filters.limit, pagination.total || 0)}</span> of <span className="text-white font-medium">{pagination.total?.toLocaleString() || 0}</span> events
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
