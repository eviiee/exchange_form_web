import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TemplateRowActions from './TemplateRowActions'

export default async function TemplatesPage() {
    const supabase = await createClient()
    const { data: templates } = await supabase.from('excel_templates').select('*').order('created_at')

    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-lg font-bold text-ink-900">엑셀 양식 관리</h1>
                <Link href="/admin/templates/new" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg active:scale-[0.97] transition-transform duration-150">
                    + 양식 추가
                </Link>
            </div>
            <ul className="space-y-2">
                {templates?.map((t) => (
                    <li key={t.id} className="flex items-center justify-between p-3 rounded-2xl border border-line-200">
                        <span className="text-sm font-medium text-ink-900">{t.name}</span>
                        <div className="flex items-center gap-3">
                            <Link href={`/admin/templates/${t.id}/edit`} className="text-xs text-ink-400 hover:text-ink-600">수정</Link>
                            <TemplateRowActions id={t.id} name={t.name} />
                        </div>
                    </li>
                ))}
            </ul>
            {templates?.length === 0 && (
                <p className="text-center text-sm text-ink-400 py-16">등록된 양식이 없어요</p>
            )}
        </div>
    )
}