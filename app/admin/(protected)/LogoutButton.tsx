'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  return (
    <button
      onClick={async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/admin/login')
        router.refresh()
      }}
      className="text-sm text-ink-400 hover:text-ink-600 transition-colors duration-150"
    >
      로그아웃
    </button>
  )
}