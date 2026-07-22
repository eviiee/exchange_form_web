export const STATUS_LABELS: Record<string, string> = {
    requested: '신청완료',
    rejected: '교환거부',
    preparing: '교환제품 준비중',
    shipping: '교환제품 배송중',
    completed: '교환완료',
}

export const STATUS_COLORS: Record<string, string> = {
    requested: 'bg-surface-100 text-ink-600',
    rejected: 'bg-danger-light text-danger',
    preparing: 'bg-primary-light text-primary',
    shipping: 'bg-primary-light text-primary',
    completed: 'bg-primary text-white',
}

export const DELIVERY_TYPE_LABELS: Record<string, string> = {
    direct: '직접 전달',
    quick: '퀵배송',
    parcel: '택배 배송',
}

export const STATUS_STEPS = ['requested', 'preparing', 'shipping', 'completed'] as const

export const ALL_STATUSES = ['requested', 'preparing', 'shipping', 'completed', 'rejected'] as const