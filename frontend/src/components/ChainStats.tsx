'use client'

import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, ShieldCheck, Wifi, WifiOff } from 'lucide-react'

async function fetchChains() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/api/chains`)
    return response.json()
}

export function ChainStats() {
    const { data: chains, isLoading } = useQuery({
        queryKey: ['chains'],
        queryFn: fetchChains,
    })

    const chartData = (chains || []).map((chain: any) => ({
        name: chain.name,
        // Calculate relative progress for display
        height: parseInt(chain.latest_indexed_block) % 1000 || 100,
    }))

    return (
        <div className="glass-card p-6 rounded-3xl overflow-hidden h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white">Network Health</h3>
                    <p className="text-xs text-dark-500 font-medium uppercase tracking-widest mt-1">Live Sync Status</p>
                </div>
                <div className="p-2 rounded-xl bg-primary-500/10 border border-primary-500/20">
                    <Activity className="w-5 h-5 text-primary-400" />
                </div>
            </div>

            {isLoading ? (
                <div className="h-48 flex items-center justify-center">
                    <div className="animate-pulse flex space-x-2">
                        <div className="w-2 h-8 bg-dark-700 rounded-full"></div>
                        <div className="w-2 h-12 bg-dark-700 rounded-full"></div>
                        <div className="w-2 h-6 bg-dark-700 rounded-full"></div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="h-40 -mx-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="glass px-3 py-2 rounded-xl text-xs font-bold border-white/10 shadow-2xl">
                                                    {payload[0].payload.name}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="height" fill="url(#statsGradient)" radius={[4, 4, 4, 4]} barSize={8} />
                                <defs>
                                    <linearGradient id="statsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                        {(chains || []).map((chain: any) => (
                            <div
                                key={chain.id}
                                className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary-500/30 transition-all cursor-default"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${chain.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                                        <div>
                                            <h4 className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">{chain.name}</h4>
                                            <div className="flex items-center space-x-1.5 mt-0.5">
                                                <ShieldCheck className="w-3 h-3 text-dark-500" />
                                                <span className="text-[10px] text-dark-500 font-bold font-mono tracking-tighter">
                                                    {chain.type} • {chain.confirmation_depth} DEPTH
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-dark-600 font-black uppercase tracking-widest mb-0.5">Height</div>
                                        <span className="text-xs font-black font-mono text-primary-400/90 leading-none">
                                            {parseInt(chain.latest_indexed_block).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
