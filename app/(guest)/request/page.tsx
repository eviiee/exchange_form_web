import { createClient } from '@/lib/supabase/server'
import RequestForm from './RequestForm'

export default async function RequestPage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('items')
    .select('id, name, image_path')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <div>
      <h1 className="text-lg font-bold text-ink-900 mb-1">교환 신청서 작성</h1>
      <p className="text-sm text-ink-600 mb-6">아래 정보를 입력해 교환을 신청해주세요</p>
      <RequestForm items={items ?? []} />
    </div>
  )
}