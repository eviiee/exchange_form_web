import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import RequestsFilter from './RequestsFilter'
import ExportPanel from './ExportPanel'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/status-labels'

export default async function RequestsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; q?: string }>
}) {
    const { status, q } = await searchParams
    const supabase = await createClient()

    let query = supabase
        .from('exchange_requests')
        .select('id, recipient_name, phone, status, created_at, exchange_request_items ( item_name_snapshot, quantity )')
        .order('created_at', { ascending: false })
        .limit(200)

    if (status && status !== 'all') query = query.eq('status', status)
    if (q) query = query.ilike('recipient_name', `%${q}%`)

    const { data: requests } = await query

    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-lg font-bold text-ink-900">교환 신청 목록</h1>
                <Link href="/admin/templates" className="text-xs text-ink-400 hover:text-ink-600">엑셀 양식 관리</Link>
            </div>

            <RequestsFilter defaultStatus={status ?? 'all'} defaultQuery={q ?? ''} />
            <ExportPanel status={status ?? 'all'} />

            <ul className="space-y-2 mt-4">
                {requests?.map((req) => (
                    <li key={req.id}>
                        <Link
                            href={`/admin/requests/${req.id}`}
                            className="flex items-center gap-3 p-3.5 rounded-2xl border border-line-200 hover:border-ink-400/30 transition-colors duration-150"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-ink-900">{req.recipient_name}</span>
                                    <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium ${STATUS_COLORS[req.status]}`}>
                                        {STATUS_LABELS[req.status]}
                                    </span>
                                </div>
                                <p className="text-xs text-ink-400 truncate">
                                    {req.exchange_request_items.map((i) => i.item_name_snapshot).join(', ')}
                                </p>
                            </div>
                            <span className="text-xs text-ink-400 shrink-0">
                                {new Date(req.created_at).toLocaleDateString('ko-KR')}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>

            {requests?.length === 0 && (
                <p className="text-center text-sm text-ink-400 py-16">조건에 맞는 신청이 없어요</p>
            )}
        </div>
    )
}