'use client'

import { useState, useTransition } from 'react'
import { trackRequests } from '@/lib/actions/guest-track'
import { STATUS_LABELS, DELIVERY_TYPE_LABELS } from '@/lib/status-labels'
import StatusTimeline from '@/components/StatusTimeline'

type RequestItem = { item_name_snapshot: string; quantity: number }
type RequestResult = {
    id: string
    status: string
    rejection_reason: string | null
    delivery_type: string | null
    courier_name: string | null
    tracking_number: string | null
    created_at: string
    exchange_request_items: RequestItem[]
}

export default function TrackForm() {
    const [isPending, startTransition] = useTransition()
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [results, setResults] = useState<RequestResult[] | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        startTransition(async () => {
            const result = await trackRequests(name, password)
            if (result.error) {
                setError(result.error)
                setResults(null)
                return
            }
            setResults(result.requests as RequestResult[])
        })
    }

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="수령자명"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-100 border border-transparent focus:border-primary focus:bg-white outline-none transition-colors duration-150 placeholder:text-ink-400"
                />
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="비밀번호"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-100 border border-transparent focus:border-primary focus:bg-white outline-none transition-colors duration-150 placeholder:text-ink-400"
                />
                {error && <p className="text-sm text-danger animate-[fade-in-up_0.2s_ease-out]">{error}</p>}
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
                >
                    {isPending ? '조회 중...' : '조회하기'}
                </button>
            </form>

            {results && (
                <ul className="mt-8 space-y-3">
                    {results.map((req) => (
                        <li
                            key={req.id}
                            className="p-4 rounded-2xl border border-line-200 animate-[fade-in-up_0.25s_ease-out]"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs text-ink-400">
                                    {new Date(req.created_at).toLocaleDateString('ko-KR')}
                                </span>
                                <span className="text-xs text-ink-400">
                                    {req.exchange_request_items.map((i) => i.item_name_snapshot).join(', ')}
                                </span>
                            </div>

                            <StatusTimeline status={req.status} />

                            {req.status === 'rejected' && req.rejection_reason && (
                                <div className="mt-4 p-3 rounded-xl bg-danger-light">
                                    <p className="text-xs text-danger font-medium mb-0.5">거부 사유</p>
                                    <p className="text-sm text-ink-900">{req.rejection_reason}</p>
                                </div>
                            )}

                            {(req.status === 'shipping' || req.status === 'completed') && req.delivery_type && (
                                <div className="mt-4 p-3 rounded-xl bg-surface-100 text-sm text-ink-600 space-y-0.5">
                                    <p>배송 방법: {DELIVERY_TYPE_LABELS[req.delivery_type]}</p>
                                    {req.delivery_type === 'parcel' && req.tracking_number && (
                                        <p>{req.courier_name} · {req.tracking_number}</p>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}