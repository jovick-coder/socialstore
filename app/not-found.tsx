'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-7xl font-bold text-gray-200 mb-4">404</div>
          <svg
            className="h-32 w-32 mx-auto text-gray-300 mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Oops! Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The store or page you're looking for doesn't exist. It might have been removed or the link might be incorrect.
        </p>

        {/* Error Details */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm text-red-800">
            <span className="font-semibold">Error:</span> The requested resource could not be found.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            // router.back() is appropriate: uses browser history for instant navigation
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition"
          >
            ← Go Back
          </button>

          <Link
            href="/"
            // Prefetch home page: starts loading on hover for instant perceived navigation
            prefetch={true}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition text-center"
          >
            Home
          </Link>

          <Link
            href="/dashboard"
            // Prefetch dashboard: high-intent navigation target
            prefetch={true}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-center"
          >
            Dashboard
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Need help?</p>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              <span className="font-semibold">Visit:</span>
              <Link href="/" className="text-green-600 hover:text-green-700 ml-1">
                SocialStore Home
              </Link>
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Create your store:</span>
              <Link href="/signup" className="text-green-600 hover:text-green-700 ml-1">
                Start Selling
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
