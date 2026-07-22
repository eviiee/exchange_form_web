'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { rejectRequest } from '@/lib/actions/admin-requests'

export default function RejectModal({ id }: { id: string }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleConfirm = () => {
        startTransition(async () => {
            const result = await rejectRequest(id, reason)
            if (result.error) {
                setError(result.error)
                return
            }
            setOpen(false)
            router.refresh()
        })
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="text-sm font-medium text-danger active:scale-[0.97] transition-transform duration-150"
            >
                교환 거부처리
            </button>

            {open && (
                <div
                    className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-5 animate-[overlay-in_0.15s_ease-out]"
                    onClick={() => !isPending && setOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-[360px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] animate-[modal-in_0.2s_cubic-bezier(0.16,1,0.3,1)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="font-semibold text-ink-900 mb-1.5">교환을 거부하시겠습니까?</h2>
                        <p className="text-sm text-ink-600 mb-4">거부 사유는 신청자에게 그대로 노출됩니다.</p>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="거부 사유를 입력하세요"
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-transparent focus:border-primary outline-none transition-colors duration-150 text-sm placeholder:text-ink-400 resize-none"
                        />
                        {error && <p className="text-xs text-danger mt-2">{error}</p>}
                        <div className="flex gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                                className="flex-1 py-3 rounded-xl bg-surface-100 text-ink-900 font-medium active:scale-[0.97] transition-transform duration-150"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isPending}
                                className="flex-1 py-3 rounded-xl bg-danger text-white font-medium active:scale-[0.97] transition-transform duration-150 disabled:opacity-60"
                            >
                                {isPending ? '처리 중...' : '거부하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}