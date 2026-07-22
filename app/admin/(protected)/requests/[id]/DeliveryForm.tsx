'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateDeliveryInfo } from '@/lib/actions/admin-requests'
import { DELIVERY_TYPE_LABELS } from '@/lib/status-labels'

export default function DeliveryForm({
    id,
    defaultType,
    defaultCourier,
    defaultTracking,
}: {
    id: string
    defaultType: string
    defaultCourier: string
    defaultTracking: string
}) {
    const router = useRouter()
    const [type, setType] = useState(defaultType)
    const [courier, setCourier] = useState(defaultCourier)
    const [tracking, setTracking] = useState(defaultTracking)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        setLoading(true)
        setError(null)
        const result = await updateDeliveryInfo(id, { delivery_type: type, courier_name: courier, tracking_number: tracking })
        setLoading(false)
        if (result.error) {
            setError(result.error)
            return
        }
        router.refresh()
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-1.5">
                {Object.entries(DELIVERY_TYPE_LABELS).map(([value, label]) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setType(value)}
                        className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors duration-150 ${type === value ? 'bg-primary text-white' : 'bg-surface-100 text-ink-600'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {type === 'parcel' && (
                <div className="flex gap-2 animate-[fade-in-up_0.2s_ease-out]">
                    <input
                        value={courier}
                        onChange={(e) => setCourier(e.target.value)}
                        placeholder="택배사"
                        className="flex-1 px-3 py-2.5 rounded-xl bg-surface-100 text-sm outline-none placeholder:text-ink-400"
                    />
                    <input
                        value={tracking}
                        onChange={(e) => setTracking(e.target.value)}
                        placeholder="송장번호"
                        className="flex-1 px-3 py-2.5 rounded-xl bg-surface-100 text-sm outline-none placeholder:text-ink-400"
                    />
                </div>
            )}

            {error && <p className="text-xs text-danger">{error}</p>}

            <button
                onClick={handleSave}
                disabled={loading}
                className="text-sm font-medium px-4 py-2.5 rounded-lg bg-primary text-white active:scale-[0.97] transition-transform duration-150 disabled:opacity-50"
            >
                {loading ? '저장 중...' : '배송정보 저장'}
            </button>
        </div>
    )
}