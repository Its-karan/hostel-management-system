import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = (() => {
    try {
        return createClient(supabaseUrl, supabaseKey)
    } catch (error) {
        console.error("Supabase client initialization failed:", error)
        return null
    }
})()
