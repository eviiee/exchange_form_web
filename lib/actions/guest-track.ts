'use server'

import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function trackRequests(name: string, password: string) {
    const trimmedName = name.trim()
    if (!trimmedName || !password) {
        return { error: '이름과 비밀번호를 입력해주세요.' }
    }

    const { data: candidates, error } = await supabaseAdmin
        .from('exchange_requests')
        .select(`
      id, recipient_name, password_hash, status, rejection_reason,
      delivery_type, courier_name, tracking_number, created_at,
      exchange_request_items ( item_name_snapshot, quantity )
    `)
        .eq('recipient_name', trimmedName)
        .order('created_at', { ascending: false })

    if (error) {
        return { error: '조회 중 오류가 발생했습니다.' }
    }

    const matched = []
    for (const candidate of candidates ?? []) {
        const isMatch = await bcrypt.compare(password, candidate.password_hash)
        if (isMatch) {
            const { password_hash, ...rest } = candidate
            matched.push(rest)
        }
    }

    if (matched.length === 0) {
        return { error: '일치하는 신청 내역이 없습니다.' }
    }

    return { success: true, requests: matched }
}