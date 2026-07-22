import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TemplateForm from '../../TemplateForm'

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: template } = await supabase.from('excel_templates').select('*').eq('id', id).single()
    if (!template) notFound()

    return (
        <div>
            <h1 className="text-lg font-bold text-ink-900 mb-5">엑셀 양식 수정</h1>
            <TemplateForm id={id} defaultName={template.name} defaultMapping={template.column_mapping} />
        </div>
    )
}