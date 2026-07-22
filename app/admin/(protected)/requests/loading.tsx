import { Skeleton } from '@/components/Skeleton'

export default function Loading() {
    return (
        <div>
            <Skeleton className="h-6 w-40 mb-5" />
            <div className="flex gap-1.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-16" />
                ))}
            </div>
            <Skeleton className="h-24 mb-3" />
            <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                ))}
            </div>
        </div>
    )
}