export type ColumnMapping = { field: string; header: string; column: string }

export const EXPORT_FIELDS: { value: string; label: string }[] = [
    { value: 'id', label: '신청ID' },
    { value: 'recipient_name', label: '수령자명' },
    { value: 'phone', label: '전화번호' },
    { value: 'address', label: '주소' },
    { value: 'items', label: '품목/수량' },
    { value: 'status_label', label: '진행상태' },
    { value: 'delivery_type_label', label: '배송방법' },
    { value: 'courier_name', label: '택배사' },
    { value: 'tracking_number', label: '송장번호' },
    { value: 'created_at', label: '신청일시' },
]