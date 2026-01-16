'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Database, Activity, Blocks, TrendingUp, Landmark } from 'lucide-react'

const navItems = [
    { href: '/events', label: 'Events', icon: Activity },
    { href: '/transactions', label: 'Transactions', icon: Landmark },
    { href: '/blocks', label: 'Blocks', icon: Blocks },
    { href: '/chains', label: 'Chains', icon: TrendingUp },
]

export function Navbar() {
    const pathname = usePathname()

    return (
        <nav className="glass sticky top-0 z-50 border-b border-dark-700/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="p-2 rounded-xl bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
                            <Database className="w-6 h-6 text-primary-400" />
                        </div>
                        <h1 className="text-lg md:text-xl font-bold gradient-text">
                            Multi-Chain Event Indexer
                        </h1>
                    </Link>

                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                                        : 'text-dark-300 hover:bg-dark-800 hover:text-white border border-transparent'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-400' : 'text-dark-400'}`} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-medium text-green-400">Live</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}
