'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ColumnMapping } from '@/lib/excel-fields'

export async function saveExcelTemplate(id: string | null, name: string, mapping: ColumnMapping[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!name.trim()) return { error: '양식 이름을 입력해주세요.' }
    if (mapping.length === 0) return { error: '컬럼을 1개 이상 지정해주세요.' }

    if (id) {
        const { error } = await supabase
            .from('excel_templates')
            .update({ name, column_mapping: mapping })
            .eq('id', id)
        if (error) return { error: '양식 수정에 실패했습니다.' }
    } else {
        const { error } = await supabase
            .from('excel_templates')
            .insert({ name, column_mapping: mapping, created_by: user?.id })
        if (error) return { error: '양식 생성에 실패했습니다.' }
    }

    revalidatePath('/admin/templates')
    return { success: true }
}

export async function deleteExcelTemplate(id: string) {
    const supabase = await createClient()
    await supabase.from('excel_templates').delete().eq('id', id)
    revalidatePath('/admin/templates')
}