"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";

const GET_EVENT_DETAIL = gql`
  query EventDetail($id: ID!) {
    event(id: $id) {
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
    chains {
      chainId
      name
      type
    }
  }
`;

const displayType = (eventType: string) => {
  if (eventType === "Transfer") return "Token Transfer";
  if (eventType === "Transaction") return "Transaction";
  return "Contract Event";
};

import { useParams } from "next/navigation";

export default function EventDetailPage() {
  const { id } = useParams();
  const { data, loading, error } = useQuery<any>(GET_EVENT_DETAIL, {
    variables: { id: String(id) },
    skip: !id,
    fetchPolicy: "cache-and-network"
  });

  const event = data?.event;
  const chains = data?.chains ?? [];
  const chain = chains.find((item: any) => item.chainId === event?.chainId);

  if (loading && !event) {
    return <div className="mx-auto max-w-5xl px-6 py-10">Loading event...</div>;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10 text-zinc-500">
        Event not found.
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
          <span>Event Details</span>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900">Event {event.id}</h1>
              <p className="mt-1 text-sm text-zinc-500">
                {new Date(event.timestamp).toLocaleString()}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${event.status === "Failed"
                ? "bg-rose-50 text-rose-700"
                : "bg-emerald-50 text-emerald-700"
                }`}
            >
              {event.status ?? "Success"}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-xs uppercase text-zinc-500">Transaction Hash</div>
              <div className="mt-1 font-mono text-sm text-zinc-800">{event.txHash}</div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-xs uppercase text-zinc-500">Type</div>
              <div className="mt-1 text-sm font-medium text-zinc-800">
                {displayType(event.eventType)}
              </div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-xs uppercase text-zinc-500">Chain</div>
              <div className="mt-1 text-sm font-medium text-zinc-800">
                {chain?.name ?? `Chain ${event.chainId}`}{" "}
                {chain?.type ? `(${chain.type})` : ""}
              </div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-xs uppercase text-zinc-500">Block</div>
              <div className="mt-1 text-sm font-medium text-zinc-800">{event.blockNumber}</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-2 border-b border-zinc-200 pb-4 text-sm md:flex-row md:items-center md:justify-between">
              <span className="text-zinc-500">Contract</span>
              <span className="font-mono text-zinc-800">{event.contractAddress}</span>
            </div>
            <div className="flex flex-col gap-2 border-b border-zinc-200 pb-4 text-sm md:flex-row md:items-center md:justify-between">
              <span className="text-zinc-500">From</span>
              <span className="font-mono text-zinc-800">{event.from ?? "-"}</span>
            </div>
            <div className="flex flex-col gap-2 border-b border-zinc-200 pb-4 text-sm md:flex-row md:items-center md:justify-between">
              <span className="text-zinc-500">To</span>
              <span className="font-mono text-zinc-800">{event.to ?? "-"}</span>
            </div>
            <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
              <span className="text-zinc-500">Amount</span>
              <span className="font-mono text-zinc-800">{(Number(event.amount) / 1000000000000000000).toString() ?? "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
