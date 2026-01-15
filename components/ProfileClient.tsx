'use client'

/**
 * ProfileClient - Client component for profile page interactivity
 *
 * Performance: Minimal client-side JS - only interactive form logic
 * Server fetching: All data is fetched on the server and passed as props
 * Image optimization: Uses next/image for vendor logos and branding
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import VendorBusinessForm from '@/components/VendorBusinessForm'
import OptimizedImage from '@/components/OptimizedImage'
import { updateVendorProfile, updateVendorBusinessInfo } from '@/app/actions/vendor'
import { generateBlurDataURL } from '@/lib/imageOptimization'

interface VendorProfile {
  id: string
  store_name: string
  slug: string
  whatsapp_number: string
  description: string | null
  logo_url: string | null
  city: string | null
  business_hours: string | null
  response_time: string | null
}

interface ProfileClientProps {
  vendor: VendorProfile
}

export default function ProfileClient({ vendor }: ProfileClientProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    store_name: vendor.store_name,
    whatsapp_number: vendor.whatsapp_number,
    description: vendor.description || '',
  })

  const [businessInfo, setBusinessInfo] = useState({
    logo_url: vendor.logo_url,
    city: vendor.city,
    business_hours: vendor.business_hours,
    response_time: vendor.response_time,
  })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const result = await updateVendorProfile(vendor.id, {
        store_name: formData.store_name,
        whatsapp_number: formData.whatsapp_number,
        description: formData.description,
      })

      if (result.error) throw new Error(result.error)

      setEditing(false)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
      router.refresh() // Revalidate server data
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save profile' })
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveBusinessInfo(
    info: Omit<typeof businessInfo, 'logo_url'> & { logo_url: string | null }
  ) {
    setSaving(true)
    setMessage(null)

    try {
      const result = await updateVendorBusinessInfo(vendor.id, info)

      if (result.error) throw new Error(result.error)

      setBusinessInfo(info)
      setEditing(false)
      setMessage({ type: 'success', text: 'Business information updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
      router.refresh() // Revalidate server data
    } catch (error: any) {
      throw error
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-green-600 hover:text-green-700 font-medium mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-gray-600">Manage your store information</p>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`mb-6 rounded-lg p-4 ${message.type === 'success'
            ? 'bg-green-50 text-green-800'
            : 'bg-red-50 text-red-800'
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4 sm:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Store Information</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="px-6 py-6 sm:px-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="store_name" className="block text-sm font-medium text-gray-700">
                Store Name
              </label>
              <input
                type="text"
                id="store_name"
                disabled={!editing}
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Store Slug
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  id="slug"
                  disabled
                  value={vendor.slug}
                  className="block flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-500 cursor-not-allowed"
                />
                <span className="text-sm text-gray-500">(Cannot be changed)</span>
              </div>
            </div>

            <div>
              <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700">
                WhatsApp Number
              </label>
              <input
                type="tel"
                id="whatsapp_number"
                disabled={!editing}
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="+1234567890"
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Include country code (e.g., +234XXXXXXXXXX)</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Store Description
              </label>
              <textarea
                id="description"
                disabled={!editing}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Tell customers about your store..."
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed resize-none"
              />
            </div>
          </div>

          {editing && (
            <div className="mt-6 flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setFormData({
                    store_name: vendor.store_name,
                    whatsapp_number: vendor.whatsapp_number,
                    description: vendor.description || '',
                  })
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Store Slug</p>
            <p className="mt-1">
              Your store slug cannot be changed after creation. It's used to create your unique store URL.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4 sm:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
              <p className="mt-1 text-sm text-gray-600">
                This information helps customers trust your store.
              </p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {editing ? (
            <VendorBusinessForm
              vendorId={vendor.id}
              storeName={vendor.store_name}
              initialData={businessInfo}
              isEditing={editing}
              onSave={handleSaveBusinessInfo}
              isSaving={saving}
            />
          ) : (
            <div className="space-y-6">
              {(businessInfo.logo_url || businessInfo.city || businessInfo.business_hours || businessInfo.response_time) ? (
                <>
                  {businessInfo.logo_url && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Business Logo</p>
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                          {/* Import OptimizedImage for vendor logo */}
                          {/* Logo is typically above fold: use priority loading */}
                          {/* Lazy loading would delay visibility of important branding */}
                          {/* next/image with WebP: 25-35% file size reduction */}
                          <OptimizedImage
                          src={businessInfo.logo_url}
                          alt={vendor.store_name}
                            width={128}
                            height={128}
                          className="w-full h-full object-cover"
                            // Logo is above-fold branding element: prioritize loading
                            // Improves LCP (Largest Contentful Paint) metric
                            priority={true}
                            // Logo is small and important: higher quality acceptable
                            // Blur placeholder for logo smoothness
                            blurDataURL={generateBlurDataURL(128, 128, '#e5e7eb')}
                            fallbackText="Logo"
                        />
                      </div>
                    </div>
                  )}
                  {businessInfo.city && (
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="mt-1 font-medium text-gray-900">{businessInfo.city}</p>
                    </div>
                  )}
                  {businessInfo.business_hours && (
                    <div>
                      <p className="text-sm text-gray-600">Business Hours</p>
                      <p className="mt-1 font-medium text-gray-900">{businessInfo.business_hours}</p>
                    </div>
                  )}
                  {businessInfo.response_time && (
                    <div>
                      <p className="text-sm text-gray-600">Response Time</p>
                      <p className="mt-1 font-medium text-gray-900">Usually replies in {businessInfo.response_time}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-4 text-gray-600">No business information added yet</p>
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    Add Business Information
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
