import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ifjjoitkrhycuyxbpaaa.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmampvaXRrcmh5Y3V5eGJwYWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTE5NzEsImV4cCI6MjEwMTg4Nzk3MX0.ZL0YfOanR3hv0sFoQKajMna0WakWwLW70pNp2WYU8g0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
