import { Skeleton } from '@/components/Skeleton'

export default function Loading() {
    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                ))}
            </div>
        </div>
    )
}