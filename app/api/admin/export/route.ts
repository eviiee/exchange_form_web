import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { STATUS_LABELS, DELIVERY_TYPE_LABELS } from '@/lib/status-labels'

export async function GET(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('id', user.id)
        .single()
    if (!profile) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const templateId = req.nextUrl.searchParams.get('templateId')
    const status = req.nextUrl.searchParams.get('status')

    const { data: template } = await supabase
        .from('excel_templates')
        .select('*')
        .eq('id', templateId)
        .single()

    if (!template) return NextResponse.json({ error: 'template not found' }, { status: 404 })

    let query = supabase
        .from('exchange_requests')
        .select(`
      id, recipient_name, phone, address_zonecode, address_road, address_detail,
      status, delivery_type, courier_name, tracking_number, created_at,
      exchange_request_items ( item_name_snapshot, quantity )
    `)
        .order('created_at', { ascending: false })

    if (status && status !== 'all') query = query.eq('status', status)

    const { data: requests } = await query
    if (!requests) return NextResponse.json({ error: 'query failed' }, { status: 500 })

    // 다운로드된 목록 중 "신청완료" 상태는 "교환제품 준비중"으로 자동 전환
    const requestedIds = requests.filter((r) => r.status === 'requested').map((r) => r.id)

    if (requestedIds.length > 0) {
        await supabase
            .from('exchange_requests')
            .update({ status: 'preparing', updated_at: new Date().toISOString() })
            .in('id', requestedIds)

        await supabase.from('status_history').insert(
            requestedIds.map((id) => ({
                request_id: id,
                status: 'preparing',
                note: '목록 다운로드로 자동 변경',
                changed_by: user.id,
            }))
        )

        // 엑셀 결과물에도 변경된 상태가 반영되도록 메모리상에서도 갱신
        requests.forEach((r) => {
            if (requestedIds.includes(r.id)) r.status = 'preparing'
        })
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