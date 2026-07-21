'use client'

import { useState, useTransition } from 'react'

export default function ConfirmActionButton({
  onConfirm,
  triggerLabel,
  triggerClassName,
  title,
  description,
  confirmLabel = '확인',
  variant = 'danger',
}: {
  onConfirm: () => Promise<void> | void
  triggerLabel: React.ReactNode
  triggerClassName?: string
  title: string
  description: string
  confirmLabel?: string
  variant?: 'danger' | 'default'
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm()
      setOpen(false)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`active:scale-[0.96] transition-transform duration-150 ${triggerClassName ?? ''}`}
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-5 animate-[overlay-in_0.15s_ease-out]"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-[340px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] animate-[modal-in_0.2s_cubic-bezier(0.16,1,0.3,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-semibold text-ink-900 mb-1.5">{title}</h2>
            <p className="text-sm text-ink-600 mb-6 leading-relaxed">{description}</p>
            <div className="flex gap-2">
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
                className={`flex-1 py-3 rounded-xl text-white font-medium active:scale-[0.97] transition-transform duration-150 disabled:opacity-60 ${
                  variant === 'danger' ? 'bg-danger' : 'bg-primary'
                }`}
              >
                {isPending ? '처리 중...' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}