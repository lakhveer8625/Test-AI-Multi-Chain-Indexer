'use client'

import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Clock, Box } from 'lucide-react'
import Link from 'next/link'

async function fetchRecentEvents() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/api/events?limit=8`)
    return response.json()
}

export function RecentEvents() {
    const { data, isLoading } = useQuery({
        queryKey: ['recent-events'],
        queryFn: fetchRecentEvents,
        refetchInterval: 5000,
    })

    const events = data?.data || []

    return (
        <div className="glass-card rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-xl font-bold text-white">Latest Raw Events</h3>
                <Link
                    href="/events"
                    className="group flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors text-sm font-bold"
                >
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse h-12 bg-white/5 rounded-xl w-full"></div>
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="p-12 text-center text-dark-500 font-medium">
                        Waiting for events...
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] border-b border-white/5">
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4 text-center">Chain</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {events.map((event: any) => (
                                <tr
                                    key={event.id}
                                    className="hover:bg-white/[0.02] transition-colors group cursor-default"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold text-sm mb-0.5 group-hover:text-primary-400 transition-colors">
                                                {event.event_type}
                                            </span>
                                            <span className="text-[10px] font-mono text-dark-500">
                                                {event.contract_address.slice(0, 10)}...{event.contract_address.slice(-8)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2 py-1 rounded-lg bg-dark-800 text-[10px] font-bold text-dark-300 border border-dark-700">
                                            {event.chain_id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-1 text-xs text-primary-400/80 font-mono">
                                            <Box className="w-3 h-3" />
                                            <span>{event.block_number}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-white/80 font-medium">
                                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                            <span className="text-[10px] text-dark-600 font-bold uppercase tracking-wider">
                                                Confirmed
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
