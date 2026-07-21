'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import AddressSearch from '@/components/AddressSearch'
import ItemPicker, { SelectedItem } from '@/components/ItemPicker'
import PhotoUpload from '@/components/PhotoUpload'
import { createExchangeRequest } from '@/lib/actions/guest-requests'
import { formatPhoneNumber } from '@/lib/format-phone'

type Item = { id: string; name: string; image_path: string | null }

export default function RequestForm({ items }: { items: Item[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [recipientName, setRecipientName] = useState('')
  const [phone, setPhone] = useState('')
  const [zonecode, setZonecode] = useState('')
  const [roadAddress, setRoadAddress] = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [photos, setPhotos] = useState<File[]>([])
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!zonecode) {
      setError('주소를 검색해주세요.')
      return
    }
    if (selectedItems.length === 0) {
      setError('품목을 1개 이상 선택해주세요.')
      return
    }
    if (photos.length === 0) {
      setError('구매 증빙자료를 업로드해주세요.')
      return
    }

    const formData = new FormData()
    formData.set('recipient_name', recipientName)
    formData.set('phone', phone)
    formData.set('address_zonecode', zonecode)
    formData.set('address_road', roadAddress)
    formData.set('address_detail', addressDetail)
    formData.set('password', password)
    formData.set('items', JSON.stringify(selectedItems.map(({ item_id, name, quantity }) => ({ item_id, name, quantity }))))
    photos.forEach((p) => formData.append('photos', p))

    startTransition(async () => {
      const result = await createExchangeRequest(formData)
      if (result.error) {
        setError(result.error)
        return
      }
      router.push('/request/complete')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-sm font-medium text-ink-900 block mb-2">수령자명</label>
        <input
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          required
          className="w-full px-4 py-3.5 rounded-xl bg-surface-100 border border-transparent focus:border-primary focus:bg-white outline-none transition-colors duration-150"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink-900 block mb-2">배송받을 주소</label>
        <AddressSearch onComplete={(d) => { setZonecode(d.zonecode); setRoadAddress(d.roadAddress) }} />
        {roadAddress && (
          <div className="mt-2 space-y-2 animate-[fade-in-up_0.2s_ease-out]">
            <p className="text-sm text-ink-600">({zonecode}) {roadAddress}</p>
            <input
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              placeholder="상세주소를 입력하세요"
              className="w-full px-4 py-3.5 rounded-xl bg-surface-100 border border-transparent focus:border-primary focus:bg-white outline-none transition-colors duration-150 placeholder:text-ink-400"
            />
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-ink-900 block mb-2">전화번호</label>
        <input
          value={phone}
          onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
          type="tel"
          inputMode="numeric"
          placeholder="010-0000-0000"
          required
          className="w-full px-4 py-3.5 rounded-xl bg-surface-100 border border-transparent focus:border-primary focus:bg-white outline-none transition-colors duration-150 placeholder:text-ink-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink-900 block mb-2">교환 품목</label>
        <ItemPicker items={items} selected={selectedItems} onChange={setSelectedItems} />
      </div>

      <div>
        <label className="text-sm font-medium text-ink-900 block mb-2">구매 증빙자료</label>
        <PhotoUpload files={photos} onChange={setPhotos} />
      </div>

      <div>
        <label className="text-sm font-medium text-ink-900 block mb-2">조회 비밀번호</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="배송 조회 시 사용할 비밀번호"
          required
          className="w-full px-4 py-3.5 rounded-xl bg-surface-100 border border-transparent focus:border-primary focus:bg-white outline-none transition-colors duration-150 placeholder:text-ink-400"
        />
      </div>

      {error && <p className="text-sm text-danger animate-[fade-in-up_0.2s_ease-out]">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
      >
        {isPending ? '제출 중...' : '교환 신청하기'}
      </button>
    </form>
  )
}