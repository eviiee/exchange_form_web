'use server'

import { createClient } from '@/lib/supabase/server'
import ExcelJS from 'exceljs'
import { revalidatePath } from 'next/cache'
import { EXPORT_FIELDS } from '@/lib/excel-fields'

export async function updateRequestStatus(id: string, status: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('exchange_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) return { error: '상태 변경에 실패했습니다.' }

    await supabase.from('status_history').insert({ request_id: id, status, changed_by: user?.id })

    revalidatePath(`/admin/requests/${id}`)
    revalidatePath('/admin/requests')
    return { success: true }
}

export async function rejectRequest(id: string, reason: string) {
    if (!reason.trim()) return { error: '거부 사유를 입력해주세요.' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('exchange_requests')
        .update({ status: 'rejected', rejection_reason: reason, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) return { error: '거부 처리에 실패했습니다.' }

    await supabase
        .from('status_history')
        .insert({ request_id: id, status: 'rejected', note: reason, changed_by: user?.id })

    revalidatePath(`/admin/requests/${id}`)
    revalidatePath('/admin/requests')
    return { success: true }
}
export async function updateDeliveryInfo(
    id: string,
    data: { delivery_type: string; courier_name?: string; tracking_number?: string }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (data.delivery_type === 'parcel' && (!data.courier_name || !data.tracking_number)) {
        return { error: '택배사와 송장번호를 입력해주세요.' }
    }

    const { data: current } = await supabase
        .from('exchange_requests')
        .select('status')
        .eq('id', id)
        .single()

    // 거부/완료 상태는 배송정보 입력만으로 되돌리지 않음
    const shouldAutoAdvance = current && !['rejected', 'completed'].includes(current.status)
    const nextStatus = shouldAutoAdvance ? 'shipping' : current?.status

    const { error } = await supabase
        .from('exchange_requests')
        .update({
            delivery_type: data.delivery_type,
            courier_name: data.delivery_type === 'parcel' ? data.courier_name : null,
            tracking_number: data.delivery_type === 'parcel' ? data.tracking_number : null,
            status: nextStatus,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)

    if (error) return { error: '배송정보 저장에 실패했습니다.' }

    if (shouldAutoAdvance && current?.status !== 'shipping') {
        await supabase.from('status_history').insert({
            request_id: id,
            status: 'shipping',
            note: '배송정보 입력으로 자동 변경',
            changed_by: user?.id,
        })
    }

    revalidatePath(`/admin/requests/${id}`)
    revalidatePath('/admin/requests')
    return { success: true }
}
function normalize(text: string): string {
    return text.replace(/\s/g, '')
}

function findColumnByLabel(sheet: ExcelJS.Worksheet, fieldValue: string): number | null {
    const label = EXPORT_FIELDS.find((f) => f.value === fieldValue)?.label
    if (!label) return null

    const headerRow = sheet.getRow(1)
    for (let col = 1; col <= sheet.columnCount; col++) {
        const cellText = headerRow.getCell(col).text?.trim()
        if (cellText && normalize(cellText) === normalize(label)) {
            return col
        }
    }
    return null
}

export async function bulkUpdateDeliveryFromExcel(formData: FormData) {
    const file = formData.get('file') as File | null
    if (!file) return { error: '파일을 선택해주세요.' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const buffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const sheet = workbook.worksheets[0]

    const idCol = findColumnByLabel(sheet, 'id')
    const typeCol = findColumnByLabel(sheet, 'delivery_type_label')
    const courierCol = findColumnByLabel(sheet, 'courier_name')
    const trackingCol = findColumnByLabel(sheet, 'tracking_number')

    if (!idCol || !typeCol) {
        return { error: '엑셀에서 "신청ID"와 "배송방법" 컬럼을 찾을 수 없습니다. 헤더명을 확인해주세요.' }
    }

    let successCount = 0
    let failCount = 0

    const rows = sheet.getRows(2, sheet.rowCount - 1) ?? []

    for (const row of rows) {
        const id = row.getCell(idCol).text?.trim()
        const deliveryTypeRaw = row.getCell(typeCol).text?.trim()
        const courierName = courierCol ? row.getCell(courierCol).text?.trim() : ''
        const trackingNumber = trackingCol ? row.getCell(trackingCol).text?.trim() : ''

        if (!id || !deliveryTypeRaw) continue

        const deliveryType = { 직접전달: 'direct', 퀵배송: 'quick', 택배배송: 'parcel' }[
            normalize(deliveryTypeRaw)
        ]

        if (!deliveryType) {
            failCount++
            continue
        }

        const { data: current } = await supabase
            .from('exchange_requests')
            .select('status')
            .eq('id', id)
            .single()

        if (!current) {
            failCount++
            continue
        }

        const shouldAutoAdvance = !['rejected', 'completed'].includes(current.status)
        const nextStatus = shouldAutoAdvance ? 'shipping' : current.status

        const { error } = await supabase
            .from('exchange_requests')
            .update({
                delivery_type: deliveryType,
                courier_name: deliveryType === 'parcel' ? courierName || null : null,
                tracking_number: deliveryType === 'parcel' ? trackingNumber || null : null,
                status: nextStatus,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)

        if (error) {
            failCount++
            continue
        }

        if (shouldAutoAdvance && current.status !== 'shipping') {
            await supabase.from('status_history').insert({
                request_id: id,
                status: 'shipping',
                note: '배송정보 일괄 업로드로 자동 변경',
                changed_by: user?.id,
            })
        }

        successCount++
    }

    revalidatePath('/admin/requests')
    return { success: true, successCount, failCount }
}