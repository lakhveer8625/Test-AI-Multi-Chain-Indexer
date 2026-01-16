"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import TransactionChart from "./TransactionChart";
import { useMemo } from "react";

const GET_NETWORK_STATS = gql`
  query GetNetworkStats($chainId: Int!) {
    networkStats(chainId: $chainId) {
      chainId
      transactionCount
      totalEvents
      latestBlock
      medianGasPrice
      tps
    }
  }
`;

interface NetworkStats {
    chainId: number;
    transactionCount: number;
    totalEvents: number;
    latestBlock: number;
    medianGasPrice: string;
    tps: number;
}

export default function DashboardStats({ chainId }: { chainId?: string }) {
    const numericChainId = useMemo(() => {
        if (!chainId || chainId === "all") return 11155111; // Default to Sepolia for stats if "all" or missing
        return parseInt(chainId);
    }, [chainId]);

    const { data, loading } = useQuery<{ networkStats: NetworkStats }>(GET_NETWORK_STATS, {
        variables: { chainId: numericChainId },
        notifyOnNetworkStatusChange: true,
        fetchPolicy: "cache-and-network",
        pollInterval: 10000, // Refresh every 10 seconds
    });

    const stats = data?.networkStats;

    // Only show "..." on initial load when data is truly missing
    const isInitialLoading = loading && !stats;

    const formatGwei = (wei: string | undefined) => {
        if (!wei) return "0";
        return (parseFloat(wei) / 1e9).toFixed(3);
    };

    const isSepolia = numericChainId === 11155111;

    return (
        <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3 animate-fade-in">
            {/* Ether Price Card (Chain Aware) */}
            <div className="premium-card group rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white via-white to-blue-50/30 p-6 shadow-md hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                    {isSepolia ? (
                                        <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" opacity="0.5" />
                                    ) : (
                                        <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                                    )}
                                </svg>
                            </div>
                            <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-600">
                                {isSepolia ? "Sepolia ETH" : "Ether Price"}
                            </h3>
                        </div>
                        <div className="flex items-baseline gap-2.5">
                            <span className="text-3xl font-extrabold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent">
                                {isSepolia ? "Testnet" : "$3,309.97"}
                            </span>
                            {!isSepolia && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600">
                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    0.16%
                                </span>
                            )}
                        </div>
                        <p className="mt-2 text-sm font-medium text-zinc-500">
                            {isSepolia ? "Test Network Chain" : "@ 0.0346 BTC"}
                        </p>
                    </div>
                </div>
                {!isSepolia && (
                    <div className="mt-5 pt-5 border-t border-zinc-200/70">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-600">Market Cap</h3>
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                Live
                            </span>
                        </div>
                        <p className="mt-2 text-lg font-bold text-zinc-900">$399.5B</p>
                    </div>
                )}
                {isSepolia && (
                    <div className="mt-5 pt-5 border-t border-zinc-200/70">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 border border-amber-200">
                            <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-semibold text-amber-700">Test Network</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Transactions & Gas (Real Data - Silent Updates) */}
            <div className="premium-card group rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white via-white to-emerald-50/30 p-6 shadow-md hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col h-full justify-between gap-5">
                    <div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-emerald-100 p-1.5">
                                        <svg className="h-4 w-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-600">Transactions</h3>
                                </div>
                                <p className="text-2xl font-extrabold text-zinc-900">
                                    {isInitialLoading ? (
                                        <span className="skeleton h-8 w-20 inline-block"></span>
                                    ) : (
                                        stats?.transactionCount?.toLocaleString() || "0"
                                    )}
                                </p>
                                {!isInitialLoading && (
                                    <p className="text-xs font-medium text-zinc-500">{stats?.tps || "0.00"} TPS</p>
                                )}
                            </div>
                            <div className="space-y-2 text-right">
                                <div className="flex items-center gap-2 justify-end">
                                    <div className="rounded-lg bg-blue-100 p-1.5">
                                        <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-600">Gas Price</h3>
                                </div>
                                <p className="text-2xl font-extrabold text-zinc-900">
                                    {isInitialLoading ? (
                                        <span className="skeleton h-8 w-16 inline-block"></span>
                                    ) : (
                                        formatGwei(stats?.medianGasPrice)
                                    )}
                                </p>
                                {!isInitialLoading && (
                                    <p className="text-xs font-medium text-zinc-500">Gwei</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-zinc-200/70 pt-4 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-600">Latest Block</h3>
                            <p className="text-lg font-bold text-zinc-900">
                                {isInitialLoading ? (
                                    <span className="skeleton h-6 w-16 inline-block"></span>
                                ) : (
                                    stats?.latestBlock?.toLocaleString() || "0"
                                )}
                            </p>
                        </div>
                        <div className="space-y-1 text-right">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-600">Total Events</h3>
                            <p className="text-lg font-bold text-zinc-900">
                                {isInitialLoading ? (
                                    <span className="skeleton h-6 w-16 inline-block"></span>
                                ) : (
                                    stats?.totalEvents?.toLocaleString() || "0"
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History Graph */}
            <div className="premium-card rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <TransactionChart chainId={chainId} />
            </div>
        </div>
    );
}
