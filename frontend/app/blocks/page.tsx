"use client";

import BlockList from "../../components/BlockList";
import { useState } from "react";

export default function BlocksPage() {
    const [chainId, setChainId] = useState("11155111");

    return (
        <main className="min-h-screen">
            <section className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">Blocks</h1>
                        <p className="text-sm text-zinc-500 mt-1">A comprehensive list of blocks synced from all supported chains</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        Chain Filter:
                        <select
                            value={chainId}
                            onChange={(e) => setChainId(e.target.value)}
                            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="11155111">Sepolia</option>
                            <option value="1">Ethereum</option>
                            <option value="137">Polygon</option>
                        </select>
                    </div>
                </div>
                <BlockList selectedChainId={chainId} />
            </section>
        </main>
    );
}
