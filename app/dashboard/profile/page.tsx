/**
 * Profile Page - Server Component
 * 
 * Performance optimization:
 * - All data fetching on the server (0 client-side Supabase calls)
 * - Reduced JavaScript bundle (no useEffect, useState for data loading)
 * - Fast initial page load on slow networks
 * - Automatic caching via Next.js and react.cache
 */

import { redirect } from 'next/navigation'
import ProfileClient from '@/components/ProfileClient'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getVendorByUserId } from '@/lib/queries'

export const metadata = {
  title: 'Profile Settings | Dashboard',
  description: 'Manage your store profile and settings',
}

// Revalidate every 2 minutes
export const revalidate = 120

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()

  // Server-side auth check - no client JS needed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get vendor - cached query
  const vendor = await getVendorByUserId(user.id)

  if (!vendor) {
    redirect('/onboarding')
  }

  // Pass server-fetched data to minimal client component
  return <ProfileClient vendor={vendor} />
}
