'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

type Item = { id: string; name: string; image_path: string | null }
export type SelectedItem = { item_id: string; name: string; quantity: number; image_path: string | null }

export default function ItemPicker({
  items,
  selected,
  onChange,
}: {
  items: Item[]
  selected: SelectedItem[]
  onChange: (items: SelectedItem[]) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedIds = new Set(selected.map((s) => s.item_id))
  const filtered = items
    .filter((i) => !selectedIds.has(i.id) && i.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))

  const imageUrl = (path: string | null) =>
    path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${path}` : null

  useEffect(() => {
    setHighlightedIndex(0)
  }, [query, open])

  useEffect(() => {
    if (!open) return
    const item = listRef.current?.children[highlightedIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [highlightedIndex, open])

  const addItem = (item: Item) => {
    onChange([...selected, { item_id: item.id, name: item.name, quantity: 1, image_path: item.image_path }])
    setQuery('')
    setHighlightedIndex(0)
    inputRef.current?.focus()
  }

  const updateQuantity = (id: string, quantity: number) => {
    onChange(selected.map((s) => (s.item_id === id ? { ...s, quantity: Math.max(1, quantity) } : s)))
  }

  const removeItem = (id: string) => {
    onChange(selected.filter((s) => s.item_id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || filtered.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => (i + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => (i - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[highlightedIndex]
      if (item) addItem(item)
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div>
      <div className="relative">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={handleKeyDown}
          placeholder="품목명을 검색하세요"
          className="w-full px-4 py-3.5 rounded-xl bg-surface-100 border border-transparent focus:border-primary focus:bg-white outline-none transition-colors duration-150 text-ink-900 placeholder:text-ink-400"
        />

        {open && (
          <ul
            ref={listRef}
            className="absolute z-10 w-full mt-1.5 bg-white border border-line-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-56 overflow-y-auto"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-ink-400">검색 결과가 없어요</li>
            ) : (
              filtered.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // blur보다 먼저 클릭 처리되도록
                    onClick={() => addItem(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors duration-100 text-left ${
                      index === highlightedIndex ? 'bg-primary-light' : 'hover:bg-surface-100'
                    }`}
                  >
                    <div className="w-9 h-9 relative bg-surface-100 rounded-lg overflow-hidden shrink-0">
                      {imageUrl(item.image_path) && (
                        <Image src={imageUrl(item.image_path)!} alt={item.name} fill className="object-cover" />
                      )}
                    </div>
                    <span className="text-sm text-ink-900">{item.name}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {selected.length > 0 && (
        <ul className="mt-3 space-y-2">
          {selected.map((s) => (
            <li
              key={s.item_id}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-line-200 animate-[fade-in-up_0.2s_ease-out]"
            >
              <div className="w-10 h-10 relative bg-surface-100 rounded-lg overflow-hidden shrink-0">
                {imageUrl(s.image_path) && (
                  <Image src={imageUrl(s.image_path)!} alt={s.name} fill className="object-cover" />
                )}
              </div>
              <span className="flex-1 text-sm text-ink-900 truncate">{s.name}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateQuantity(s.item_id, s.quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-surface-100 text-ink-600 active:scale-[0.95] transition-transform duration-150"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm text-ink-900">{s.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(s.item_id, s.quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-surface-100 text-ink-600 active:scale-[0.95] transition-transform duration-150"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(s.item_id)}
                className="text-xs text-danger px-1"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}