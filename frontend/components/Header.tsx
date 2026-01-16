"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
    { name: "Home", href: "/" },
    { name: "Transactions", href: "/transactions" },
    { name: "Blocks", href: "/blocks" },
];

export default function Header() {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        // Check if it looks like a tx hash or address
        const query = searchQuery.trim();
        if (query.length === 66 && query.startsWith("0x")) {
            window.location.href = `/transactions/${query}`;
        } else if (query.length === 42 && query.startsWith("0x")) {
            window.location.href = `/wallet/${query}`;
        } else if (/^\d+$/.test(query)) {
            window.location.href = `/block/${query}`;
        } else {
            // Generic search page or just ignore for now
            console.log("Generic search:", query);
        }
    };

    return (
        <header className="glass sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-xl shadow-sm">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-105">
                            <span className="text-lg font-extrabold tracking-tight">M</span>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="hidden text-xl font-extrabold tracking-tight text-zinc-900 sm:block">
                            Multi<span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Scan</span>
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-1.5 md:flex">
                        {NAV_LINKS.map((link) => {
                            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`relative rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${isActive
                                        ? "bg-blue-50 text-blue-600 shadow-sm"
                                        : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"
                                        }`}
                                >
                                    {link.name}
                                    {isActive && (
                                        <div className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex flex-1 items-center justify-end gap-4 md:ml-8 lg:ml-20">
                    <form onSubmit={handleSearch} className="relative w-full max-w-sm group">
                        <input
                            type="text"
                            placeholder="Search by Address / Txn Hash / Block"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-2.5 pl-10 pr-3 text-sm text-zinc-900 shadow-sm transition-all duration-200 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:shadow-md placeholder:text-zinc-400 hover:border-zinc-300"
                        />
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </form>

                    <div className="hidden h-6 w-px bg-gradient-to-b from-transparent via-zinc-300 to-transparent sm:block"></div>

                    <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 border border-emerald-100">
                        <div className="relative h-2 w-2">
                            <div className="absolute h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <div className="absolute h-2 w-2 rounded-full bg-emerald-400 animate-ping"></div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700">Live</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
