import { createClient } from '@/lib/supabase/server'
import { updateItem } from '@/lib/actions/items'
import ItemForm from '../../ItemForm'
import { notFound } from 'next/navigation'

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: item } = await supabase.from('items').select('*').eq('id', id).single()

  if (!item) notFound()

  const imageUrl = item.image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${item.image_path}`
    : null

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">품목 수정</h1>
      <ItemForm action={updateItem.bind(null, id)} defaultName={item.name} defaultImageUrl={imageUrl} />
    </div>
  )
}