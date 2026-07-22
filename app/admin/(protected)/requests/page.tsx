import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import RequestsFilter from './RequestsFilter'
import RequestsList from './RequestsList'
import Pagination from './Pagination'

type SearchParams = {
    status?: string
    from?: string
    to?: string
    searchType?: string
    q?: string
    pageSize?: string
    page?: string
}

export default async function RequestsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const sp = await searchParams
    const status = sp.status ?? 'all'
    const from = sp.from ?? ''
    const to = sp.to ?? ''
    const searchType = sp.searchType ?? 'name'
    const q = sp.q ?? ''
    const pageSize = Number(sp.pageSize ?? 20)
    const page = Number(sp.page ?? 1)

    const supabase = await createClient()

    // 품목명 검색은 join 테이블을 먼저 조회해서 request_id 목록을 뽑아야 함
    let itemMatchedIds: string[] | null = null
    if (searchType === 'item' && q) {
        const { data: matched } = await supabase
            .from('exchange_request_items')
            .select('request_id')
            .ilike('item_name_snapshot', `%${q}%`)
        itemMatchedIds = Array.from(new Set((matched ?? []).map((m) => m.request_id)))
        if (itemMatchedIds.length === 0) itemMatchedIds = ['00000000-0000-0000-0000-000000000000']
    }

    let query = supabase
        .from('exchange_requests')
        .select(
            'id, recipient_name, phone, status, created_at, exchange_request_items ( item_name_snapshot, quantity )',
            { count: 'exact' }
        )
        .order('created_at', { ascending: false })

    if (status !== 'all') query = query.eq('status', status)
    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', `${to}T23:59:59`)
    if (searchType === 'name' && q) query = query.ilike('recipient_name', `%${q}%`)
    if (searchType === 'phone' && q) query = query.ilike('phone', `%${q}%`)
    if (itemMatchedIds) query = query.in('id', itemMatchedIds)

    const rangeFrom = (page - 1) * pageSize
    const rangeTo = rangeFrom + pageSize - 1
    query = query.range(rangeFrom, rangeTo)

    const { data: requests, count } = await query
    const totalCount = count ?? 0
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-lg font-bold text-ink-900">교환 신청 목록</h1>
                <Link href="/admin/templates" className="text-xs text-ink-400 hover:text-ink-600">
                    엑셀 양식 관리
                </Link>
            </div>

            <RequestsFilter
                key={`${status}-${from}-${to}-${searchType}-${q}-${pageSize}`}
                defaultStatus={status}
                defaultFrom={from}
                defaultTo={to}
                defaultSearchType={searchType}
                defaultQuery={q}
                defaultPageSize={pageSize}
            />

            <p className="text-xs text-ink-400 mt-3 mb-2">총 {totalCount}건</p>

            <RequestsList requests={requests ?? []} filters={{ status, from, to, searchType, q }} />

            <Pagination currentPage={page} totalPages={totalPages} />
        </div>
    )
}