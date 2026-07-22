'use server'

import ExcelJS from 'exceljs'
import { EXPORT_FIELDS } from '@/lib/excel-fields'

export async function generateDeliveryUploadTemplate(): Promise<string> {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('배송정보')

    const idLabel = EXPORT_FIELDS.find((f) => f.value === 'id')!.label
    const typeLabel = EXPORT_FIELDS.find((f) => f.value === 'delivery_type_label')!.label
    const courierLabel = EXPORT_FIELDS.find((f) => f.value === 'courier_name')!.label
    const trackingLabel = EXPORT_FIELDS.find((f) => f.value === 'tracking_number')!.label

    sheet.columns = [
        { header: idLabel, key: 'id', width: 38 },
        { header: typeLabel, key: 'type', width: 14 },
        { header: courierLabel, key: 'courier', width: 16 },
        { header: trackingLabel, key: 'tracking', width: 20 },
    ]
    sheet.getRow(1).font = { bold: true }
    sheet.addRow(['(예시) 신청 상세 페이지에서 ID 복사', '택배 배송', 'CJ대한통운', '123456789012'])

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer).toString('base64')
}