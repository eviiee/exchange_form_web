import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { STATUS_LABELS, DELIVERY_TYPE_LABELS } from '@/lib/status-labels'

export async function GET(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('admin_profiles').select('id').eq('id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const templateId = req.nextUrl.searchParams.get('templateId')
    const idsParam = req.nextUrl.searchParams.get('ids')
    const status = req.nextUrl.searchParams.get('status')
    const from = req.nextUrl.searchParams.get('from')
    const to = req.nextUrl.searchParams.get('to')
    const searchType = req.nextUrl.searchParams.get('searchType')
    const q = req.nextUrl.searchParams.get('q')

    const { data: template } = await supabase.from('excel_templates').select('*').eq('id', templateId).single()
    if (!template) return NextResponse.json({ error: 'template not found' }, { status: 404 })

    let query = supabase
        .from('exchange_requests')
        .select(`
      id, recipient_name, phone, address_zonecode, address_road, address_detail,
      status, delivery_type, courier_name, tracking_number, created_at,
      exchange_request_items ( item_name_snapshot, quantity )
    `)
        .order('created_at', { ascending: false })

    if (idsParam) {
        query = query.in('id', idsParam.split(','))
    } else {
        if (status && status !== 'all') query = query.eq('status', status)
        if (from) query = query.gte('created_at', from)
        if (to) query = query.lte('created_at', `${to}T23:59:59`)

        if (searchType === 'item' && q) {
            const { data: matched } = await supabase
                .from('exchange_request_items')
                .select('request_id')
                .ilike('item_name_snapshot', `%${q}%`)
            const itemIds = Array.from(new Set((matched ?? []).map((m) => m.request_id)))
            query = query.in('id', itemIds.length ? itemIds : ['00000000-0000-0000-0000-000000000000'])
        } else if (searchType === 'name' && q) {
            query = query.ilike('recipient_name', `%${q}%`)
        } else if (searchType === 'phone' && q) {
            query = query.ilike('phone', `%${q}%`)
        }
    }

    const { data: requests } = await query
    if (!requests) return NextResponse.json({ error: 'query failed' }, { status: 500 })

    const requestedIds = requests.filter((r) => r.status === 'requested').map((r) => r.id)
    if (requestedIds.length > 0) {
        await supabase
            .from('exchange_requests')
            .update({ status: 'preparing', updated_at: new Date().toISOString() })
            .in('id', requestedIds)
        await supabase.from('status_history').insert(
            requestedIds.map((id) => ({ request_id: id, status: 'preparing', note: '목록 다운로드로 자동 변경', changed_by: user.id }))
        )
        requests.forEach((r) => { if (requestedIds.includes(r.id)) r.status = 'preparing' })
    }

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('교환신청목록')
    const mapping = template.column_mapping as { field: string; header: string; column: string }[]

    mapping.forEach((m) => {
        const cell = sheet.getCell(`${m.column}1`)
        cell.value = m.header
        cell.font = { bold: true }
    })

    const fieldValue = (req: (typeof requests)[number], field: string): string => {
        switch (field) {
            case 'id': return req.id
            case 'recipient_name': return req.recipient_name
            case 'phone': return req.phone
            case 'address': return `(${req.address_zonecode}) ${req.address_road} ${req.address_detail ?? ''}`.trim()
            case 'items': return req.exchange_request_items.map((i) => `${i.item_name_snapshot} x${i.quantity}`).join(', ')
            case 'status_label': return STATUS_LABELS[req.status] ?? req.status
            case 'delivery_type_label': return req.delivery_type ? DELIVERY_TYPE_LABELS[req.delivery_type] : ''
            case 'courier_name': return req.courier_name ?? ''
            case 'tracking_number': return req.tracking_number ?? ''
            case 'created_at': return new Date(req.created_at).toLocaleString('ko-KR')
            default: return ''
        }
    }

    requests.forEach((req, rowIndex) => {
        mapping.forEach((m) => {
            sheet.getCell(`${m.column}${rowIndex + 2}`).value = fieldValue(req, m.field)
        })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(template.name)}.xlsx"`,
        },
    })
}