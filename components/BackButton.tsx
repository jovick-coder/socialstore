'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      // router.back() is appropriate here: uses browser history
      // Provides instant navigation because page is already cached in browser
      // More reliable than trying to determine previous route
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  )
}
