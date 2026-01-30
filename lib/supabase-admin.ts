import { createClient } from '@supabase/supabase-js'

// Use placeholders for build time if env vars are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('Missing NEXT_PUBLIC_SUPABASE_URL, using placeholder for build')
}

// Service role client for administrative operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})
