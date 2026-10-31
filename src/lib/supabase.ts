import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://pydishigjctbyccedcso.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZGlzaGlnamN0YnljY2VkY3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MzYxODYsImV4cCI6MjEwOTAxMjE4Nn0.k0KLWKJeuBC0EIBhvhubSC2spbMqdwx-iHFRPZ40-9Y'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

export type UserProfile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: 'free' | 'premium' | 'lifetime'
  created_at: string
}
