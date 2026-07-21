'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { compressImage } from '@/lib/compress-image'

export default function PhotoUpload({
  files,
  onChange,
}: {
  files: File[]
  onChange: (files: File[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return

    setLoading(true)
    const compressed = await Promise.all(
      selected.map((f) => compressImage(f, { maxSizeMB: 2, maxWidthOrHeight: 1600 }))
    )
    setLoading(false)

    const newFiles = [...files, ...compressed]
    onChange(newFiles)
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)))
    if (inputRef.current) inputRef.current.value = ''
  }

  const removeAt = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onChange(newFiles)
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {previews.map((url, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-100">
            <Image src={url} alt={`증빙사진 ${i + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="w-20 h-20 rounded-xl bg-surface-100 flex flex-col items-center justify-center gap-1 text-ink-400 active:scale-[0.96] transition-transform duration-150"
        >
          {loading ? (
            <span className="text-xs">처리 중</span>
          ) : (
            <>
              <span className="text-lg leading-none">+</span>
              <span className="text-xs">사진 추가</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
    </div>
  )
}