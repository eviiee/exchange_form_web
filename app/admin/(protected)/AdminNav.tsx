'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

const NAV_ITEMS = [
    { href: '/admin', label: '대시보드' },
    { href: '/admin/requests', label: '교환 신청 목록' },
    { href: '/admin/items', label: '품목 관리' },
    { href: '/admin/templates', label: '엑셀 양식 관리' },
]

export default function AdminNav() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    return (
        <div className="max-w-[680px] mx-auto px-5">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between py-3 text-sm font-medium text-ink-900"
            >
                <span>메뉴</span>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {open && (
                <nav className="pb-3 animate-[fade-in-up_0.15s_ease-out]">
                    <ul className="flex flex-col gap-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${isActive ? 'bg-primary-light text-primary' : 'text-ink-600 hover:bg-surface-100'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            )}
        </div>
    )
}