'use client'

import { useState, useEffect } from 'react'
import { getOrCreateCustomerId, getCachedCustomerProfile, CustomerProfile } from '@/lib/customer'

interface CustomerDetailsFormProps {
  /**
   * Called when form is successfully submitted
   */
  onSubmit: (profile: Omit<CustomerProfile, 'id' | 'created_at' | 'updated_at'>) => Promise<void>

  /**
   * Whether this is a returning customer (auto-fills form)
   */
  isReturning?: boolean

  /**
   * Cached profile data for returning customers
   */
  cachedProfile?: CustomerProfile | null

  /**
   * Whether form is currently submitting
   */
  isSubmitting?: boolean

  /**
   * Custom title override
   */
  title?: string
}

export default function CustomerDetailsForm({
  onSubmit,
  isReturning = false,
  cachedProfile = null,
  isSubmitting = false,
  title,
}: CustomerDetailsFormProps) {
  const [formData, setFormData] = useState({
    name: cachedProfile?.name || '',
    phone: cachedProfile?.phone || '',
    address: cachedProfile?.address || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showWelcome, setShowWelcome] = useState(isReturning)

  // Reset welcome message after 5 seconds
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showWelcome])

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Delivery address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      })
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  /**
   * Handle input change
   */
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Welcome Back Message */}
      {showWelcome && (
        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-900">
            👋 Welcome back! We've saved your information.
          </p>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {title || 'Delivery Details'}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {isReturning
              ? 'Update your delivery information'
              : "We'll save this so you don't need to enter it again."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter your full name"
              className={`mt-1 w-full rounded-lg border px-4 py-2 outline-none transition ${errors.name
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-100'
                  : 'border-gray-300 focus:border-green-500 focus:ring-green-100'
                } focus:ring-2`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Enter your phone number"
              className={`mt-1 w-full rounded-lg border px-4 py-2 outline-none transition ${errors.phone
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-100'
                  : 'border-gray-300 focus:border-green-500 focus:ring-green-100'
                } focus:ring-2`}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Delivery Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Delivery Address *
            </label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter your delivery address"
              rows={3}
              className={`mt-1 w-full rounded-lg border px-4 py-2 outline-none transition ${errors.address
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-100'
                  : 'border-gray-300 focus:border-green-500 focus:ring-green-100'
                } focus:ring-2`}
              disabled={isSubmitting}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </form>

        {/* Info */}
        <p className="mt-4 text-xs text-gray-500">
          ✓ Your information is encrypted and only used for delivery
        </p>
      </div>
    </div>
  )
}
