import { Skeleton } from '@/components/Skeleton'

export default function Loading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-16" />
            <Skeleton className="h-20" />
            <Skeleton className="h-24" />
            <Skeleton className="h-10 w-48" />
        </div>
    )
}