import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { DELIVERY_TYPE_LABELS, STATUS_LABELS } from '@/lib/status-labels'
import StatusActions from './StatusActions'
import DeliveryForm from './DeliveryForm'
import RejectModal from './RejectModal'

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: request } = await supabase
        .from('exchange_requests')
        .select('*, exchange_request_items ( item_name_snapshot, quantity )')
        .eq('id', id)
        .single()

    if (!request) notFound()

    const { data: photos } = await supabase.from('evidence_photos').select('storage_path').eq('request_id', id)

    const photoUrls = await Promise.all(
        (photos ?? []).map(async (p) => {
            const { data } = await supabase.storage.from('evidence-photos').createSignedUrl(p.storage_path, 300)
            return data?.signedUrl
        })
    )

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg font-bold text-ink-900">{request.recipient_name}</h1>
                    <span className="text-xs text-ink-400">{new Date(request.created_at).toLocaleString('ko-KR')}</span>
                </div>
                <p className="text-sm text-ink-600">{request.phone}</p>
                <p className="text-sm text-ink-600">({request.address_zonecode}) {request.address_road} {request.address_detail}</p>
            </div>

            <div>
                <h2 className="text-sm font-medium text-ink-900 mb-2">신청 품목</h2>
                <ul className="space-y-1">
                    {request.exchange_request_items.map((i: any, idx: number) => (
                        <li key={idx} className="text-sm text-ink-600">{i.item_name_snapshot} x {i.quantity}</li>
                    ))}
                </ul>
            </div>

            <div>
                <h2 className="text-sm font-medium text-ink-900 mb-2">증빙자료</h2>
                <div className="flex gap-2 flex-wrap">
                    {photoUrls.filter(Boolean).map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded-xl overflow-hidden bg-surface-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`증빙사진 ${i + 1}`} className="w-full h-full object-cover" />
                        </a>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-sm font-medium text-ink-900 mb-2">진행상태</h2>
                <p className="text-sm text-ink-600 mb-3">현재: {STATUS_LABELS[request.status]}</p>
                <StatusActions id={request.id} currentStatus={request.status} />
            </div>

            {request.status === 'rejected' && request.rejection_reason && (
                <div className="p-3 rounded-xl bg-danger-light">
                    <p className="text-xs text-danger font-medium mb-0.5">거부 사유</p>
                    <p className="text-sm text-ink-900">{request.rejection_reason}</p>
                </div>
            )}

            <div>
                <h2 className="text-sm font-medium text-ink-900 mb-2">배송정보</h2>
                <DeliveryForm
                    id={request.id}
                    defaultType={request.delivery_type ?? 'parcel'}
                    defaultCourier={request.courier_name ?? ''}
                    defaultTracking={request.tracking_number ?? ''}
                />
            </div>

            {request.status !== 'rejected' && (
                <div className="pt-2 border-t border-line-200">
                    <RejectModal id={request.id} />
                </div>
            )}
        </div>
    )
}