'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateRequestStatus } from '@/lib/actions/admin-requests'
import { STATUS_STEPS, STATUS_LABELS } from '@/lib/status-labels'

export default function StatusActions({ id, currentStatus }: { id: string; currentStatus: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    if (currentStatus === 'rejected') return null

    return (
        <div className="flex gap-2 flex-wrap">
            {STATUS_STEPS.map((s) => (
                <button
                    key={s}
                    disabled={isPending || s === currentStatus}
                    onClick={() =>
                        startTransition(async () => {
                            await updateRequestStatus(id, s)
                            router.refresh()
                        })
                    }
                    className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors duration-150 disabled:opacity-40 ${s === currentStatus ? 'bg-primary text-white' : 'bg-surface-100 text-ink-600'
                        }`}
                >
                    {STATUS_LABELS[s]}
                </button>
            ))}
        </div>
    )
}