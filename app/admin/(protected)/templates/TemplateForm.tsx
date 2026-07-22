'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveExcelTemplate } from '@/lib/actions/excel-templates'
import { EXPORT_FIELDS, type ColumnMapping } from '@/lib/excel-fields'

function columnLetter(index: number): string {
    // 0 -> A, 1 -> B ... 25 -> Z, 26 -> AA ...
    let result = ''
    let n = index
    while (n >= 0) {
        result = String.fromCharCode((n % 26) + 65) + result
        n = Math.floor(n / 26) - 1
    }
    return result
}



export default function TemplateForm({
    id = null,
    defaultName = '',
    defaultMapping = [],
}: {
    id?: string | null
    defaultName?: string
    defaultMapping?: ColumnMapping[]
}) {
    const router = useRouter()
    const [name, setName] = useState(defaultName)
    const [mapping, setMapping] = useState<ColumnMapping[]>(
        defaultMapping.length
            ? defaultMapping
            : EXPORT_FIELDS.map((f, i) => ({ field: f.value, header: f.label, column: columnLetter(i) }))
    )
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const addRow = () =>
        setMapping([
            ...mapping,
            { field: EXPORT_FIELDS[0].value, header: EXPORT_FIELDS[0].label, column: columnLetter(mapping.length) },
        ])
    const removeRow = (i: number) => setMapping(mapping.filter((_, idx) => idx !== i))
    const updateRow = (i: number, patch: Partial<ColumnMapping>) =>
        setMapping(mapping.map((m, idx) => (idx === i ? { ...m, ...patch } : m)))

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)
        const result = await saveExcelTemplate(id, name, mapping)
        setLoading(false)
        if (result.error) {
            setError(result.error)
            return
        }
        router.push('/admin/templates')
        router.refresh()
    }

    return (
        <div className="space-y-5">
            <div>
                <label className="text-sm font-medium text-ink-900 block mb-2">양식 이름</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 물류팀 전달용"
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-100 border border-transparent focus:border-primary focus:bg-white outline-none transition-colors duration-150 placeholder:text-ink-400"
                />
            </div>

            <div>
                <label className="text-sm font-medium text-ink-900 block mb-2">컬럼 구성</label>
                <div className="space-y-2">
                    {mapping.map((m, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <select
                                value={m.field}
                                onChange={(e) => {
                                    const label = EXPORT_FIELDS.find((f) => f.value === e.target.value)?.label ?? ''
                                    updateRow(i, { field: e.target.value, header: label })
                                }}
                                className="flex-1 px-3 py-2.5 rounded-xl bg-surface-100 text-sm outline-none"
                            >
                                {EXPORT_FIELDS.map((f) => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                            </select>
                            <input
                                value={m.header}
                                onChange={(e) => updateRow(i, { header: e.target.value })}
                                placeholder="표시할 헤더명"
                                className="flex-1 px-3 py-2.5 rounded-xl bg-surface-100 text-sm outline-none placeholder:text-ink-400"
                            />
                            <input
                                value={m.column}
                                onChange={(e) => updateRow(i, { column: e.target.value.toUpperCase() })}
                                placeholder="열"
                                maxLength={2}
                                className="w-14 px-3 py-2.5 rounded-xl bg-surface-100 text-sm outline-none text-center placeholder:text-ink-400"
                            />
                            <button type="button" onClick={() => removeRow(i)} className="text-danger text-sm px-1">✕</button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={addRow}
                    className="mt-3 text-sm text-primary font-medium"
                >
                    + 컬럼 추가
                </button>
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
            >
                {loading ? '저장 중...' : '저장'}
            </button>
        </div>
    )
}