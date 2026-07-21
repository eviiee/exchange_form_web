import { createItem } from '@/lib/actions/items'
import ItemForm from '../ItemForm'

export default function NewItemPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">품목 추가</h1>
      <ItemForm action={createItem} />
    </div>
  )
}