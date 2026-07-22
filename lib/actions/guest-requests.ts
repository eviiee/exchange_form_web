'use server'

import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { processImage } from '@/lib/image'
import { notifyAdminNewRequest } from '@/lib/send-admin-notification'

export async function createExchangeRequest(formData: FormData) {
    const recipientName = (formData.get('recipient_name') as string)?.trim()
    const phone = (formData.get('phone') as string)?.trim()
    const addressZonecode = formData.get('address_zonecode') as string
    const addressRoad = formData.get('address_road') as string
    const addressDetail = (formData.get('address_detail') as string)?.trim()
    const password = formData.get('password') as string
    const itemsRaw = formData.get('items') as string
    const photos = formData.getAll('photos') as File[]

    const phoneRegex = /^(1[5-9]\d{2}-\d{4}|050\d-\d{3,4}-\d{4}|02-\d{3,4}-\d{4}|0\d{2}-\d{3,4}-\d{4})$/

    if (!phoneRegex.test(phone)) {
        return { error: '전화번호 형식이 올바르지 않습니다.' }
    }

    if (!recipientName || !phone || !addressZonecode || !addressRoad || !password) {
        return { error: '필수 항목을 모두 입력해주세요.' }
    }
    if (password.length < 4) {
        return { error: '비밀번호는 4자 이상 입력해주세요.' }
    }

    let items: { item_id: string; name: string; quantity: number }[]
    try {
        items = JSON.parse(itemsRaw)
    } catch {
        return { error: '품목 정보가 올바르지 않습니다.' }
    }
    if (!items?.length) {
        return { error: '품목을 1개 이상 선택해주세요.' }
    }
    if (photos.length === 0) {
        return { error: '구매 증빙자료를 업로드해주세요.' }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const { data: request, error: insertError } = await supabaseAdmin
        .from('exchange_requests')
        .insert({
            recipient_name: recipientName,
            phone,
            address_zonecode: addressZonecode,
            address_road: addressRoad,
            address_detail: addressDetail || null,
            password_hash: passwordHash,
        })
        .select()
        .single()

    if (insertError || !request) {
        return { error: '신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
    }

    const { error: itemsError } = await supabaseAdmin.from('exchange_request_items').insert(
        items.map((i) => ({
            request_id: request.id,
            item_id: i.item_id,
            item_name_snapshot: i.name,
            quantity: i.quantity,
        }))
    )

    if (itemsError) {
        return { error: '품목 등록 중 오류가 발생했습니다.' }
    }

    for (const photo of photos) {
        try {
            const processed = await processImage(photo)
            const path = `${request.id}/${randomUUID()}.webp`

            const { error: uploadError } = await supabaseAdmin.storage
                .from('evidence-photos')
                .upload(path, processed, { contentType: 'image/webp' })

            if (!uploadError) {
                await supabaseAdmin.from('evidence_photos').insert({ request_id: request.id, storage_path: path })
            }
        } catch {
            // 개별 사진 실패는 전체 신청을 막지 않음 (최소 1장은 이미 검증됨)
        }
    }

    await supabaseAdmin.from('status_history').insert({ request_id: request.id, status: 'requested' })

    await notifyAdminNewRequest({
        requestId: request.id,
        recipientName,
        phone,
        items: items.map((i) => ({ name: i.name, quantity: i.quantity })),
    })

    return { success: true, requestId: request.id }
}