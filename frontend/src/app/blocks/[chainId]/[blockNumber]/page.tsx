'use client'

import { useQuery } from '@tanstack/react-query'
import { Box, ArrowLeft, Clock, Hash, Shield, Database, ArrowRight, Share2, Activity, Zap } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'

async function fetchBlock(chainId: string, blockNumber: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/api/blocks/${chainId}/${blockNumber}`)
    return response.json()
}

async function fetchBlockTransactions(chainId: string, blockNumber: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/api/transactions?chainId=${chainId}&limit=100`) // Simplified: API doesn't have block-specific tx filter yet, filtering in UI or backend update needed
    return response.json()
}

export default function BlockDetailPage() {
    const params = useParams()
    const chainId = params.chainId as string
    const blockNumber = params.blockNumber as string

    const { data: block, isLoading: isBlockLoading } = useQuery({
        queryKey: ['block', chainId, blockNumber],
        queryFn: () => fetchBlock(chainId, blockNumber),
    })

    const { data: txsData, isLoading: isTxsLoading } = useQuery({
        queryKey: ['block-transactions', chainId, blockNumber],
        queryFn: () => fetchBlockTransactions(chainId, blockNumber),
        enabled: !!block,
    })

    // Manual filtering for now as API might not support block_number query yet
    const blockTransactions = (txsData?.data || []).filter((tx: any) => tx.block_number === blockNumber)

    if (isBlockLoading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="max-w-5xl mx-auto px-4 py-20">
                    <div className="animate-pulse space-y-8">
                        <div className="h-12 bg-dark-800 rounded-2xl w-1/4"></div>
                        <div className="h-96 bg-dark-800 rounded-[3rem]"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!block) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="max-w-5xl mx-auto px-4 py-20 text-center">
                    <h2 className="text-3xl font-black mb-6">Block Not Found</h2>
                    <Link href="/blocks" className="px-8 py-3 bg-primary-600 rounded-xl text-sm font-bold hover:bg-primary-500 transition-all">
                        Back to Blocks
                    </Link>
                </div>
            </div>
        )
    }

    const DetailRow = ({ label, value, icon: Icon, mono = false }: any) => (
        <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 last:border-0 group">
            <div className="flex items-center space-x-3 md:w-1/3 mb-2 md:mb-0">
                <div className="p-2.5 rounded-xl bg-dark-800 text-dark-500 group-hover:text-primary-400 transition-colors">
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-dark-600">{label}</span>
            </div>
            <div className={`md:w-2/3 break-all ${mono ? 'font-mono text-xs' : 'text-md font-bold'} text-white/90`}>
                {value || <span className="text-dark-700">N/A</span>}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary-500/30">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-12">
                <Link href="/blocks" className="inline-flex items-center space-x-2 text-dark-500 hover:text-white transition-colors mb-12 group">
                    <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Back to Blocks</span>
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="flex items-center space-x-6">
                        <div className="p-5 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
                            <Box className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-4 mb-2">
                                <h1 className="text-5xl font-black tracking-tighter">Block #{block.block_number}</h1>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${block.is_canonical ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                    {block.is_canonical ? 'Canonical' : 'Forked'}
                                </span>
                            </div>
                            <p className="text-dark-500 font-mono text-sm tracking-tight">{block.block_hash}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center space-x-2">
                            <Database className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-black uppercase tracking-widest text-dark-300">{block.chain?.name || block.chain_id}</span>
                        </div>
                        <button className="p-3 rounded-2xl bg-dark-800 hover:bg-dark-700 transition-all border border-white/5">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Stats */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass-card rounded-[3rem] overflow-hidden p-1">
                            <div className="bg-black/40 rounded-[2.8rem] p-10">
                                <DetailRow label="Block Hash" value={block.block_hash} icon={Hash} mono />
                                <DetailRow label="Parent Hash" value={block.parent_hash} icon={Shield} mono />
                                <DetailRow label="Timestamp" value={new Date(block.timestamp).toLocaleString()} icon={Clock} />
                                <DetailRow label="Event Count" value={block.event_count} icon={Activity} />
                                <DetailRow label="Status" value={
                                    <div className="flex items-center space-x-2 text-green-400">
                                        <Zap className="w-4 h-4 fill-current" />
                                        <span className="uppercase tracking-widest text-xs font-black">Finalized & Indexed</span>
                                    </div>
                                } icon={Shield} />
                            </div>
                        </div>

                        {/* Recent Transactions in this Block */}
                        <div className="glass-card rounded-[3rem] overflow-hidden">
                            <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <Activity className="w-5 h-5 text-primary-400" />
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Transactions in Block</h3>
                                </div>
                                <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">
                                    Showing {blockTransactions.length} TXs
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black text-dark-600 uppercase tracking-[0.2em] border-b border-white/5">
                                            <th className="px-8 py-4">TX Hash</th>
                                            <th className="px-8 py-4">From / To</th>
                                            <th className="px-8 py-4 text-right">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {isTxsLoading ? (
                                            [...Array(3)].map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan={3} className="px-8 py-4"><div className="h-10 bg-white/5 rounded-xl" /></td>
                                                </tr>
                                            ))
                                        ) : blockTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="px-8 py-12 text-center text-xs font-bold text-dark-600 uppercase tracking-widest">
                                                    No indexed transactions for this block
                                                </td>
                                            </tr>
                                        ) : (
                                            blockTransactions.map((tx: any) => (
                                                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <Link href={`/transactions/${tx.id}`}>
                                                            <div className="flex flex-col">
                                                                <span className="text-primary-400 font-bold text-sm group-hover:underline">{tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-8)}</span>
                                                                <span className="text-[10px] text-dark-600 font-bold uppercase tracking-tight mt-0.5">Confirmed</span>
                                                            </div>
                                                        </Link>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col space-y-1">
                                                            <span className="text-[10px] font-mono text-dark-500">F: {tx.from_address.slice(0, 14)}...</span>
                                                            <span className="text-[10px] font-mono text-dark-500">T: {tx.to_address?.slice(0, 14) || 'Contract Creation'}...</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right font-black text-white text-sm">
                                                        {(BigInt(tx.value || '0') / BigInt(10 ** 18)).toString()} ETH
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Metadata */}
                    <div className="space-y-8">
                        <div className="glass-card rounded-[2.5rem] p-8">
                            <h4 className="text-[10px] font-black text-dark-500 uppercase tracking-[0.3em] mb-6">Chain Metadata</h4>
                            <div className="space-y-6">
                                <SidebarItem label="Network" value={block.chain?.name || block.chain_id} />
                                <SidebarItem label="Protocol" value="Multi-Chain v1" />
                                <SidebarItem label="Deduplicated" value="Yes" color="text-emerald-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SidebarItem({ label, value, color = "text-white" }: any) {
    return (
        <div>
            <p className="text-[10px] font-bold text-dark-600 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-sm font-black ${color} tracking-tight`}>{value}</p>
        </div>
    )
}
