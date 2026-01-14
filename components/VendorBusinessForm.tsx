'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface VendorBusinessInfo {
  logo_url: string | null
  city: string | null
  business_hours: string | null
  response_time: string | null
}

interface VendorBusinessFormProps {
  vendorId: string
  storeName: string
  initialData: VendorBusinessInfo
  isEditing: boolean
  onSave: (data: VendorBusinessInfo) => Promise<void>
  isSaving: boolean
}

const RESPONSE_TIME_OPTIONS = [
  { value: '1 hour', label: 'Usually replies in 1 hour' },
  { value: '2 hours', label: 'Usually replies in 2 hours' },
  { value: '6 hours', label: 'Usually replies in 6 hours' },
  { value: '12 hours', label: 'Usually replies in 12 hours' },
  { value: '24 hours', label: 'Usually replies in 24 hours' },
]

export default function VendorBusinessForm({
  vendorId,
  storeName,
  initialData,
  isEditing,
  onSave,
  isSaving,
}: VendorBusinessFormProps) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<VendorBusinessInfo>(initialData)
  const [uploading, setUploading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logo_url)
  const [error, setError] = useState<string | null>(null)

  /**
   * Get store initials for fallback avatar
   */
  const getStoreInitials = () => {
    return storeName
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  /**
   * Handle logo image selection and upload
   */
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file)
      setLogoPreview(previewUrl)

      // Upload to Supabase Storage
      const fileName = `${vendorId}-${Date.now()}-${file.name}`
      const { data, error: uploadError } = await supabase.storage
        .from('vendor-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('vendor-logos')
        .getPublicUrl(fileName)

      // Update form data with new logo URL
      setFormData((prev) => ({
        ...prev,
        logo_url: publicData.publicUrl,
      }))
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo')
      setLogoPreview(initialData.logo_url) // Revert preview on error
    } finally {
      setUploading(false)
    }
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await onSave(formData)
    } catch (err: any) {
      setError(err.message || 'Failed to save business information')
    }
  }

  if (!isEditing) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Business Logo
          </label>

          <div className="flex gap-6">
            {/* Logo Preview */}
            <div className="flex items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 shrink-0">
              {logoPreview ? (
                <div className="relative w-full h-full">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">
                    {getStoreInitials()}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Section */}
            <div className="flex flex-col justify-center gap-3 flex-1">
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                        />
                      </svg>
                      Upload Logo
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
              </div>
              <p className="text-xs text-gray-500">
                Square image recommended (JPG, PNG, up to 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            Location / City
            <span className="text-gray-400 font-normal ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            id="city"
            value={formData.city || ''}
            onChange={(e) => setFormData({ ...formData, city: e.target.value || null })}
            placeholder="e.g., Lagos, Nigeria"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Business Hours */}
        <div>
          <label htmlFor="business_hours" className="block text-sm font-medium text-gray-700 mb-2">
            Business Hours
            <span className="text-gray-400 font-normal ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            id="business_hours"
            value={formData.business_hours || ''}
            onChange={(e) => setFormData({ ...formData, business_hours: e.target.value || null })}
            placeholder="e.g., Mon–Sat, 9am–6pm"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your operating hours in any format customers will understand
          </p>
        </div>

        {/* Response Time */}
        <div>
          <label htmlFor="response_time" className="block text-sm font-medium text-gray-700 mb-2">
            Usually Replies In
            <span className="text-gray-400 font-normal ml-1">(Optional)</span>
          </label>
          <select
            id="response_time"
            value={formData.response_time || ''}
            onChange={(e) => setFormData({ ...formData, response_time: e.target.value || null })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select response time...</option>
            {RESPONSE_TIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            This helps customers know how quickly you'll respond to orders
          </p>
        </div>

        {/* Info Box */}
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex gap-3">
            <svg
              className="h-5 w-5 text-blue-600 shrink-0 mt-0.5"
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
              <p className="font-medium">Build Trust</p>
              <p className="mt-1">
                This information helps customers trust your store and know what to expect when
                ordering.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              setFormData(initialData)
              setLogoPreview(initialData.logo_url)
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || uploading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Business Info'}
          </button>
        </div>
      </form>
    </div>
  )
}
