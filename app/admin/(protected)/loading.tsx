import { Skeleton } from '@/components/Skeleton'

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
            </div>
            <div>
                <Skeleton className="h-4 w-32 mb-3" />
                <div className="space-y-1.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-12" />
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-2xl" />
                ))}
            </div>
        </div>
    )
}