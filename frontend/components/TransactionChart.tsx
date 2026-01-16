"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const GET_TRANSACTION_HISTORY = gql`
  query TransactionHistory($days: Int!, $chainId: Int) {
    transactionHistory(days: $days, chainId: $chainId) {
      date
      count
    }
  }
`;

interface TransactionHistoryItem {
    date: string;
    count: number;
}

export default function TransactionChart({ chainId }: { chainId?: string }) {
    const chainIdInt = chainId && chainId !== "all" ? Number(chainId) : undefined;

    const { data, loading, error } = useQuery<{ transactionHistory: TransactionHistoryItem[] }>(GET_TRANSACTION_HISTORY, {
        variables: { days: 14, chainId: chainIdInt },
        fetchPolicy: "cache-and-network"
    });

    const history = data?.transactionHistory ?? [];
    const totalTransactions = history.reduce((acc, item) => acc + item.count, 0);

    if (loading) return <div className="h-[120px] w-full animate-pulse bg-zinc-100 rounded-lg"></div>;
    if (error) return <div className="text-xs text-red-500">Failed to load chart</div>;

    return (
        <div className="flex flex-col h-full justify-between">
            <div className="mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Transaction History (14 Days)</h3>
                <p className="text-xl font-bold text-zinc-800">{totalTransactions.toLocaleString()}</p>
            </div>

            <div className="h-[100px] w-full -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            hide
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                border: '1px solid #e4e4e7',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                fontSize: '12px'
                            }}
                            labelStyle={{ color: '#71717a', marginBottom: '4px' }}
                            itemStyle={{ color: '#2563eb', fontWeight: 600 }}
                            formatter={(value: number | undefined) => [value?.toLocaleString() || "0", "Transactions"]}
                            labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorCount)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
