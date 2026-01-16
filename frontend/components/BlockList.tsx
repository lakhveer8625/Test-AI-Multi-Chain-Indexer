"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatTimeAgo, shortenHash } from "../utils/format";
import { TableSkeleton, EmptyState } from "./LoadingStates";


const GET_BLOCKS = gql`
  query BlocksPage($limit: Int!, $offset: Int!, $chainId: Int) {
    blocksPage(limit: $limit, offset: $offset, chainId: $chainId) {
      totalCount
      nodes {
        id
        chainId
        number
        hash
        parentHash
        timestamp
        isCanonical
      }
    }
    chains {
      chainId
      name
    }
  }
`;

const PAGE_SIZES = [10, 25, 50, 100];

interface Block {
    id: string;
    chainId: number;
    number: string;
    hash: string;
    parentHash: string;
    timestamp: string;
    isCanonical: boolean;
}

interface Chain {
    chainId: number;
    name: string;
}

interface BlocksData {
    blocksPage: {
        totalCount: number;
        nodes: Block[];
    };
    chains: Chain[];
}

export default function BlockList({ selectedChainId }: { selectedChainId?: string }) {
    const [pageSize, setPageSize] = useState(25);
    const [page, setPage] = useState(1);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Reset to page 1 when filters or page size change
    useEffect(() => {
        setPage(1);
    }, [selectedChainId, pageSize]);

    const variables = useMemo(() => {
        const chainIdValue = selectedChainId === "all" || !selectedChainId ? undefined : Number(selectedChainId);
        return {
            limit: pageSize,
            offset: (page - 1) * pageSize,
            chainId: chainIdValue,
        };
    }, [selectedChainId, page, pageSize]);

    const { loading, error, data } = useQuery<BlocksData>(GET_BLOCKS, {
        variables,
        notifyOnNetworkStatusChange: true,
        fetchPolicy: "cache-and-network",
        pollInterval: 10000, // Refresh every 10 seconds
    });

    const blocks = data?.blocksPage?.nodes ?? [];
    const totalCount = data?.blocksPage?.totalCount ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    if (!isClient) return null;
    if (error) return <div className="p-6 text-red-500">Error: {error.message}</div>;

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="premium-card rounded-xl border border-zinc-200/80 bg-white shadow-lg overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/70 bg-gradient-to-r from-zinc-50/80 to-white px-6 py-4">
                    <div className="flex items-center gap-3">
                        <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V4zm2 0h10v10H5V4z" clipRule="evenodd" />
                        </svg>
                        <h2 className="text-sm font-bold text-zinc-900">Blocks</h2>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {totalCount.toLocaleString()} blocks
                        </span>
                    </div>
                    <label className="flex items-center gap-2 text-xs">
                        <span className="font-medium text-zinc-600">Show</span>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:border-zinc-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        >
                            {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </label>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100/50 text-xs font-bold uppercase tracking-wider text-zinc-600 border-b border-zinc-200">
                            <tr>
                                <th className="px-5 py-3.5">Block</th>
                                <th className="px-5 py-3.5">Age</th>
                                <th className="px-5 py-3.5">Hash</th>
                                <th className="px-5 py-3.5">Chain</th>
                                <th className="px-5 py-3.5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 bg-white">
                            {loading && blocks.length === 0 ? (
                                <TableSkeleton rows={pageSize} />
                            ) : blocks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-0">
                                        <EmptyState title="No blocks found" description="No blocks available  for the selected filters." icon="inbox" />
                                    </td>
                                </tr>
                            ) : blocks.map((block) => (
                                <tr key={block.id} className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-transparent hover:shadow-sm">
                                    <td className="px-5 py-4">
                                        <Link href={`/block/${block.number}?chainId=${block.chainId}`} className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                            <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-sm">{block.number}</span>
                                        </Link>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="flex items-center gap-1.5 text-zinc-600 font-medium">
                                            <svg className="h-3.5 w-3.5 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            {formatTimeAgo(block.timestamp)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 font-mono text-xs text-zinc-600">{shortenHash(block.hash, 16)}</td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-zinc-100 to-zinc-200/50 px-3 py-1.5 text-xs font-semibold text-zinc-700 border border-zinc-200/70 shadow-sm">
                                            {data?.chains?.find((c) => c.chainId === block.chainId)?.name ?? `Chain ${block.chainId}`}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200/70 shadow-sm">
                                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Confirmed
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-4 text-sm bg-zinc-50/50">
                    <div className="text-zinc-500 hidden sm:block">
                        Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                            className="rounded-md border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 disabled:opacity-40 hover:bg-white"
                        >First</button>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="rounded-md border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 disabled:opacity-40 hover:bg-white"
                        >Prev</button>
                        <div className="px-3 py-1 text-xs font-medium text-zinc-900 bg-white border border-zinc-200 rounded-md">
                            Page {page} of {totalPages}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="rounded-md border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 disabled:opacity-40 hover:bg-white"
                        >Next</button>
                        <button
                            onClick={() => setPage(totalPages)}
                            disabled={page === totalPages}
                            className="rounded-md border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 disabled:opacity-40 hover:bg-white"
                        >Last</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
