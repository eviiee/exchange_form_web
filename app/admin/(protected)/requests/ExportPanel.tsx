'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateDeliveryUploadTemplate } from '@/lib/actions/delivery-template-download'
import { bulkUpdateDeliveryFromExcel } from '@/lib/actions/admin-requests'

export default function ExportPanel({ status }: { status: string }) {
    const [templates, setTemplates] = useState<{ id: string; name: string }[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState('')
    const [uploadResult, setUploadResult] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        const supabase = createClient()
        supabase.from('excel_templates').select('id, name').then(({ data }) => {
            setTemplates(data ?? [])
            if (data?.[0]) setSelectedTemplate(data[0].id)
        })
    }, [])

    const downloadTemplateFile = async () => {
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
        if (result.success) {
            setUploadResult(`성공 ${result.successCount}건, 실패 ${result.failCount}건`)
        } else {
            setUploadResult(result.error ?? '업로드 실패')
        }
        e.target.value = ''
    }
    return (
        <div className="flex flex-wrap gap-2 mt-3 items-center">
            <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg bg-surface-100 outline-none"
            >
                {templates.length === 0 && <option value="">양식 없음</option>}
                {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>

            {selectedTemplate ? (

                <a
                    href={`/api/admin/export?templateId=${selectedTemplate}&status=${status}`}
                    className="text-xs font-medium px-3 py-2 rounded-lg bg-primary-light text-primary"
                >
                    목록 다운로드
                </a>
            ) : (
                <span className="text-xs font-medium px-3 py-2 rounded-lg bg-surface-100 text-ink-400">
                    목록 다운로드
                </span>
            )
            }

            <button
                type="button"
                onClick={downloadTemplateFile}
                className="text-xs font-medium px-3 py-2 rounded-lg bg-surface-100 text-ink-600"
            >
                배송정보 양식 받기
            </button>

            <label className="text-xs font-medium px-3 py-2 rounded-lg bg-surface-100 text-ink-600 cursor-pointer">
                {uploading ? '업로드 중...' : '배송정보 일괄 업로드'}
                <input type="file" accept=".xlsx" onChange={handleUpload} className="hidden" />
            </label>

            {uploadResult && <span className="text-xs text-ink-600">{uploadResult}</span>}
        </div >
    )
}