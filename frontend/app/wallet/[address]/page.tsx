"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useParams } from "next/navigation";

const GET_WALLET_ACTIVITY = gql`
  query WalletActivity($address: String!) {
    events(search: $address, limit: 50) {
      id
      chainId
      blockNumber
      txHash
      eventType
      contractAddress
      from
      to
      amount
      timestamp
      status
    }
  }
`;

const displayType = (eventType: string) => {
    if (eventType === "Transfer") return "Token Transfer";
    if (eventType === "Transaction") return "Transaction";
    return "Contract Event";
};

export default function WalletPage() {
    const { address } = useParams();
    const { data, loading, error } = useQuery<any>(GET_WALLET_ACTIVITY, {
        variables: { address: String(address) },
        skip: !address,
        fetchPolicy: "cache-and-network"
    });

    const events = data?.events ?? [];

    if (loading && events.length === 0) {
        return <div className="mx-auto max-w-5xl px-6 py-10">Loading wallet activity...</div>;
    }

    if (error) {
        return (
            <div className="mx-auto max-w-5xl px-6 py-10 text-red-500">
                Error: {error.message}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="px-6 py-10">
                <div className="mb-6 flex items-center gap-3 text-sm text-zinc-500">
                    <Link href="/" className="text-blue-600 hover:underline">
                        ← Back to Explorer
                    </Link>
                    <span className="text-zinc-400">/</span>
                    <span>Address Details</span>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h1 className="text-xl font-semibold text-zinc-900 mb-4">Address</h1>
                    <div className="font-mono text-sm text-zinc-600 break-all bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                        {String(address)}
                    </div>

                    <div className="mt-8">
                        <h2 className="text-lg font-medium text-zinc-900 mb-4">Activity ({events.length})</h2>
                        <div className="overflow-hidden rounded-lg border border-zinc-200">
                            <table className="min-w-full divide-y divide-zinc-200 bg-white text-sm">
                                <thead className="bg-zinc-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-zinc-500">Tx Hash</th>
                                        <th className="px-4 py-3 text-left font-medium text-zinc-500">Type</th>
                                        <th className="px-4 py-3 text-left font-medium text-zinc-500">From / To</th>
                                        <th className="px-4 py-3 text-right font-medium text-zinc-500">Amount</th>
                                        <th className="px-4 py-3 text-right font-medium text-zinc-500">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200">
                                    {events.map((e: any) => {
                                        const isFrom = e.from?.toLowerCase() === String(address).toLowerCase();
                                        return (
                                            <tr key={e.id} className="hover:bg-zinc-50">
                                                <td className="px-4 py-3 font-mono text-xs text-blue-600">
                                                    <Link href={`/transactions/${e.txHash}`} className="hover:underline">
                                                        {e.txHash.slice(0, 12)}...
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                        {displayType(e.eventType)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs">
                                                    {isFrom ? (
                                                        <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">OUT</span>
                                                    ) : (
                                                        <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">IN</span>
                                                    )}
                                                    <span className="ml-2 text-zinc-600">
                                                        {isFrom ? e.to?.slice(0, 10) + '...' : e.from?.slice(0, 10) + '...'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-zinc-900">{(Number(e.amount) / 1000000000000000000).toString() || '-'}</td>
                                                <td className="px-4 py-3 text-right text-zinc-500 text-xs">
                                                    {new Date(e.timestamp).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
