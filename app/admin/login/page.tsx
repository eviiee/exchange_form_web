'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-5">
      <div className="w-full max-w-[360px] animate-[fade-in-up_0.4s_ease-out]">
        <h1 className="text-xl font-bold text-ink-900 mb-1">관리자 로그인</h1>
        <p className="text-sm text-ink-600 mb-8">교환 신청 관리 시스템</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-13 px-4 py-3.5 rounded-xl bg-surface-100 border border-transparent focus:border-primary focus:bg-white outline-none transition-colors duration-150 text-ink-900 placeholder:text-ink-400"
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-13 px-4 py-3.5 rounded-xl bg-surface-100 border border-transparent focus:border-primary focus:bg-white outline-none transition-colors duration-150 text-ink-900 placeholder:text-ink-400"
            required
          />

          {error && (
            <p className="text-sm text-danger animate-[fade-in-up_0.2s_ease-out]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-4 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}