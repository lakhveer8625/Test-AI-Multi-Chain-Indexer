'use client'

import { useQuery } from '@tanstack/react-query'
import { Landmark, ArrowLeft, Clock, Hash, Blocks, User, ArrowRight, Share2, ExternalLink, Code } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'

async function fetchTransaction(id: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/api/transactions/${id}`)
    return response.json()
}

export default function TransactionDetailPage() {
    const { id } = useParams()
    const { data: tx, isLoading } = useQuery({
        queryKey: ['transaction', id],
        queryFn: () => fetchTransaction(id as string),
    })

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-20">
                    <div className="animate-pulse space-y-8">
                        <div className="h-10 bg-dark-800 rounded-xl w-1/3"></div>
                        <div className="h-64 bg-dark-800 rounded-3xl"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!tx) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <h2 className="text-2xl font-bold mb-4">Transaction Not Found</h2>
                    <Link href="/transactions" className="text-primary-400 hover:underline">Back to Transactions</Link>
                </div>
            </div>
        )
    }

    const DetailItem = ({ label, value, icon: Icon, mono = false }: any) => (
        <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/5 last:border-0 group">
            <div className="flex items-center space-x-3 md:w-1/3 mb-2 md:mb-0">
                <div className="p-2 rounded-lg bg-dark-800 text-dark-400 group-hover:text-primary-400 transition-colors">
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-dark-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className={`md:w-2/3 break-all ${mono ? 'font-mono text-sm' : 'text-md font-medium'} text-white/90`}>
                {value || <span className="text-dark-600">N/A</span>}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link href="/transactions" className="inline-flex items-center space-x-2 text-dark-400 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold">Back to Transactions</span>
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center space-x-5">
                        <div className="p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20">
                            <Landmark className="w-8 h-8 text-primary-400" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-3xl font-black">Transaction Details</h1>
                                <span className="px-2 py-0.5 rounded-md bg-primary-500/10 text-[10px] font-black text-primary-400 border border-primary-500/20 uppercase tracking-widest">
                                    {tx.chain?.name || tx.chain_id}
                                </span>
                            </div>
                            <p className="text-dark-500 font-mono text-xs mt-1">{tx.tx_hash}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 transition-all border border-white/5 text-sm font-bold">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                        </button>
                    </div>
                </div>

                <div className="glass-card rounded-[2.5rem] overflow-hidden">
                    <div className="p-8 md:p-12">
                        <DetailItem label="Transaction Hash" value={tx.tx_hash} icon={Hash} mono />
                        <DetailItem label="Status" value={
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                <span className="text-green-400 font-bold uppercase tracking-wider text-xs">Success</span>
                            </div>
                        } icon={ShieldCheck} />
                        <DetailItem label="Block" value={
                            <div className="flex items-center space-x-2">
                                <span className="text-primary-400 font-bold">#{tx.block_number}</span>
                                <span className="text-[10px] text-dark-600 font-bold uppercase p-1 rounded bg-dark-800">Confirmed</span>
                            </div>
                        } icon={Blocks} />
                        <DetailItem label="Timestamp" value={new Date(tx.timestamp).toLocaleString()} icon={Clock} />

                        <div className="h-px bg-white/5 my-4" />

                        <DetailItem label="From" value={tx.from_address} icon={User} mono />
                        <DetailItem label="Interacted With (To)" value={tx.to_address} icon={ArrowRight} mono />

                        <DetailItem label="Value" value={
                            <div className="flex items-baseline space-x-1.5">
                                <span className="text-2xl font-black text-white">{(BigInt(tx.value || '0') / BigInt(10 ** 18)).toString()}</span>
                                <span className="text-xs text-dark-500 font-bold">ETH</span>
                            </div>
                        } icon={Landmark} />
                    </div>
                </div>

                {/* Input Data Section */}
                {tx.input_data && (
                    <div className="mt-8 glass-card rounded-[2rem] overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center space-x-3">
                            <Code className="w-5 h-5 text-primary-400" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-dark-300">Input Data</h3>
                        </div>
                        <div className="p-8">
                            <pre className="bg-dark-800/50 p-6 rounded-2xl font-mono text-xs text-dark-400 overflow-x-auto border border-white/5 leading-relaxed">
                                {typeof tx.input_data === 'string' && tx.input_data.startsWith('{')
                                    ? JSON.stringify(JSON.parse(tx.input_data), null, 4)
                                    : tx.input_data}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function ShieldCheck(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
