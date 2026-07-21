import Link from 'next/link'

export default function CompletePage() {
  return (
    <div className="text-center py-12 animate-[fade-in-up_0.3s_ease-out]">
      <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3182F6" strokeWidth="2.5">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h1 className="text-lg font-bold text-ink-900 mb-2">신청이 완료됐어요</h1>
      <p className="text-sm text-ink-600 mb-8">입력하신 이름과 비밀번호로 진행상황을 확인하실 수 있어요</p>
      <Link
        href="/track"
        className="inline-block px-6 py-3 rounded-xl bg-surface-100 text-ink-900 font-medium active:scale-[0.98] transition-transform duration-150"
      >
        진행상황 조회하러 가기
      </Link>
    </div>
  )
}