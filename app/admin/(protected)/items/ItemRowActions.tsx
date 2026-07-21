'use client'

import { useRouter } from 'next/navigation'
import ConfirmActionButton from '@/components/ConfirmActionButton'
import { deleteItem } from '@/lib/actions/items'

export default function ItemRowActions({ id, name }: { id: string; name: string }) {
  const router = useRouter()

  return (
    <ConfirmActionButton
      triggerLabel="삭제"
      triggerClassName="text-xs text-danger"
      title="품목을 삭제하시겠습니까?"
      description={`'${name}' 품목을 삭제합니다. 이 작업은 되돌릴 수 없습니다.`}
      confirmLabel="삭제"
      variant="danger"
      onConfirm={async () => {
        await deleteItem(id)
        router.refresh()
      }}
    />
  )
}