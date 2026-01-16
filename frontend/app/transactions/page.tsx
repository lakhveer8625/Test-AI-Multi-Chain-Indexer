"use client";

import EventList from "../../components/EventList";
import { useState } from "react";

export default function TransactionsPage() {
    const [chainId, setChainId] = useState("11155111");

    return (
        <main className="min-h-screen">
            <section className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900">Transactions</h1>
                    <p className="text-sm text-zinc-500 mt-1">A list of all transactions across supported chains</p>
                </div>
                <EventList selectedChainId={chainId} onChainChange={setChainId} />
            </section>
        </main>
    );
}
