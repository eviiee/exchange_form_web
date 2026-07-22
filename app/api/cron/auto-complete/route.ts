import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { data: shippingRequests, error: fetchError } = await supabaseAdmin
        .from('exchange_requests')
        .select('id')
        .eq('status', 'shipping')

    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }
    if (!shippingRequests || shippingRequests.length === 0) {
        return NextResponse.json({ updated: 0 })
    }

    const ids = shippingRequests.map((r) => r.id)

    // 각 신청 건의 "가장 최근에 shipping으로 바뀐 시점" 조회
    const { data: history, error: historyError } = await supabaseAdmin
        .from('status_history')
        .select('request_id, status, changed_at')
        .in('request_id', ids)
        .eq('status', 'shipping')
        .order('changed_at', { ascending: false })

    if (historyError) {
        return NextResponse.json({ error: historyError.message }, { status: 500 })
    }

    const latestShippedAt = new Map<string, string>()
    for (const h of history ?? []) {
        if (!latestShippedAt.has(h.request_id)) {
            latestShippedAt.set(h.request_id, h.changed_at)
        }
    }

    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

    const targetIds = ids.filter((id) => {
        const shippedAt = latestShippedAt.get(id)
        return shippedAt && new Date(shippedAt) <= fiveDaysAgo
    })

    if (targetIds.length === 0) {
        return NextResponse.json({ updated: 0 })
    }

    const { error: updateError } = await supabaseAdmin
        .from('exchange_requests')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .in('id', targetIds)

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await supabaseAdmin.from('status_history').insert(
        targetIds.map((id) => ({
            request_id: id,
            status: 'completed',
            note: '배송 5일 경과로 자동 완료 처리',
        }))
    )

    return NextResponse.json({ updated: targetIds.length })
}