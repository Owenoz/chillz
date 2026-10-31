import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://sykjlkbifrkmvlikyilv.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5a2psa2JpZnJrbXZsaWt5aWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMzM2MDgsImV4cCI6MjEwNzYwOTYwOH0.o2_Xrr64RX4sjeZz_k4bHQCmaSzv9S8iEArg05jKYEg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

export type UserProfile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: 'free' | 'premium'
  created_at: string
}
