'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { ALL_STATUSES, STATUS_LABELS } from '@/lib/status-labels'

const SEARCH_TYPES = [
    { value: 'name', label: '이름' },
    { value: 'phone', label: '전화번호' },
    { value: 'item', label: '품목' },
]

export default function RequestsFilter({
    defaultStatus,
    defaultFrom,
    defaultTo,
    defaultSearchType,
    defaultQuery,
    defaultPageSize,
}: {
    defaultStatus: string
    defaultFrom: string
    defaultTo: string
    defaultSearchType: string
    defaultQuery: string
    defaultPageSize: number
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [from, setFrom] = useState(defaultFrom)
    const [to, setTo] = useState(defaultTo)
    const [searchType, setSearchType] = useState(defaultSearchType)
    const [q, setQ] = useState(defaultQuery)

    const applyParams = (overrides: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString())
        const next: Record<string, string> = {
            status: defaultStatus,
            from,
            to,
            searchType,
            q,
            pageSize: String(defaultPageSize),
            ...overrides,
        }

        Object.entries(next).forEach(([key, value]) => {
            const isDefault =
                !value ||
                value === 'all' ||
                (key === 'pageSize' && value === '20') ||
                (key === 'searchType' && value === 'name')
            if (isDefault) params.delete(key)
            else params.set(key, value)
        })

        params.delete('page')
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
                {['all', ...ALL_STATUSES].map((s) => (
                    <button
                        key={s}
                        onClick={() => applyParams({ status: s })}
                        className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-150 ${defaultStatus === s ? 'bg-ink-900 text-white' : 'bg-surface-100 text-ink-600'
                            }`}
                    >
                        {s === 'all' ? '전체' : STATUS_LABELS[s]}
                    </button>
                ))}
            </div>

            <div className="flex gap-1.5 items-center">
                <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    onBlur={() => applyParams({ from })}
                    className="flex-1 px-3 py-2 rounded-xl bg-surface-100 text-xs outline-none"
                />
                <span className="text-xs text-ink-400">~</span>
                <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    onBlur={() => applyParams({ to })}
                    className="flex-1 px-3 py-2 rounded-xl bg-surface-100 text-xs outline-none"
                />
            </div>

            <div className="flex gap-1.5">
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-surface-100 text-sm outline-none shrink-0"
                >
                    {SEARCH_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyParams({ searchType, q })}
                    placeholder="검색어 입력 후 Enter"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-surface-100 text-sm outline-none placeholder:text-ink-400"
                />
            </div>

            <div className="flex justify-end">
                <select
                    value={defaultPageSize}
                    onChange={(e) => applyParams({ pageSize: e.target.value })}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-surface-100 outline-none"
                >
                    <option value={20}>20개씩</option>
                    <option value={50}>50개씩</option>
                    <option value={100}>100개씩</option>
                </select>
            </div>
        </div>
    )
}