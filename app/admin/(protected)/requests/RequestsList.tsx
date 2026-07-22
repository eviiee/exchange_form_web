'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { STATUS_LABELS, STATUS_COLORS, STATUS_STEPS } from '@/lib/status-labels'
import { bulkUpdateStatus, bulkUpdateDeliveryFromExcel } from '@/lib/actions/admin-requests'
import { generateDeliveryUploadTemplate } from '@/lib/actions/delivery-template-download'
import ConfirmActionButton from '@/components/ConfirmActionButton'

type RequestRow = {
    id: string
    recipient_name: string
    phone: string
    status: string
    created_at: string
    exchange_request_items: { item_name_snapshot: string; quantity: number }[]
}

type Filters = { status: string; from: string; to: string; searchType: string; q: string }

function formatItemLines(items: { item_name_snapshot: string; quantity: number }[]): string[] {
    if (items.length <= 3) {
        return items.map((i) => i.item_name_snapshot)
    }
    const remaining = items.length - 2
    return [items[0].item_name_snapshot, items[1].item_name_snapshot, `외 ${remaining}개`]
}

export default function RequestsList({ requests, filters }: { requests: RequestRow[]; filters: Filters }) {
    const router = useRouter()
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [templates, setTemplates] = useState<{ id: string; name: string }[]>([])
    const [templatesLoaded, setTemplatesLoaded] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState('')
    const [uploading, setUploading] = useState(false)
    const [uploadResult, setUploadResult] = useState<string | null>(null)

    const allChecked = requests.length > 0 && requests.every((r) => selected.has(r.id))

    const toggleAll = () => {
        setSelected(allChecked ? new Set() : new Set(requests.map((r) => r.id)))
    }

    const toggleOne = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const loadTemplates = async () => {
        if (templatesLoaded) return
        const supabase = createClient()
        const { data } = await supabase.from('excel_templates').select('id, name')
        setTemplates(data ?? [])
        if (data?.[0]) setSelectedTemplate(data[0].id)
        setTemplatesLoaded(true)
    }

    const exportHref = (() => {
        if (!selectedTemplate) return null
        const params = new URLSearchParams({ templateId: selectedTemplate })
        if (selected.size > 0) {
            params.set('ids', Array.from(selected).join(','))
        } else {
            if (filters.status !== 'all') params.set('status', filters.status)
            if (filters.from) params.set('from', filters.from)
            if (filters.to) params.set('to', filters.to)
            if (filters.q) {
                params.set('searchType', filters.searchType)
                params.set('q', filters.q)
            }
        }
        return `/api/admin/export?${params.toString()}`
    })()

    const downloadDeliveryTemplate = async () => {
        const base64 = await generateDeliveryUploadTemplate()
        const link = document.createElement('a')
        link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`
        link.download = '배송정보_업로드양식.xlsx'
        link.click()
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        setUploadResult(null)
        const formData = new FormData()
        formData.set('file', file)
        const result = await bulkUpdateDeliveryFromExcel(formData)
        setUploading(false)
        setUploadResult(
            result.success ? `성공 ${result.successCount}건, 실패 ${result.failCount}건` : result.error ?? '업로드 실패'
        )
        e.target.value = ''
        router.refresh()
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2 items-center py-3 border-y border-line-200 my-3">
                <button type="button" onClick={toggleAll} className="flex items-center gap-1.5 text-xs font-medium text-ink-600">
                    <span
                        className={`w-4 h-4 rounded-md border flex items-center justify-center ${allChecked ? 'bg-primary border-primary' : 'border-line-200'
                            }`}
                    >
                        {allChecked && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        )}
                    </span>
                    전체선택
                </button>

                {selected.size > 0 && <span className="text-xs text-primary font-medium">{selected.size}건 선택됨</span>}

                <div className="flex-1" />

                <select
                    value={selectedTemplate}
                    onFocus={loadTemplates}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-surface-100 outline-none"
                >
                    {templates.length === 0 && <option value="">양식 선택</option>}
                    {templates.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>

                {exportHref ? (
                    <a href={exportHref} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-light text-primary">
                        {selected.size > 0 ? '선택 다운로드' : '전체 다운로드'}
                    </a>
                ) : (
                    <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface-100 text-ink-400">다운로드</span>
                )}

                <button type="button" onClick={downloadDeliveryTemplate} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface-100 text-ink-600">
                    배송양식
                </button>

                <label className="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface-100 text-ink-600 cursor-pointer">
                    {uploading ? '업로드 중...' : '일괄 업로드'}
                    <input type="file" accept=".xlsx" onChange={handleUpload} className="hidden" />
                </label>
            </div>

            {uploadResult && <p className="text-xs text-ink-600 mb-3">{uploadResult}</p>}

            <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span className="text-xs text-ink-600 mr-1">선택 상태변경:</span>
                {STATUS_STEPS.map((s) =>
                    selected.size > 0 ? (
                        <ConfirmActionButton
                            key={s}
                            triggerLabel={STATUS_LABELS[s]}
                            triggerClassName="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface-100 text-ink-600"
                            title="상태를 일괄 변경하시겠습니까?"
                            description={`선택한 ${selected.size}건을 '${STATUS_LABELS[s]}' 상태로 변경합니다.`}
                            confirmLabel="변경"
                            variant="default"
                            onConfirm={async () => {
                                await bulkUpdateStatus(Array.from(selected), s)
                                setSelected(new Set())
                                router.refresh()
                            }}
                        />
                    ) : (
                        <button
                            key={s}
                            type="button"
                            disabled
                            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface-100 text-ink-400 opacity-50 cursor-not-allowed"
                        >
                            {STATUS_LABELS[s]}
                        </button>
                    )
                )}
            </div>

            <ul className="space-y-2">
                {requests.map((req) => (
                    <li key={req.id} className="flex items-start gap-2 p-3.5 rounded-2xl border border-line-200">
                        <button type="button" onClick={() => toggleOne(req.id)} className="shrink-0 mt-3">
                            <span
                                className={`w-4 h-4 rounded-md border flex items-center justify-center ${selected.has(req.id) ? 'bg-primary border-primary' : 'border-line-200'
                                    }`}
                            >
                                {selected.has(req.id) && (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                )}
                            </span>
                        </button>
                        <Link href={`/admin/requests/${req.id}`} className="flex-1 min-w-0 flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-ink-900">{req.recipient_name}</span>
                                    <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium ${STATUS_COLORS[req.status]}`}>
                                        {STATUS_LABELS[req.status]}
                                    </span>
                                </div>
                                <p className="text-xs text-ink-400 truncate">
                                    {new Date(req.created_at).toLocaleDateString('ko-KR')}
                                </p>
                            </div>
                            <div className="text-xs text-ink-400 shrink-0 max-w-[35%] text-right space-y-0.5">
                                {formatItemLines(req.exchange_request_items).map((line, i) => (
                                    <p key={i} className="truncate">{line}</p>
                                ))}
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>

            {requests.length === 0 && <p className="text-center text-sm text-ink-400 py-16">조건에 맞는 신청이 없어요</p>}
        </div>
    )
}