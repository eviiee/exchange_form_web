import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function notifyAdminNewRequest(params: {
    requestId: string
    recipientName: string
    phone: string
    items: { name: string; quantity: number }[]
}) {
    const itemsList = params.items.map((i) => `- ${i.name} x${i.quantity}`).join('\n')

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev', // 도메인 인증 완료 후엔 본인 도메인 주소로 교체
            to: process.env.ADMIN_NOTIFICATION_EMAIL!,
            subject: `[교환신청] ${params.recipientName}님 신규 교환신청`,
            text: `
                    새 교환 신청이 접수됐습니다.

                    수령자명: ${params.recipientName}
                    전화번호: ${params.phone}

                    품목:
                    ${itemsList}

                    신청 상세: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/requests/${params.requestId}`,
        })
    } catch (err) {
        console.error('관리자 알림 메일 발송 실패:', err)
        // 실패해도 신청 흐름은 계속 진행 (여기서 throw하지 않음)
    }
}