import Link from 'next/link'

export default function GuestHomePage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-xl font-bold text-ink-900 mb-1">교환 신청 서비스</h1>
                <p className="text-sm text-ink-600">간편하게 교환을 신청하고 진행상황을 확인하세요</p>
            </div>

            <div className="space-y-3">
                <Link
                    href="/request"
                    className="flex items-center justify-between p-5 rounded-2xl bg-primary text-white active:scale-[0.98] transition-transform duration-150"
                >
                    <div>
                        <p className="font-semibold mb-1">교환 신청하기</p>
                        <p className="text-sm text-white/80">품목을 선택하고 교환을 신청해요</p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 6l6 6-6 6" />
                    </svg>
                </Link>

                <Link
                    href="/track"
                    className="flex items-center justify-between p-5 rounded-2xl bg-surface-100 text-ink-900 active:scale-[0.98] transition-transform duration-150"
                >
                    <div>
                        <p className="font-semibold mb-1">신청내역 조회</p>
                        <p className="text-sm text-ink-600">이름과 비밀번호로 진행상황을 확인해요</p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 6l6 6-6 6" />
                    </svg>
                </Link>
            </div>

            <div>
                <p className="text-sm font-medium text-ink-900 mb-3">도움이 필요하신가요?</p>
                <div className="grid grid-cols-2 gap-3">

                    <a
                        href="tel:010-2428-5408"
                        className="flex flex-col items-center gap-2 py-5 rounded-2xl border border-line-200 active:scale-[0.97] transition-transform duration-150"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3182F6" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span className="text-sm font-medium text-ink-900">전화 상담</span>
                        <span className="text-xs text-ink-400">010-2428-5408</span>
                    </a>

                    <a
                        href="mailto:idam0621@naver.com"
                        className="flex flex-col items-center gap-2 py-5 rounded-2xl border border-line-200 active:scale-[0.97] transition-transform duration-150"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3182F6" strokeWidth="2">
                            <path d="M4 4h16v16H4z" />
                            <path d="M22 6l-10 7L2 6" />
                        </svg>
                        <span className="text-sm font-medium text-ink-900">이메일 상담</span>
                        <span className="text-xs text-ink-400">idam0621@naver.com</span>
                    </a>
                </div>
            </div>
        </div>
    )
}