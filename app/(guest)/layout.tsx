export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line-200">
        <div className="max-w-[680px] mx-auto px-5 h-14 flex items-center">
          <span className="font-bold text-ink-900">교환 신청</span>
        </div>
      </header>
      <main className="max-w-[680px] mx-auto px-5 py-6">{children}</main>
    </div>
  )
}