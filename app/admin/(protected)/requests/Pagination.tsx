'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'


export default function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        if (page <= 1) params.delete('page')
        else params.set('page', String(page))
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex items-center justify-center gap-3 mt-6">
            <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="text-sm px-3 py-2 rounded-lg bg-surface-100 text-ink-600 disabled:opacity-40"
            >
                이전
            </button>
            <span className="text-sm text-ink-600">{currentPage} / {totalPages}</span>
            <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="text-sm px-3 py-2 rounded-lg bg-surface-100 text-ink-600 disabled:opacity-40"
            >
                다음
            </button>
        </div>
    )
}