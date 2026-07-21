import { createClient } from '@supabase/supabase-js'

// 이 파일은 클라이언트 컴포넌트에서 절대 import하면 안 됩니다.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false }
  }
)