'use client'

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Activity, Terminal, Shield, Cpu, Globe, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import { Navbar } from '@/components/Navbar'

async function fetchChains() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/api/chains`)
    return response.json()
}

export default function ChainsPage() {
    const { data: chains, isLoading } = useQuery({
        queryKey: ['chains-detailed'],
        queryFn: fetchChains,
        refetchInterval: 5000,
    })

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <header className="mb-16">
                    <div className="flex items-center space-x-5 mb-6">
                        <div className="p-4 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                            <Globe className="w-10 h-10 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black tracking-tight leading-none mb-2">Network Hub</h1>
                            <p className="text-dark-500 text-lg font-medium">Global infrastructure status and ingestion health</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                        <StatusSummaryCard label="Node Connections" value="6 Active" icon={Activity} />
                        <StatusSummaryCard label="Avg. Sync Latency" value="~1.2s" icon={Zap} />
                        <StatusSummaryCard label="Indexing Protocol" value="v1.0.4-stable" icon={Shield} />
                    </div>
                </header>

                {isLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse h-64 bg-dark-800/50 rounded-[2.5rem]"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {chains?.map((chain: any) => (
                            <div
                                key={chain.chain_id}
                                className="glass-card rounded-[3rem] overflow-hidden group hover:border-indigo-500/30 transition-all p-1"
                            >
                                <div className="p-10 flex flex-col h-full bg-black/40 rounded-[2.8rem]">
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="flex items-center space-x-6">
                                            <div className="w-16 h-16 rounded-3xl bg-dark-800 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all">
                                                <TrendingUp className="w-8 h-8 text-dark-400 group-hover:text-indigo-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black mb-1">{chain.name}</h3>
                                                <span className="px-3 py-1 rounded-full bg-dark-800 text-[10px] font-black text-dark-500 uppercase tracking-widest border border-white/5">
                                                    Chain ID: {chain.chain_id}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl ${chain.is_active
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {chain.is_active ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                            <span className="text-xs font-black uppercase tracking-widest">{chain.is_active ? 'Indexed' : 'Paused'}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-10">
                                        <Metric icon={Cpu} label="Protocol" value={chain.type.toUpperCase()} />
                                        <Metric icon={Shield} label="Confirmations" value={`${chain.confirmation_depth} Blocks`} />
                                        <Metric icon={Terminal} label="Latest Indexed" value={`#${parseInt(chain.latest_indexed_block).toLocaleString()}`} />
                                        <Metric icon={Zap} label="RPC Status" value="Healthy" color="text-green-400" />
                                    </div>

                                    <div className="mt-auto space-y-4">
                                        <div className="w-full bg-dark-800 rounded-full h-2 overflow-hidden">
                                            <div className="bg-indigo-500 h-full w-[85%] rounded-full animate-pulse" />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-dark-600">
                                            <span>Current Sync Progress</span>
                                            <span>85% Total Range</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function StatusSummaryCard({ label, value, icon: Icon }: any) {
    return (
        <div className="glass p-6 rounded-3xl border border-white/5 flex items-center space-x-5">
            <div className="p-3 rounded-2xl bg-white/5">
                <Icon className="w-5 h-5 text-dark-400" />
            </div>
            <div>
                <p className="text-[10px] font-black text-dark-600 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                <p className="text-lg font-bold text-white leading-none">{value}</p>
            </div>
        </div>
    )
}

function Metric({ icon: Icon, label, value, color = "text-white" }: any) {
    return (
        <div className="flex items-center space-x-3">
            <Icon className="w-4 h-4 text-dark-600" />
            <div>
                <p className="text-[10px] font-bold text-dark-600 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className={`text-sm font-black ${color} leading-none tracking-tight`}>{value}</p>
            </div>
        </div>
    )
}
