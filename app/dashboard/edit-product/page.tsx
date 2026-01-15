'use client'

import { useState, useEffect, Suspense } from 'react'
import { updateProduct, uploadProductImage, getProduct } from '@/app/actions/products'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'

function EditProductContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [compressionProgress, setCompressionProgress] = useState<number>(0)
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    description: '',
  })

  // Load product data
  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setError('Product ID not provided')
        setLoading(false)
        return
      }

      const result = await getProduct(productId)
      if (result.error) {
        setError(result.error)
      } else if (result.product) {
        const product = result.product
        setProductData({
          name: product.name,
          price: product.price.toString(),
          description: product.description || '',
        })
        setImages(product.images || [])
      }
      setLoading(false)
    }

    loadProduct()
  }, [productId])

  /**
   * Compress image before upload
   */
  async function compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.85,
      onProgress: (progress: number) => {
        setCompressionProgress(progress)
      },
    }

    try {
      const compressedBlob = await imageCompression(file, options)

      const originalSizeMB = (file.size / 1024 / 1024).toFixed(2)
      const compressedSizeMB = (compressedBlob.size / 1024 / 1024).toFixed(2)
      const savings = ((1 - compressedBlob.size / file.size) * 100).toFixed(0)

      console.log(`✅ Compressed ${file.name}:`)
      console.log(`   Original: ${originalSizeMB}MB → Compressed: ${compressedSizeMB}MB`)
      console.log(`   Saved: ${savings}% of original size`)

      const originalExt = file.name.split('.').pop() || 'jpg'
      const compressedFile = new File([compressedBlob], `${file.name.split('.')[0]}.${originalExt}`, {
        type: file.type,
      })

      return compressedFile
    } catch (error) {
      console.error('Compression error:', error)
      return file
    }
  }

  /**
   * Handle image upload
   */
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    setError(null)
    setCompressionProgress(0)

    const uploadPromises = Array.from(files).map(async (file) => {
      if (!file.type.startsWith('image/')) {
        throw new Error(`${file.name} is not an image file.`)
      }

      const compressedFile = await compressImage(file)

      if (compressedFile.size > 5 * 1024 * 1024) {
        throw new Error(`${file.name} is still too large after compression. Try a different image.`)
      }

      const userId = crypto.randomUUID()
      const result = await uploadProductImage(compressedFile, userId)
      if (result.error) {
        throw new Error(result.error)
      }
      return result.url!
    })

    try {
      const uploadedUrls = await Promise.all(uploadPromises)
      setImages((prev) => [...prev, ...uploadedUrls])
      setCompressionProgress(0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingImages(false)
    }
  }

  /**
   * Remove image
   */
  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUpdating(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append('imageUrls', JSON.stringify(images))

    const result = await updateProduct(productId!, formData)

    if (result.error) {
      setError(result.error)
      setUpdating(false)
    } else {
      setSuccess(true)
      // Programmatic navigation after successful update is appropriate
      // Delay allows user to see success message before redirect
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Next.js prefetches on hover for instant navigation back to dashboard */}
            <Link
              href="/dashboard"
              prefetch={true}
              className="rounded-lg p-2 transition hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Edit Product
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          {/* Success Message */}
          {success && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Product updated successfully!</span>
              </div>
              <p className="mt-1 text-sm">Redirecting to dashboard...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={productData.name}
                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Nike Air Max Sneakers"
              />
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="0.01"
                value={productData.price}
                onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 25000"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe your product, including features, size, color, etc."
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Product Images <span className="text-gray-400">(Optional)</span>
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Upload up to 5 images. Images are automatically compressed to reduce size while keeping quality.
              </p>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-5">
                  {images.map((url, index) => (
                    <div key={index} className="group relative aspect-square border ">
                      <Image
                        src={url}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white opacity-0 transition group-hover:opacity-100"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {images.length < 5 && (
                <div className="mt-4">
                  <label
                    htmlFor="images"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-8 transition hover:border-green-500 hover:bg-green-50"
                  >
                    {uploadingImages ? (
                      <div className="text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
                        <p className="mt-2 text-sm text-gray-600">
                          {compressionProgress > 0 && compressionProgress < 100
                            ? `Compressing... ${compressionProgress}%`
                            : 'Uploading...'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">
                          Click to upload images
                        </span>
                      </>
                    )}
                  </label>
                  <input
                    type="file"
                    id="images"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImages}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              {/* Next.js prefetches on hover, instant navigation when user cancels */}
              <Link
                href="/dashboard"
                prefetch={true}
                className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={updating || uploadingImages}
                className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating ? 'Updating Product...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4">
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
              <p className="font-medium">Tips for great product listings:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Use clear, well-lit photos</li>
                <li>Write descriptive product names</li>
                <li>Include size, color, and material details</li>
                <li>Set competitive prices</li>
                <li>✨ Images are auto-compressed (saves bandwidth & storage)</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <EditProductContent />
    </Suspense>
  )
}
