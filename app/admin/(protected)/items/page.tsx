import { createClient } from '@/lib/supabase/server'
import { toggleItemActive } from '@/lib/actions/items'
import ItemRowActions from './ItemRowActions'
import Link from 'next/link'
import Image from 'next/image'

export default async function ItemsPage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-lg font-bold text-ink-900">품목 관리</h1>
        <Link
          href="/admin/items/new"
          className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg active:scale-[0.97] transition-transform duration-150"
        >
          + 품목 추가
        </Link>
      </div>

      <ul className="space-y-2">
        {items?.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-2xl border border-line-200 hover:border-ink-400/30 transition-colors duration-150"
          >
            <div className="w-12 h-12 relative bg-surface-100 rounded-xl overflow-hidden shrink-0">
              {item.image_path && (
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${item.image_path}`}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <span className="flex-1 text-sm text-ink-900 font-medium truncate">{item.name}</span>
            <span
              className={`text-xs px-2 py-1 rounded-md font-medium ${
                item.is_active ? 'bg-primary-light text-primary' : 'bg-surface-100 text-ink-400'
              }`}
            >
              {item.is_active ? '노출중' : '숨김'}
            </span>
            <form action={toggleItemActive.bind(null, item.id, !item.is_active)}>
              <button
                type="submit"
                className="text-xs text-ink-400 hover:text-ink-600 active:scale-[0.96] transition-all duration-150"
              >
                {item.is_active ? '숨기기' : '노출'}
              </button>
            </form>
            <Link
              href={`/admin/items/${item.id}/edit`}
              className="text-xs text-ink-400 hover:text-ink-600 transition-colors duration-150"
            >
              수정
            </Link>
            <ItemRowActions id={item.id} name={item.name} />
          </li>
        ))}
      </ul>

      {items?.length === 0 && (
        <p className="text-center text-sm text-ink-400 py-16">등록된 품목이 없어요</p>
      )}
    </div>
  )
}