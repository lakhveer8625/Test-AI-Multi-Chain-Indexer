export const formatTimeAgo = (value: string) => {
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

export const shortenHash = (value?: string, size = 10) => {
    if (!value) return "-";
    if (value.length <= size + 4) return value;
    return `${value.slice(0, size)}...${value.slice(-4)}`;
};
