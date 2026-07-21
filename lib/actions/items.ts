'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createItem(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const file = formData.get('image') as File | null

  const { data: item, error } = await supabase
    .from('items')
    .insert({ name })
    .select()
    .single()

  if (error || !item) {
    return { error: '품목 생성에 실패했습니다.' }
  }

  if (file && file.size > 0) {
    const filePath = `${item.id}.webp`

    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(filePath, file, { contentType: 'image/webp', upsert: true })

    if (!uploadError) {
      await supabase.from('items').update({ image_path: filePath }).eq('id', item.id)
    }
  }

  revalidatePath('/admin/items')
  return { success: true }
}

export async function updateItem(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const file = formData.get('image') as File | null

  const updates: Record<string, unknown> = { name, updated_at: new Date().toISOString() }

  if (file && file.size > 0) {
    const filePath = `${id}.webp`

    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(filePath, file, { contentType: 'image/webp', upsert: true })

    if (!uploadError) {
      updates.image_path = filePath
    }
  }

  const { error } = await supabase.from('items').update(updates).eq('id', id)

  if (error) return { error: '품목 수정에 실패했습니다.' }

  revalidatePath('/admin/items')
  return { success: true }
}

export async function toggleItemActive(id: string, isActive: boolean) {
  const supabase = await createClient()
  await supabase.from('items').update({ is_active: isActive }).eq('id', id)
  revalidatePath('/admin/items')
}

export async function deleteItem(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('items').delete().eq('id', id)
  if (error) return { error: '삭제에 실패했습니다.' }

  await supabase.storage.from('item-images').remove([`${id}.webp`])

  revalidatePath('/admin/items')
  return { success: true }
}

export async function deleteItemAction(id: string) {
  await deleteItem(id)
}