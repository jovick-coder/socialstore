'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { getCategoryAttributes, getCategoryKeys, getCategoryLabel } from '@/config/categories'
import DynamicAttributesForm from './DynamicAttributesForm'

interface ProductWizardProps {
  onSubmit: (data: ProductWizardData) => Promise<void>
  isLoading?: boolean
}

export interface ProductWizardData {
  name: string
  description: string
  category: string
  price: number | null
  contactForPrice: boolean
  images: string[]
  attributes: Record<string, any>
  availability: 'in-stock' | 'limited' | 'pre-order'
}

export default function ProductWizard({
  onSubmit,
  isLoading = false,
}: ProductWizardProps) {
  const [step, setStep] = useState(1)
  const [images, setImages] = useState<string[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<ProductWizardData>({
    name: '',
    description: '',
    category: '',
    price: null,
    contactForPrice: false,
    images: [],
    attributes: {},
    availability: 'in-stock',
  })

  const categoryAttributes = formData.category
    ? getCategoryAttributes(formData.category)
    : []

  // Image Handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      if (images.length < 5) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const newImages = [...images]
    const temp = newImages[draggedIndex]
    newImages[draggedIndex] = newImages[dropIndex]
    newImages[dropIndex] = temp
    setImages(newImages)
    setDraggedIndex(null)
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleFormChange = (field: keyof ProductWizardData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAttributesChange = (values: Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      attributes: values,
    }))
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        alert('Please enter a product name')
        return
      }
      if (images.length === 0) {
        alert('Please add at least one image')
        return
      }
      setFormData(prev => ({ ...prev, images }))
    } else if (step === 2) {
      if (!formData.category) {
        alert('Please select a category')
        return
      }
      if (!formData.contactForPrice && !formData.price) {
        alert('Please enter a price or select "Contact for Price"')
        return
      }
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting product:', error)
      alert('Failed to submit product')
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      {/* Progress Indicator */}
      <div className="mb-8 flex items-center justify-between max-w-75 mx-auto">
        {[1, 2, 3].map(stepNum => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-medium transition ${step >= stepNum
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
                }`}
            >
              {stepNum}
            </div>
            {stepNum < 3 && (
              <div
                className={`mx-2 h-1 w-10  max-w-16 rounded transition ${step > stepNum ? 'bg-green-600' : 'bg-gray-200'
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Images & Basic Info */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Product Images
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Upload up to 5 images. Drag to reorder.
            </p>
          </div>

          {/* Image Upload Area */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 5}
              className="w-full rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center transition hover:border-green-500 hover:bg-green-50 disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:bg-white"
            >
              <div className="text-sm font-medium text-gray-900">
                Click to upload or drag and drop
              </div>
              <div className="mt-1 text-xs text-gray-600">
                PNG, JPG, GIF up to 10MB ({images.length}/5 images)
              </div>
            </button>
          </div>

          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {images.map((image, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, index)}
                  className={`group relative cursor-move overflow-hidden rounded-lg border-2 ${draggedIndex === index
                    ? 'border-green-500 opacity-50'
                    : 'border-transparent hover:border-green-500'
                    }`}
                >
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="h-24 w-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 hidden rounded-full bg-red-600 p-1 text-white shadow group-hover:block"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {index === 0 && (
                    <div className="absolute top-1 left-1 rounded bg-green-600 px-2 py-1 text-xs font-medium text-white">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleFormChange('name', e.target.value)}
              placeholder="Enter product name"
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e => handleFormChange('description', e.target.value)}
              placeholder="Describe your product..."
              rows={4}
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>
      )}

      {/* Step 2: Category, Price & Details */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Product Details
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Set pricing and select category
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={e => handleFormChange('category', e.target.value)}
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">Select a category</option>
              {getCategoryKeys().map(catKey => (
                <option key={catKey} value={catKey}>
                  {getCategoryLabel(catKey)}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="contactForPrice"
                checked={formData.contactForPrice}
                onChange={e => {
                  handleFormChange('contactForPrice', e.target.checked)
                  if (e.target.checked) {
                    handleFormChange('price', null)
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor="contactForPrice"
                className="text-sm font-medium text-gray-900"
              >
                Contact for price
              </label>
            </div>

            {!formData.contactForPrice && (
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-2 text-sm font-medium text-gray-600">
                    Rs
                  </span>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={e =>
                      handleFormChange('price', e.target.value ? parseInt(e.target.value) : null)
                    }
                    placeholder="0"
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-8 pr-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Availability
            </label>
            <select
              value={formData.availability}
              onChange={e =>
                handleFormChange(
                  'availability',
                  e.target.value as 'in-stock' | 'limited' | 'pre-order'
                )
              }
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="in-stock">In Stock</option>
              <option value="limited">Limited Stock</option>
              <option value="pre-order">Pre-order</option>
            </select>
          </div>

          {/* Dynamic Attributes */}
          {categoryAttributes.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                {formData.category && getCategoryLabel(formData.category)} Attributes
              </h3>
              <DynamicAttributesForm
                attributes={categoryAttributes}
                values={formData.attributes}
                onChange={handleAttributesChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review & Publish */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Review & Publish
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Check your product information before publishing
            </p>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Image Preview */}
              <div>
                {images.length > 0 && (
                  <>
                    <img
                      src={images[0]}
                      alt="Product cover"
                      className="h-48 w-full rounded-lg object-cover"
                    />
                    {images.length > 1 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto">
                        {images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Thumb ${idx}`}
                            className="h-12 w-12 shrink-0 rounded object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Details Preview */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {formData.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {formData.description}
                  </p>
                </div>

                <div className="space-y-2 border-t border-gray-300 pt-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className="font-medium text-gray-900">
                      {getCategoryLabel(formData.category)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price</span>
                    <span className="font-medium text-gray-900">
                      {formData.contactForPrice
                        ? 'Contact for Price'
                        : `Rs ${formData.price?.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Availability</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {formData.availability.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {/* Attributes Preview */}
                {Object.keys(formData.attributes).length > 0 && (
                  <div className="space-y-2 border-t border-gray-300 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Attributes
                    </h4>
                    {Object.entries(formData.attributes).map(
                      ([key, value]) => {
                        const attr = categoryAttributes.find(a => a.key === key)
                        if (!attr) return null
                        return (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600">{attr.label}</span>
                            <span className="font-medium text-gray-900">
                              {Array.isArray(value)
                                ? value.join(', ')
                                : value === true
                                  ? 'Yes'
                                  : value === false
                                    ? 'No'
                                    : value || '—'}
                            </span>
                          </div>
                        )
                      }
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Confirmation Text */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            ✓ Your product is ready to be published and will be visible to customers
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between gap-3 border-t border-gray-200 pt-6">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-900 transition hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
        >
          Back
        </button>

        {step < 3 ? (
          <button
            onClick={handleNext}
            className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
            disabled={isLoading}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Publishing...' : 'Publish Product'}
          </button>
        )}
      </div>
    </div>
  )
}
