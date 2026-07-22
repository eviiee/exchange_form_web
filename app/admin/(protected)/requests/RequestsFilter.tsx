'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { ALL_STATUSES, STATUS_LABELS } from '@/lib/status-labels'

export default function RequestsFilter({
    defaultStatus,
    defaultQuery,
}: {
    defaultStatus: string
    defaultQuery: string
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [q, setQ] = useState(defaultQuery)

    const applyFilter = (status: string, query: string) => {
        const params = new URLSearchParams()
        if (status !== 'all') params.set('status', status)
        if (query) params.set('q', query)
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
                {['all', ...ALL_STATUSES].map((s) => (
                    <button
                        key={s}
                        onClick={() => applyFilter(s, q)}
                        className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-150 ${defaultStatus === s ? 'bg-ink-900 text-white' : 'bg-surface-100 text-ink-600'
                            }`}
                    >
                        {s === 'all' ? '전체' : STATUS_LABELS[s]}
                    </button>
                ))}
            </div>
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilter(defaultStatus, q)}
                placeholder="수령자명 검색"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-100 text-sm outline-none placeholder:text-ink-400"
            />
        </div>
    )
}