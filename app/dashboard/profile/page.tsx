/**
 * Profile Page - Server Component
 * 
 * Performance optimization:
 * - All data fetching on the server (0 client-side Supabase calls)
 * - Reduced JavaScript bundle (no useEffect, useState for data loading)
 * - Fast initial page load on slow networks
 * - Automatic caching via Next.js
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from '@/components/ProfileClient'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()

  // Server-side auth check - no client JS needed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Server-side data fetching - happens before HTML is sent to client
  const { data: vendor, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !vendor) {
    redirect('/onboarding')
  }

  // Pass server-fetched data to minimal client component
  return <ProfileClient vendor={vendor} />
}
