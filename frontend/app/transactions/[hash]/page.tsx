"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import CopyButton from "../../../components/CopyButton";

const GET_TRANSACTION = gql`
  query TransactionEvents($hash: String!) {
    events(search: $hash) {
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
      gasUsed
      gasPrice
      effectiveGasPrice
      gasLimit
      maxFeePerGas
      maxPriorityFeePerGas
      input
      nonce
      transactionIndex
      txType
    }
  }
`;

// Helper for inline icons
const Icons = {
    CheckCircle: () => (
        <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    XCircle: () => (
        <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Copy: () => (
        <svg className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    FileText: () => (
        <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    ArrowRight: () => (
        <svg className="h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    ),
    HelpCircle: () => (
        <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Clock: () => (
        <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    ChevronDown: () => (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    ),
    ChevronUp: () => (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
    )
};

const formatTimeAgo = (value: string) => {
    const timestamp = new Date(value).getTime();
    const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (diffSeconds < 60) return `${diffSeconds} secs ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} mins ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours} hrs ago`;
};

const formatAmount = (value?: string) => {
    if (!value) return "0 ETH";
    // Check if it looks like Wei (large number)
    if (value.length > 12) {
        // Very basic conversion approximation for display
        // In real app, use ethers.formatEther
        const len = value.length;
        if (len <= 18) {
            const padded = value.padStart(18, '0');
            return `0.${padded.slice(0, 6)} ETH`;
        }
        const whole = value.slice(0, len - 18);
        const dec = value.slice(len - 18, len - 12);
        return `${whole}.${dec} ETH`;
    }
    value = '' + (Number(value)) / 1000000000000000000
    return `${value} ETH`;
};

const formatGasPrice = (value?: string) => {
    if (!value) return "-";
    // Convert Wei to Gwei
    const wei = BigInt(value);
    const gwei = Number(wei) / 1e9;
    return `${gwei.toFixed(2)} Gwei`;
};

const calculateFee = (gasUsed?: string, gasPrice?: string) => {
    if (!gasUsed || !gasPrice) return "-";
    const used = BigInt(gasUsed);
    const price = BigInt(gasPrice);
    const feeWei = used * price;
    // Wei to ETH
    const feeEth = Number(feeWei) / 1e18;
    return `${feeEth.toFixed(8)} ETH`;
};

export default function TransactionPage() {
    const { hash } = useParams();
    const [showMore, setShowMore] = useState(false);
    const { data, loading, error } = useQuery<any>(GET_TRANSACTION, {
        variables: { hash: String(hash) },
        skip: !hash,
        fetchPolicy: "cache-and-network",
        pollInterval: 10000
    });

    const events = data?.events ?? [];

    // Identify the main transaction event (if exists) or fallback
    const txEvent = useMemo(() => {
        if (!events.length) return null;
        return events.find((e: any) => e.eventType === "Transaction") || events[0];
    }, [events]);

    const transferEvents = useMemo(() => {
        return events.filter((e: any) => e.eventType === "Transfer");
    }, [events]);

    // Fallback for From/To if missing on the main event (common in older indices)
    const txFrom = useMemo(() => {
        if (txEvent?.from) return txEvent.from;
        return events.find((e: any) => e.from)?.from;
    }, [txEvent, events]);

    const isContractCreation = useMemo(() => {
        return txEvent?.eventType === "Transaction" && !txEvent.to && txEvent.contractAddress;
    }, [txEvent]);

    const txTo = useMemo(() => {
        if (txEvent?.to) return txEvent.to;
        if (isContractCreation) return txEvent.contractAddress;

        // Fallback: look for other events that might have a 'to'
        const foundTo = events.find((e: any) => e.to)?.to;
        if (foundTo) return foundTo;

        // Fallback: if no explicit 'to', use the contractAddress of the event (likely the interaction target)
        if (txEvent?.contractAddress) return txEvent.contractAddress;
        return events.find((e: any) => e.contractAddress)?.contractAddress;
    }, [txEvent, events, isContractCreation]);

    if (loading && !txEvent) {
        return <div className="mx-auto max-w-7xl px-4 py-10">Loading transaction...</div>;
    }

    if (error) {
        return <div className="mx-auto max-w-7xl px-4 py-10 text-red-500">Error: {error.message}</div>;
    }

    if (!txEvent) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-10 text-zinc-500">
                Transaction not found.
            </div>
        );
    }

    const isSuccess = txEvent.status === "Success" || !txEvent.status; // Default to success if unknown

    return (
        <div className="min-h-screen bg-zinc-50 pb-20">
            <div className="px-4 py-8">

                {/* Header */}
                <div className="mb-6 border-b border-zinc-200 pb-4">
                    <h1 className="text-xl font-medium text-zinc-900">Transaction Details</h1>
                </div>

                {/* Main Content */}
                <div className="space-y-6">

                    {/* Overview Card */}
                    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">

                        {/* Action Bar (Mockup) */}
                        <div className="border-b border-zinc-200 px-5 py-4 bg-zinc-50/50 rounded-t-xl">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-zinc-100 rounded border border-zinc-200 text-zinc-500">
                                    <Icons.FileText />
                                </span>
                                <span className="text-sm font-medium text-zinc-900">Transaction Action: </span>
                                <span className="text-sm text-zinc-500">
                                    {isContractCreation ? (
                                        <span className="text-zinc-900 font-mono text-xs">Contract Creation</span>
                                    ) : (
                                        <>Call <span className="text-zinc-900 font-mono text-xs">Contract Interaction</span></>
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="px-5 py-2 divide-y divide-zinc-100">

                            {/* Transaction Hash */}
                            <div className="grid grid-cols-1 gap-2 py-4 md:grid-cols-12 md:gap-4">
                                <div className="col-span-3 flex items-center gap-2 text-sm text-zinc-500 md:col-span-3">
                                    <Icons.HelpCircle /> Transaction Hash:
                                </div>
                                <div className="col-span-9 flex items-center gap-2 text-sm text-zinc-900">
                                    <span className="font-mono break-all">{txEvent.txHash}</span>
                                    <CopyButton value={txEvent.txHash} />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="grid grid-cols-1 gap-2 py-4 md:grid-cols-12 md:gap-4">
                                <div className="col-span-3 flex items-center gap-2 text-sm text-zinc-500 md:col-span-3">
                                    <Icons.HelpCircle /> Status:
                                </div>
                                <div className="col-span-9">
                                    <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${isSuccess
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                        : "bg-red-50 text-red-700 border border-red-100"
                                        }`}>
                                        {isSuccess ? <Icons.CheckCircle /> : <Icons.XCircle />}
                                        {isSuccess ? "Success" : "Failed"}
                                    </span>
                                </div>
                            </div>

                            {/* Block */}
                            <div className="grid grid-cols-1 gap-2 py-4 md:grid-cols-12 md:gap-4">
                                <div className="col-span-3 flex items-center gap-2 text-sm text-zinc-500 md:col-span-3">
                                    <Icons.HelpCircle /> Block:
                                </div>
                                <div className="col-span-9 flex items-center gap-2 text-sm text-zinc-900">
                                    <Link href={`/block/${txEvent.blockNumber}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                                        {txEvent.blockNumber}
                                    </Link>
                                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 border border-zinc-200">
                                        Confirmed
                                    </span>
                                </div>
                            </div>

                            {/* Timestamp */}
                            <div className="grid grid-cols-1 gap-2 py-4 md:grid-cols-12 md:gap-4">
                                <div className="col-span-3 flex items-center gap-2 text-sm text-zinc-500 md:col-span-3">
                                    <Icons.HelpCircle /> Timestamp:
                                </div>
                                <div className="col-span-9 text-sm text-zinc-900">
                                    <span className="flex items-center gap-2">
                                        <Icons.Clock />
                                        <span className="font-medium text-zinc-800">
                                            {formatTimeAgo(txEvent.timestamp)}
                                        </span>
                                        <span className="text-zinc-500">
                                            ({new Date(txEvent.timestamp).toUTCString()})
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <hr className="my-2 border-zinc-100" />

                            {/* From */}
                            <div className="grid grid-cols-1 gap-2 py-4 md:grid-cols-12 md:gap-4">
                                <div className="col-span-3 flex items-center gap-2 text-sm text-zinc-500 md:col-span-3">
                                    <Icons.HelpCircle /> From:
                                </div>
                                <div className="col-span-9 flex items-center gap-2 text-sm text-zinc-900">
                                    <Link href={`/wallet/${txFrom}`} className="font-mono text-blue-600 hover:text-blue-700 hover:underline break-all">
                                        {txFrom || "-"}
                                    </Link>
                                    {txFrom && <CopyButton value={txFrom} />}
                                </div>
                            </div>

                            {/* To (Interacted With) */}
                            <div className="grid grid-cols-1 gap-2 py-4 md:grid-cols-12 md:gap-4">
                                <div className="col-span-3 flex items-center gap-2 text-sm text-zinc-500 md:col-span-3">
                                    <Icons.HelpCircle /> {isContractCreation ? "Contract Created:" : "Interacted With (To):"}
                                </div>
                                <div className="col-span-9 flex items-center gap-2 text-sm text-zinc-900">
                                    <Link href={`/wallet/${txTo}`} className="font-mono text-blue-600 hover:text-blue-700 hover:underline break-all">
                                        {txTo || "-"}
                                    </Link>
                                    {isSuccess && <Icons.CheckCircle />}
                                    {txTo && <CopyButton value={txTo} />}
                                </div>
                            </div>

                            {/* ERC-20 Token Transfers */}
                            {transferEvents.length > 0 && (
                                <div className="grid grid-cols-1 gap-2 py-4 md:grid-cols-12 md:gap-4 bg-zinc-50/50 -mx-5 px-5 border-y border-zinc-100">
                                    <div className="col-span-3 flex items-start pt-1 gap-2 text-sm text-zinc-500 md:col-span-3">
                                        <Icons.HelpCircle /> ERC-20 Tokens Transferred:
                                        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 font-medium">
                                            {transferEvents.length}
                                        </span>
                                    </div>
                                    <div className="col-span-9 space-y-2">
                                        {transferEvents.map((t: any) => (
                                            <div key={t.id} className="flex flex-wrap items-center gap-1 text-sm text-zinc-900 border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
                                                <span className="text-zinc-500 mr-1"><Icons.ArrowRight /></span>
                                                <span className="font-bold text-zinc-600">From</span>
                                                <Link href={`/wallet/${t.from}`} className="font-mono text-blue-600 hover:underline text-xs truncate max-w-[100px]">
                                                    {t.from?.slice(0, 10)}...
                                                </Link>
                                                <span className="font-bold text-zinc-600">To</span>
                                                <Link href={`/wallet/${t.to}`} className="font-mono text-blue-600 hover:underline text-xs truncate max-w-[100px]">
                                                    {t.to?.slice(0, 10)}...
                                                </Link>
                                                <span className="font-bold text-zinc-600">For</span>
                                                <span className="font-mono text-zinc-800">
                                                    {(Number(t.amount) / 1000000000000000000).toString() || "?"}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                                    <span className="truncate max-w-[80px]" title={t.contractAddress}>
                                                        ERC-20: {t.contractAddress?.slice(0, 6)}...
                                                    </span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Value */}
                            <div className="grid grid-cols-1 gap-2 py-4 md:grid-cols-12 md:gap-4">
                                <div className="col-span-3 flex items-center gap-2 text-sm text-zinc-500 md:col-span-3">
                                    <Icons.HelpCircle /> Value:
                                </div>
                                <div className="col-span-9 flex items-center gap-2 text-sm text-zinc-900">
                                    <span className="font-medium bg-zinc-100 px-2 py-1 rounded text-zinc-700">
                                        {formatAmount(txEvent.eventType === "Transaction" ? txEvent.amount : "0")}
                                    </span>
                                </div>
                            </div>

                            {/* Transaction Fee */}
                            <div className="grid grid-cols-1 gap-2 py-4 md:grid-cols-12 md:gap-4">
                                <div className="col-span-3 flex items-center gap-2 text-sm text-zinc-500 md:col-span-3">
                                    <Icons.HelpCircle /> Transaction Fee:
                                </div>
                                <div className="col-span-9 flex items-center gap-2 text-sm text-zinc-900">
                                    {calculateFee(txEvent.gasUsed, txEvent.effectiveGasPrice || txEvent.gasPrice)}
                                </div>
                            </div>

                            {/* Gas Price */}
                            <div className="grid grid-cols-1 gap-2 py-4 md:grid-cols-12 md:gap-4">
                                <div className="col-span-3 flex items-center gap-2 text-sm text-zinc-500 md:col-span-3">
                                    <Icons.HelpCircle /> Gas Price:
                                </div>
                                <div className="col-span-9 flex items-center gap-2 text-sm text-zinc-900">
                                    {formatGasPrice(txEvent.effectiveGasPrice || txEvent.gasPrice)}
                                </div>
                            </div>

                        </div>

                        {/* Show More Content */}
                        {showMore && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                {/* Gas Limit & Usage */}
                                <div className="grid grid-cols-1 gap-2 py-4 md:grid-cols-12 md:gap-4">
                                    <div className="col-span-3 flex items-center gap-2 text-sm text-zinc-500 md:col-span-3">
                                        <Icons.HelpCircle /> Gas Limit & Usage by Txn:
                                    </div>
                                    <div className="col-span-9 flex items-center gap-4 text-sm text-zinc-900">
                                        <span>{Number(txEvent.gasLimit || 0).toLocaleString()}</span>
                                        <span className="text-zinc-300">|</span>
                                        <span>{Number(txEvent.gasUsed || 0).toLocaleString()} ({((Number(txEvent.gasUsed || 0) / Number(txEvent.gasLimit || 1)) * 100).toFixed(2)}%)</span>
                                    </div>
                                </div>

                                {/* Gas Fees */}
                                <div className="grid grid-cols-1 gap-2 py-4 md:grid-cols-12 md:gap-4">
                                    <div className="col-span-3 flex items-center gap-2 text-sm text-zinc-500 md:col-span-3">
                                        <Icons.HelpCircle /> Gas Fees:
                                    </div>
                                    <div className="col-span-9 flex flex-wrap items-center gap-3 text-sm text-zinc-900">
                                        <span className="text-zinc-500">Base:</span> <span className="font-medium">{formatGasPrice(txEvent.effectiveGasPrice)}</span>
                                        <span className="text-zinc-500">Max:</span> <span className="font-medium">{formatGasPrice(txEvent.maxFeePerGas)}</span>
                                        <span className="text-zinc-500">Max Priority:</span> <span className="font-medium">{formatGasPrice(txEvent.maxPriorityFeePerGas)}</span>
                                    </div>
                                </div>

                                {/* Other Attributes */}
                                <div className="grid grid-cols-1 gap-2 py-4 md:grid-cols-12 md:gap-4">
                                    <div className="col-span-3 flex items-center gap-2 text-sm text-zinc-500 md:col-span-3">
                                        <Icons.HelpCircle /> Other Attributes:
                                    </div>
                                    <div className="col-span-9 flex flex-wrap items-center gap-3 text-xs">
                                        <span className="bg-zinc-100 px-2 py-1 rounded text-zinc-600 font-medium border border-zinc-200">Txn Type: {txEvent.txType ?? 2} (EIP-1559)</span>
                                        <span className="bg-zinc-100 px-2 py-1 rounded text-zinc-600 font-medium border border-zinc-200">Nonce: {txEvent.nonce ?? 0}</span>
                                        <span className="bg-zinc-100 px-2 py-1 rounded text-zinc-600 font-medium border border-zinc-200">Position In Block: {txEvent.transactionIndex ?? 0}</span>
                                    </div>
                                </div>

                                {/* Input Data */}
                                <div className="grid grid-cols-1 gap-2 py-6 md:grid-cols-12 md:gap-4">
                                    <div className="col-span-3 flex items-start pt-1 gap-2 text-sm text-zinc-500 md:col-span-3">
                                        <Icons.HelpCircle /> Input Data:
                                    </div>
                                    <div className="col-span-9 space-y-3">
                                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-[11px] text-zinc-700 max-h-60 overflow-y-auto break-all whitespace-pre-wrap leading-relaxed shadow-inner">
                                            {txEvent.input || "0x"}
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 shadow-xs">Decode Input Data</button>
                                            <button className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 shadow-xs">View In Decoder</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="border-t border-zinc-200 px-5 py-3 bg-zinc-50 rounded-b-xl">
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 transition-colors group"
                        >
                            {showMore ? (
                                <>
                                    <span className="text-zinc-500 group-hover:text-blue-600 transition-colors">Click to show less</span>
                                    <Icons.ChevronUp />
                                </>
                            ) : (
                                <>
                                    <span>View More Details</span>
                                    <Icons.ChevronDown />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Transaction Logs */}
                {events.length > 0 && (
                    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-zinc-200 px-5 py-4 bg-zinc-50/50">
                            <h3 className="text-sm font-medium text-zinc-900">Transaction Logs ({events.length})</h3>
                        </div>
                        <div className="p-0">
                            <table className="min-w-full divide-y divide-zinc-200 text-sm">
                                <thead className="bg-zinc-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Index</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Address</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-zinc-200">
                                    {events.map((e: any, index: number) => (
                                        <tr key={e.id}>
                                            <td className="px-5 py-3 whitespace-nowrap text-zinc-500">{index}</td>
                                            <td className="px-5 py-3 whitespace-nowrap font-mono text-blue-600">
                                                <Link href={`/wallet/${e.contractAddress}`} className="hover:underline">
                                                    {e.contractAddress}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800">
                                                    {e.eventType}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Footer note */}
                <div className="flex gap-2 text-xs text-zinc-400 px-2">
                    <span>💡</span>
                    <p>A transaction is a cryptographically signed instruction that changes the blockchain state.</p>
                </div>
            </div>
        </div>
    );
}
