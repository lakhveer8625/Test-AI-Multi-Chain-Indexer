"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TableSkeleton, EmptyState } from "./LoadingStates";

const GET_EVENTS = gql`
  query EventsPage(
    $limit: Int!
    $offset: Int!
    $chainId: Int
    $type: String
    $status: String
    $search: String
  ) {
    eventsPage(
      limit: $limit
      offset: $offset
      chainId: $chainId
      type: $type
      status: $status
      search: $search
    ) {
      totalCount
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
    }
    chains {
      chainId
      name
      type
    }
  }
`;

const PAGE_SIZES = [10, 25, 50, 100];
const TYPE_OPTIONS = ["All", "Transaction", "Token Transfer", "Contract Event"];
const STATUS_OPTIONS = ["All", "Success", "Failed"];

interface Event {
  id: string;
  chainId: number;
  blockNumber: number;
  txHash: string;
  eventType: string;
  contractAddress?: string;
  from?: string;
  to?: string;
  amount?: string;
  timestamp: string;
  status: string;
}

interface Chain {
  chainId: number;
  name: string;
  type: string;
}

interface EventsData {
  eventsPage: {
    totalCount: number;
    nodes: Event[];
  };
  chains: Chain[];
}

const formatTimeAgo = (value: string) => {
  const now = Date.now();
  const timestamp = new Date(value).getTime();
  const diffSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const shortenHash = (value?: string, size = 10) => {
  if (!value) return "-";
  if (value.length <= size + 4) return value;
  return `${value.slice(0, size)}...${value.slice(-4)}`;
};

const displayType = (eventType: string) => {
  if (eventType === "Transfer") return "Token Transfer";
  if (eventType === "Transaction") return "Transaction";
  return "Contract Event";
};

const formatAmount = (value?: string) => {
  if (!value) return "-";
  // If value is very long (likely Wei), truncate or show as is
  if (value.length > 20) return value.slice(0, 6) + "..." + value.slice(-4);
  value = '' + (Number(value)) / 1000000000000000000
  return value;
};

interface EventListProps {
  selectedChainId?: string;
  onChainChange?: (chainId: string) => void;
}

export default function EventList({ selectedChainId, onChainChange }: EventListProps) {
  const [isClient, setIsClient] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  // Use local state if no prop provided, otherwise use prop (controlled)
  const [internalChainFilter, setInternalChainFilter] = useState("11155111");

  const chainFilter = selectedChainId !== undefined ? selectedChainId : internalChainFilter;

  const handleChainChange = (newChain: string) => {
    if (onChainChange) {
      onChainChange(newChain);
    } else {
      setInternalChainFilter(newChain);
    }
  };

  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchValue(searchInput.trim());
    }, 400);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchValue, chainFilter, typeFilter, statusFilter, pageSize]);

  const variables = useMemo(() => {
    const chainIdValue = chainFilter === "all" ? undefined : Number(chainFilter);
    return {
      limit: pageSize,
      offset: (page - 1) * pageSize,
      chainId: chainIdValue,
      type: typeFilter === "All" ? undefined : typeFilter,
      status: statusFilter === "All" ? undefined : statusFilter,
      search: searchValue.length > 0 ? searchValue : undefined
    };
  }, [chainFilter, page, pageSize, searchValue, statusFilter, typeFilter]);

  const { loading, error, data } = useQuery<EventsData>(GET_EVENTS, {
    variables,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    pollInterval: 10000, // Refresh every 10 seconds
  });

  const events = data?.eventsPage?.nodes ?? [];
  const totalCount = data?.eventsPage?.totalCount ?? 0;
  const chains = data?.chains ?? [];
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const chainMap = useMemo(() => {
    return new Map<number, Chain>(chains.map((chain) => [chain.chainId, chain]));
  }, [chains]);

  const isInitialLoading = loading && !data;
  const showEmpty = !loading && events.length === 0;

  if (!isClient) return <div className="p-6">Loading UI...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="premium-car rounded-xl border border-zinc-200/80 bg-gradient-to-br from-white to-zinc-50/30 p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent">Latest Events</h2>
            <p className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                {totalCount > 999 ? '999+' : totalCount}
              </span>
              {totalCount.toLocaleString()} total records across chains
            </p>
          </div>
          <div className="flex flex-1 items-center gap-3 lg:justify-end">
            <div className="relative w-full max-w-md group">
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by tx hash, address, block, token..."
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 pl-10 pr-10 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:shadow-md hover:border-zinc-300 transition-all duration-200"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 items-center pt-5 border-t border-zinc-200/70">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Filters:</span>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-zinc-600">Chain</label>
            <select
              value={chainFilter}
              onChange={(event) => handleChainChange(event.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:border-zinc-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            >
              {chains.map((chain) => (
                <option key={chain.chainId} value={chain.chainId}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-zinc-600">Type</label>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:border-zinc-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-zinc-600">Status</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:border-zinc-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="premium-card rounded-xl border border-zinc-200/80 bg-white shadow-lg overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/70 bg-gradient-to-r from-zinc-50/80 to-white px-6 py-4 text-sm">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-semibold text-zinc-800">Events</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Sorted by time
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-zinc-500">
              Page <span className="font-semibold text-zinc-700">{page}</span> of <span className="font-semibold text-zinc-700">{totalPages}</span>
            </span>
            <label className="flex items-center gap-2 text-xs">
              <span className="font-medium text-zinc-600">Show</span>
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:border-zinc-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="min-w-full table-fixed text-left text-sm">
            <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100/50 text-xs font-bold uppercase tracking-wider text-zinc-600 border-b border-zinc-200">
              <tr>
                <th className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1.5">
                    Age
                    <svg className="h-3.5 w-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </th>
                <th className="px-4 py-3.5 text-right">Block</th>
                <th className="px-4 py-3.5">Txn Hash</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">From</th>
                <th className="px-4 py-3.5">To</th>
                <th className="hidden px-4 py-3.5 xl:table-cell">Contract</th>
                <th className="px-4 py-3.5 text-right">Amount</th>
                <th className="px-4 py-3.5">Chain</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {isInitialLoading && <TableSkeleton rows={pageSize} />}
              {showEmpty && (
                <tr>
                  <td colSpan={10} className="p-0">
                    <EmptyState
                      title="No events found"
                      description="Try adjusting your filters or search query to find what you're looking for."
                      icon="filter"
                    />
                  </td>
                </tr>
              )}
              {events.map((event) => {
                const chain = chainMap.get(event.chainId);
                const typeLabel = displayType(event.eventType);
                return (
                  <tr
                    key={event.id}
                    className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-transparent hover:shadow-sm"
                  >
                    <td className="px-5 py-4 text-zinc-600 font-medium">
                      <span title={new Date(event.timestamp).toLocaleString()} className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {formatTimeAgo(event.timestamp)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="inline-flex items-center rounded-lg bg-zinc-100 px-2.5 py-1 text-sm font-bold text-zinc-700">
                        {event.blockNumber}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/transactions/${event.txHash}`} className="group/link inline-flex items-center gap-1.5 font-mono text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                        {shortenHash(event.txHash, 12)}
                        <svg className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-50 to-blue-100/50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200/50 shadow-sm">
                        {typeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {event.from ? (
                        <Link href={`/wallet/${event.from}`} className="group/addr inline-flex items-center gap-1 font-mono text-xs font-medium text-zinc-600 hover:text-blue-600 transition-colors">
                          <span title={event.from}>{shortenHash(event.from, 8)}</span>
                          <svg className="h-3 w-3 opacity-0 group-hover/addr:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {event.to ? (
                        <Link href={`/wallet/${event.to}`} className="group/addr inline-flex items-center gap-1 font-mono text-xs font-medium text-zinc-600 hover:text-blue-600 transition-colors">
                          <span title={event.to}>{shortenHash(event.to, 8)}</span>
                          <svg className="h-3 w-3 opacity-0 group-hover/addr:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-4 xl:table-cell">
                      {event.contractAddress ? (
                        <Link href={`/wallet/${event.contractAddress}`} className="group/addr inline-flex items-center gap-1 font-mono text-xs font-medium text-zinc-600 hover:text-blue-600 transition-colors">
                          <span title={event.contractAddress}>
                            {shortenHash(event.contractAddress, 8)}
                          </span>
                          <svg className="h-3 w-3 opacity-0 group-hover/addr:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-semibold text-zinc-700">{formatAmount(event.amount)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-zinc-100 to-zinc-200/50 px-3 py-1.5 text-xs font-semibold text-zinc-700 border border-zinc-200/70 shadow-sm">
                        {chain?.name ?? `Chain ${event.chainId}`}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border shadow-sm ${event.status === "Failed"
                          ? "bg-gradient-to-r from-rose-50 to-rose-100/50 text-rose-700 border-rose-200/70"
                          : "bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200/70"
                          }`}
                      >
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          {event.status === "Failed" ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          )}
                        </svg>
                        {event.status ?? "Success"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200/70 bg-gradient-to-r from-zinc-50/50 to-white px-6 py-4">
          <div className="text-sm text-zinc-600">
            Showing{" "}
            <span className="font-bold text-zinc-900">
              {Math.min((page - 1) * pageSize + 1, totalCount).toLocaleString()}
            </span>{" "}
            to{" "}
            <span className="font-bold text-zinc-900">
              {Math.min(page * pageSize, totalCount).toLocaleString()}
            </span>{" "}
            of{" "}
            <span className="font-bold text-zinc-900">
              {totalCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="btn-premium rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="btn-premium rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="flex items-center gap-2 px-3">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={(event) => {
                  const val = Number(event.target.value);
                  if (val >= 1 && val <= totalPages) {
                    setPage(val);
                  }
                }}
                className="w-16 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-center text-sm font-semibold text-zinc-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <span className="text-sm font-medium text-zinc-500">of {totalPages.toLocaleString()}</span>
            </div>

            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="btn-premium rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="btn-premium rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
