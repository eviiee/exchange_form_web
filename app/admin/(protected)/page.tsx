import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { count: totalCount } = await supabase
    .from('exchange_requests')
    .select('*', { count: 'exact', head: true })

  const { count: pendingCount } = await supabase
    .from('exchange_requests')
    .select('*', { count: 'exact', head: true })
    .in('status', ['requested', 'preparing'])

  const { data: pendingRequests } = await supabase
    .from('exchange_requests')
    .select('id')
    .in('status', ['requested', 'preparing'])

  const pendingIds = (pendingRequests ?? []).map((r) => r.id)

  let itemSummary: { name: string; quantity: number }[] = []
  if (pendingIds.length > 0) {
    const { data: items } = await supabase
      .from('exchange_request_items')
      .select('item_name_snapshot, quantity')
      .in('request_id', pendingIds)

    const map = new Map<string, number>()
    for (const item of items ?? []) {
      map.set(item.item_name_snapshot, (map.get(item.item_name_snapshot) ?? 0) + item.quantity)
    }
    itemSummary = Array.from(map.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-surface-100">
          <p className="text-xs text-ink-600 mb-1">전체 교환 신청</p>
          <p className="text-2xl font-bold text-ink-900">{totalCount ?? 0}건</p>
        </div>
        <div className="p-4 rounded-2xl bg-primary-light">
          <p className="text-xs text-primary mb-1">배송 대기중</p>
          <p className="text-2xl font-bold text-primary">{pendingCount ?? 0}건</p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-ink-900 mb-3">품목별 필요 수량</h2>
        {itemSummary.length === 0 ? (
          <p className="text-sm text-ink-400 py-8 text-center rounded-2xl border border-line-200">
            배송 대기중인 품목이 없어요
          </p>
        ) : (
          <ul className="space-y-1.5">
            {itemSummary.map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-line-200"
              >
                <span className="text-sm text-ink-900">{item.name}</span>
                <span className="text-sm font-semibold text-ink-900">{item.quantity}개</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2">
        <Link
          href="/admin/requests"
          className="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-surface-100 active:scale-[0.97] transition-transform duration-150"
        >
          <span className="text-sm font-medium text-ink-900">신청 목록</span>
        </Link>
        <Link
          href="/admin/items"
          className="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-surface-100 active:scale-[0.97] transition-transform duration-150"
        >
          <span className="text-sm font-medium text-ink-900">품목 관리</span>
        </Link>
        <Link
          href="/admin/templates"
          className="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-surface-100 active:scale-[0.97] transition-transform duration-150"
        >
          <span className="text-sm font-medium text-ink-900">엑셀 양식</span>
        </Link>
      </div>
    </div>
  )
}