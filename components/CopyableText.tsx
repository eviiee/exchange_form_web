'use client'

import { useState } from 'react'

export default function CopyableText({ text, className = '' }: { text: string; className?: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // 클립보드 API가 막힌 환경(권한 거부 등) — 조용히 무시
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1 active:scale-[0.96] transition-transform duration-150 ${className}`}
        >
            <span>{text}</span>
            {copied ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3182F6" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="opacity-50">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
            )}
            {copied && <span className="text-[11px] text-primary">복사됨</span>}
        </button>
    )
}