'use client'

import Script from 'next/script'

declare global {
  interface Window {
    daum: any
  }
}

export default function AddressSearch({
  onComplete,
}: {
  onComplete: (data: { zonecode: string; roadAddress: string }) => void
}) {
  const open = () => {
    if (!window.daum) return
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        onComplete({ zonecode: data.zonecode, roadAddress: data.roadAddress })
      },
    }).open()
  }

  return (
    <>
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="afterInteractive" />
      <button
        type="button"
        onClick={open}
        className="w-full py-3.5 rounded-xl bg-surface-100 text-ink-900 font-medium active:scale-[0.98] transition-transform duration-150"
      >
        주소 검색
      </button>
    </>
  )
}