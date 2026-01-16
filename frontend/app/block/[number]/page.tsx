"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function BlockPage() {
    const { number } = useParams();

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className=" px-4 py-8">
                <div className="mb-6 flex items-center gap-3 text-sm text-zinc-500">
                    <Link href="/" className="text-blue-600 hover:underline">
                        ← Back to Explorer
                    </Link>
                    <span className="text-zinc-400">/</span>
                    <span>Block Details</span>
                </div>

                <div className="mb-6">
                    <h1 className="text-xl font-semibold text-zinc-900">
                        Block <span className="text-zinc-500">#{String(number)}</span>
                    </h1>
                </div>

                {/* We can search by block number string in the main EventList component */}
                {/* But EventList's internal state management might override props if not careful. */}
                {/* Let's verify if EventList accepts initial filters or if we should customize it. */}
                {/* Since EventList is designed as a standalone component with internal state... */}
                {/* Ideally, we should refactor EventList to accept props, but for now we can render a dedicated list here. */}

                {/* Actually, looking at EventList, it takes no props and manages state internally. */}
                {/* To reuse it effectively for a Block Page, we should probably refactor it or create a new component. */}
                {/* Or we can just copy the critical table part with a fixed query. Let's do a custom view using the same query. */}

                <BlockEventList blockNumber={String(number)} />
            </div>
        </div>
    );
}

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_BLOCK_EVENTS = gql`
  query BlockEvents($search: String!) {
    eventsPage(search: $search, limit: 50) {
      nodes {
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
      totalCount
    }
  }
`;

function BlockEventList({ blockNumber }: { blockNumber: string }) {
    // Basic table similar to EventList but specific to this block
    const { data, loading, error } = useQuery(GET_BLOCK_EVENTS, {
        variables: { search: blockNumber },
        fetchPolicy: "cache-and-network"
    });

    const events = (data as any)?.eventsPage?.nodes ?? [];
    const totalCount = (data as any)?.eventsPage?.totalCount ?? 0;

    if (loading) return <div className="p-10 text-center text-zinc-500">Loading block data...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Error loading block: {error.message}</div>;

    if (events.length === 0) {
        return (
            <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
                No events found for Block #{blockNumber}
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-5 py-3 text-sm text-zinc-500 bg-zinc-50/50 rounded-t-xl">
                Found {totalCount} events in this block
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full table-fixed text-left text-sm">
                    <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        <tr>
                            <th className="px-5 py-3">Txn Hash</th>
                            <th className="px-5 py-3">Type</th>
                            <th className="px-5 py-3">From</th>
                            <th className="px-5 py-3">To</th>
                            <th className="px-5 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                        {events.map((event: any) => (
                            <tr key={event.id} className="hover:bg-zinc-50">
                                <td className="px-5 py-3 font-mono text-blue-600 truncate">
                                    <Link href={`/transactions/${event.txHash}`} className="hover:underline">
                                        {event.txHash.slice(0, 12)}...
                                    </Link>
                                </td>
                                <td className="px-5 py-3">
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                        {event.eventType}
                                    </span>
                                </td>
                                <td className="px-5 py-3 font-mono text-zinc-600 truncate">
                                    {event.from ? (
                                        <Link href={`/wallet/${event.from}`} className="hover:text-blue-600">
                                            {event.from.slice(0, 8)}...
                                        </Link>
                                    ) : "-"}
                                </td>
                                <td className="px-5 py-3 font-mono text-zinc-600 truncate">
                                    {event.to ? (
                                        <Link href={`/wallet/${event.to}`} className="hover:text-blue-600">
                                            {event.to.slice(0, 8)}...
                                        </Link>
                                    ) : "-"}
                                </td>
                                <td className="px-5 py-3 text-right font-medium text-zinc-700">
                                    {event.amount ? (event.amount.length > 10 ? '...' : (Number(event.amount) / 1000000000000000000).toString()) : "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
