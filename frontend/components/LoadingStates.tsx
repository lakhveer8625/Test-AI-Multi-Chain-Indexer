// Loading Skeleton Components for premium UX
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-100 last:border-0">
                    <td className="px-5 py-4">
                        <div className="skeleton h-4 w-16"></div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="skeleton h-4 w-12"></div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="skeleton h-4 w-32"></div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="skeleton h-6 w-24 rounded-full"></div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="skeleton h-4 w-20"></div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="skeleton h-4 w-20"></div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="skeleton h-4 w-20"></div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="skeleton h-4 w-16"></div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="skeleton h-6 w-20 rounded-full"></div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="skeleton h-6 w-16 rounded-full"></div>
                    </td>
                </tr>
            ))}
        </>
    );
};

export const CardSkeleton = () => {
    return (
        <div className="premium-card p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="skeleton h-6 w-32"></div>
                <div className="skeleton h-8 w-24 rounded-lg"></div>
            </div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-3/4"></div>
        </div>
    );
};

const getIconElement = (icon: "search" | "inbox" | "filter") => {
    switch (icon) {
        case "inbox":
            return (
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            );
        case "filter":
            return (
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
            );
        default:
            return (
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            );
    }
};

export const EmptyState = ({
    title = "No data found",
    description = "Try adjusting your filters or search query.",
    icon = "search"
}: {
    title?: string;
    description?: string;
    icon?: "search" | "inbox" | "filter";
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
            <div className="mb-4 rounded-full bg-zinc-100 p-6 text-zinc-400">
                {getIconElement(icon)}
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">{title}</h3>
            <p className="text-sm text-zinc-500 max-w-sm">{description}</p>
        </div>
    );
};
