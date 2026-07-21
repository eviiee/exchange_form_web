'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { compressImage } from '@/lib/compress-image'

export default function ItemForm({
  action,
  defaultName = '',
  defaultImageUrl = null,
}: {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>
  defaultName?: string
  defaultImageUrl?: string | null
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImageUrl)
  const [compressedFile, setCompressedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageLoading(true)
    setError(null)

    try {
      const compressed = await compressImage(file)
      setCompressedFile(compressed)
      setPreviewUrl(URL.createObjectURL(compressed))
    } catch {
      setError('이미지 처리 중 오류가 발생했습니다.')
    } finally {
      setImageLoading(false)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)

    if (compressedFile) {
      formData.set('image', compressedFile, compressedFile.name)
    } else {
      formData.delete('image')
    }

    const result = await action(formData)
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }
    router.push('/admin/items')
    router.refresh()
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-medium text-ink-900 block mb-2">이미지</label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative w-28 h-28 rounded-2xl bg-surface-100 overflow-hidden flex items-center justify-center active:scale-[0.97] transition-transform duration-150"
        >
          {imageLoading ? (
            <span className="text-xs text-ink-400">처리 중...</span>
          ) : previewUrl ? (
            <Image src={previewUrl} alt="미리보기" fill className="object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-ink-400">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-xs font-medium">이미지 추가</span>
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink-900 block mb-2">품목명</label>
        <input
          name="name"
          defaultValue={defaultName}
          required
          placeholder="품목명을 입력하세요"
          className="w-full px-4 py-3.5 rounded-xl bg-surface-100 border border-transparent focus:border-primary focus:bg-white outline-none transition-colors duration-150 text-ink-900 placeholder:text-ink-400"
        />
      </div>

      {error && (
        <p className="text-sm text-danger animate-[fade-in-up_0.2s_ease-out]">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || imageLoading}
        className="w-full py-3.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:active:scale-100"
      >
        {loading ? '저장 중...' : '저장'}
      </button>
    </form>
  )
}