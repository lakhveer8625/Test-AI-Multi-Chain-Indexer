import Link from 'next/link'
import { Database, Activity, Blocks, TrendingUp, ArrowRight } from 'lucide-react'
import { StatsCards } from '@/components/StatsCards'
import { RecentEvents } from '@/components/RecentEvents'
import { ChainStats } from '@/components/ChainStats'
import { Navbar } from '@/components/Navbar'

export default function Home() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary-500/30">
            <Navbar />

            {/* Hero Section */}
            <div className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[128px] -z-10 animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8 animate-fade-in">
                        <TrendingUp className="w-4 h-4 text-primary-400" />
                        <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">Enterprise Ready</span>
                    </div>

                    <h2 className="text-5xl lg:text-7xl font-black mb-8 tracking-tight">
                        <span className="gradient-text">Enterprise-Grade</span>
                        <br />
                        Multi-Chain Indexing
                    </h2>

                    <p className="text-xl text-dark-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        High-throughput, fault-tolerant blockchain data monitoring platform.
                        Index events, transactions, and blocks across any EVM or Solana network.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/transactions"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center space-x-2"
                        >
                            <span>Explore Transactions</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/events"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-dark-800 hover:bg-dark-700 text-white font-bold transition-all border border-dark-700 flex items-center justify-center space-x-2"
                        >
                            <span>Events Explorer</span>
                        </Link>
                        <Link
                            href="/blocks"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-dark-800 hover:bg-dark-700 text-white font-bold transition-all border border-dark-700 flex items-center justify-center space-x-2"
                        >
                            <span>Blocks History</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stats Section */}
                <section className="py-12">
                    <StatsCards />
                </section>

                {/* Grid Layout for Stats and Events */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 py-12">
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold flex items-center space-x-2">
                                <Activity className="w-6 h-6 text-primary-400" />
                                <span>Recent Activities</span>
                            </h3>
                            <Link href="/events" className="text-primary-400 hover:text-primary-300 text-sm font-bold flex items-center space-x-1">
                                <span>View All</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <RecentEvents />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="flex items-center space-x-2 mb-8">
                            <TrendingUp className="w-6 h-6 text-primary-400" />
                            <h3 className="text-2xl font-bold">Network Health</h3>
                        </div>
                        <ChainStats />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-20 border-t border-dark-800/50 bg-dark-900/40 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center space-x-3">
                        <Database className="w-8 h-8 text-primary-400" />
                        <span className="text-2xl font-bold gradient-text underline decoration-primary-500/20">Multi-Chain Event Indexer </span>
                    </div>
                    <div className="text-center md:text-right text-dark-400">
                        <p className="font-medium">© 2026 Multi-Chain Indexer platform</p>
                        <p className="mt-1 text-sm text-dark-500">Built for high-frequency data streams.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
