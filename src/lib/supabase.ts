import { createClient } from '@supabase/supabase-js'

// Env vars
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL ?? 'https://wzzfuqetmxtiuxuqwedk.supabase.co'
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6emZ1cWV0bXh0aXV4dXF3ZWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NDU5MzcsImV4cCI6MjA4OTUyMTkzN30.reqw6lKZ3vIz8LS9BLB-dVwHeafJvCf29CMsz9xeNFM'

// Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth: Sign In
export async function supabaseSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// Auth: Sign Out
export async function supabaseSignOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Profiles query
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}