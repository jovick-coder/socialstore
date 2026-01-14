'use client'

import { useState } from 'react'
import { completeOnboarding } from '@/app/actions/onboarding'

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleOnboarding(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await completeOnboarding(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Set Up Your Store
          </h1>
          <p className="mt-2 text-gray-600">
            Just a few details to get you started
          </p>
        </div>

        {/* Onboarding Card */}
        <div className="mt-8 rounded-2xl bg-white p-8 shadow-lg">
          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-green-600">Step 1 of 1</span>
              <span className="text-gray-500">Store Information</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full w-full bg-green-600"></div>
            </div>
          </div>

          {/* Onboarding Form */}
          <form action={handleOnboarding} className="space-y-6">
            {/* Store Name */}
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                Store Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="storeName"
                name="storeName"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Ada Shoes"
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be visible to your customers
              </p>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="whatsappNumber"
                name="whatsappNumber"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., +234 812 345 6789"
              />
              <p className="mt-1 text-sm text-gray-500">
                Customers will use this to contact you
              </p>
            </div>

            {/* Store Description */}
            <div>
              <label htmlFor="storeDescription" className="block text-sm font-medium text-gray-700">
                Store Description <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                id="storeDescription"
                name="storeDescription"
                rows={4}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Tell customers what you sell..."
              />
              <p className="mt-1 text-sm text-gray-500">
                A brief description of your products or services
              </p>
            </div>

            {/* Info Box */}
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex gap-3">
                <svg
                  className="h-5 w-5 shrink-0 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Your catalog link will be:</p>
                  <p className="mt-1 font-mono text-xs">
                    yoursite.com/<span className="text-green-600">your-store-name</span>
                  </p>
                  <p className="mt-1 text-xs text-blue-600">
                    We'll generate a unique link based on your store name
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Setting up your store...' : 'Complete Setup'}
            </button>
          </form>
        </div>

        {/* Footer Message */}
        <p className="mt-6 text-center text-sm text-gray-500">
          You can update these details anytime from your dashboard
        </p>
      </div>
    </div>
  )
}
