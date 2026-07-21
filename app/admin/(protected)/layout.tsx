import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.auth.signOut()
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-line-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-[680px] mx-auto px-5 h-14 flex justify-between items-center">
          <span className="font-semibold text-ink-900">교환 신청 관리</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-ink-600">{profile.name}님</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-[680px] mx-auto px-5 py-6">{children}</main>
    </div>
  )
}