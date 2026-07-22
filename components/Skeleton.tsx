export function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-surface-100 rounded-xl ${className}`} />
}