'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/whatsapp'
import {
  CartItem,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  getCartItemCount,
  calculateCartTotal,
  CartStorage,
  createCart,
  generateCartUrl,
  saveDraftCart,
  getDraftCart,
  deleteDraftCart,
} from '@/lib/cart'
import {
  getOrCreateCustomerId,
  getCustomerProfile,
  saveCustomerProfile,
  cacheCustomerProfile,
  getCachedCustomerProfile,
  isReturningCustomer,
  CustomerProfile,
} from '@/lib/customer'
import { generateCartWhatsAppLink } from '@/lib/whatsapp'
import { trackProductClick, trackCartCreated, trackStoreView } from '@/lib/analytics'
import CustomerDetailsForm from '@/components/CustomerDetailsForm'

interface Product {
  id: string
  name: string
  price: number
  description?: string
  images: string[]
  is_available: boolean
}

interface StoreClientProps {
  vendor: {
    id: string
    slug: string
    store_name: string
    whatsapp_number: string
    description?: string
  }
  products: Product[]
}

export default function StoreClient({ vendor, products }: StoreClientProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null)
  const [isReturning, setIsReturning] = useState(false)
  const [recoverableCart, setRecoverableCart] = useState<any>(null)
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false)

  // Initialize customer ID and profile on mount
  useEffect(() => {
    const initializeCustomer = async () => {
      // Get or create customer ID
      const id = getOrCreateCustomerId()
      setCustomerId(id)

      // Check if returning customer
      const returning = await isReturningCustomer(id)
      setIsReturning(returning)

      if (returning) {
        // Load cached profile for returning customers
        const cachedProfile = getCachedCustomerProfile()
        if (cachedProfile) {
          setCustomerProfile(cachedProfile)
        } else {
          // Fetch from Supabase if not cached
          const { profile } = await getCustomerProfile(id)
          if (profile) {
            setCustomerProfile(profile)
            cacheCustomerProfile(profile)
          }
        }

        // Check for recoverable draft cart
        const { cart: draftCart } = await getDraftCart(vendor.id, id)

        // Check if this cart was already dismissed
        const dismissedCartId = localStorage.getItem(`dismissed_cart_${vendor.id}`)

        if (draftCart && draftCart.items && Array.isArray(draftCart.items) && draftCart.items.length > 0) {
          // Don't show if already dismissed
          if (dismissedCartId !== draftCart.id) {
            console.log('Draft cart found for recovery:', {
              cartId: draftCart.id,
              itemsCount: draftCart.items.length,
              totalQuantity: getCartItemCount(draftCart.items),
              items: draftCart.items
            })
            setRecoverableCart(draftCart)
            setShowRecoveryPrompt(true)
          } else {
            console.log('Cart was already dismissed:', dismissedCartId)
          }
        } else {
          console.log('No draft cart found for recovery')
        }
      }

      // Load cart from localStorage on mount
      const savedCart = CartStorage.load(vendor.id)
      setCart(savedCart)

      // Track store view
      trackStoreView(vendor.id)
    }

    initializeCustomer()
  }, [vendor.id])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    CartStorage.save(vendor.id, cart)
  }, [cart, vendor.id])

  // Save draft cart to Supabase whenever cart changes (for recovery)
  useEffect(() => {
    const saveDraft = async () => {
      if (!customerId) return

      // If cart is empty, delete the draft cart from Supabase
      if (cart.length === 0) {
        // Find and delete any existing draft cart
        if (recoverableCart?.id) {
          const { error } = await deleteDraftCart(recoverableCart.id)
          if (error) {
            console.error('Error deleting empty draft cart:', error)
          } else {
            console.log('Empty draft cart deleted from Supabase')
            setRecoverableCart(null)
          }
        }
        return
      }

      // Save non-empty cart
      const { error } = await saveDraftCart(vendor.id, cart, customerId)
      if (error) {
        console.error('Error saving draft cart:', error)
      } else {
        console.log('Draft cart saved to Supabase')
      }
    }

    // Debounce to avoid too many Supabase calls
    const timer = setTimeout(saveDraft, 500)
    return () => clearTimeout(timer)
  }, [cart, customerId, vendor.id, recoverableCart?.id])

  const handleAddToCart = (product: Product) => {
    // const wasEmpty = cart.length === 0

    setCart((current) =>
      addToCart(current, {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.images[0],
      })
    )

    // Track product click
    trackProductClick(vendor.id, product.id, product.name)

    // // Only open cart on first item added
    // if (wasEmpty) {
    //   setIsCartOpen(true)
    // }
  }

  const handleRemoveFromCart = (productId: string) => {
    setCart((current) => removeFromCart(current, productId))
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCart((current) => updateCartItemQuantity(current, productId, quantity))
  }

  const handleSubmitCart = async () => {
    if (cart.length === 0) return

    // Show customer form if not filled
    if (!customerProfile) {
      setShowCustomerForm(true)
      setIsCartOpen(false)
      return
    }

    // Proceed with cart submission
    await submitCartWithCustomerData(customerProfile)
  }

  /**
   * Submit cart with customer data
   */
  const submitCartWithCustomerData = async (profile: CustomerProfile) => {
    if (!customerId) return

    setIsSubmitting(true)

    try {
      // Create cart in Supabase with customer ID
      const { cart: createdCart, error } = await createCart(vendor.id, cart, customerId, isReturning)

      if (error || !createdCart) {
        alert('Failed to create cart. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Track cart creation
      const total = calculateCartTotal(cart)
      const itemCount = getCartItemCount(cart)
      await trackCartCreated(vendor.id, createdCart.id, itemCount, total)

      // Generate cart URL
      const cartUrl = await generateCartUrl(createdCart.id)

      // Generate WhatsApp link with order details
      const whatsappLink = generateCartWhatsAppLink(
        vendor.store_name,
        vendor.whatsapp_number,
        cart,
        cartUrl
      )

      // Clear cart
      CartStorage.clear(vendor.id)
      setCart([])
      setIsCartOpen(false)
      setShowCustomerForm(false)

      // Redirect to WhatsApp
      window.open(whatsappLink, '_blank')
    } catch (error) {
      console.error('Error submitting cart:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle customer form submission
   */
  const handleCustomerFormSubmit = async (
    profileData: Omit<CustomerProfile, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!customerId) return

    setIsSubmitting(true)

    try {
      // Save customer profile to Supabase
      const { profile, error } = await saveCustomerProfile(customerId, profileData)

      if (error || !profile) {
        alert('Failed to save customer information. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Cache profile locally
      setCustomerProfile(profile)
      cacheCustomerProfile(profile)

      // Proceed with cart submission
      await submitCartWithCustomerData(profile)
    } catch (error) {
      console.error('Error saving customer profile:', error)
      alert('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleProductClick = (product: Product) => {
    // Track product click
    trackProductClick(vendor.id, product.id, product.name)
  }

  const cartItemCount = getCartItemCount(cart)
  const cartTotal = calculateCartTotal(cart)

  return (
    <>
      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            {/* Product Image - Clickable to detail page */}
            <Link
              href={`/${vendor.slug}/product/${product.id}`}
              onClick={() => handleProductClick(product)}
              className="relative block aspect-square w-full overflow-hidden bg-gray-100"
            >
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <svg
                    className="h-16 w-16 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </Link>

            {/* Product Info */}
            <div className="p-4">
              <Link
                href={`/${vendor.slug}/product/${product.id}`}
                onClick={() => handleProductClick(product)}
                className="block"
              >
                <h3 className="font-semibold text-gray-900 hover:text-green-600">
                  {product.name}
                </h3>
                <p className="mt-1 text-lg font-bold text-green-600">
                  {formatCurrency(product.price)}
                </p>
                {product.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {product.description}
                  </p>
                )}
              </Link>

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(product)}
                className="mt-4 w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition hover:bg-green-700"
        >
          <div className="relative">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
              {cartItemCount}
            </span>
          </div>
        </button>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 bg-opacity-50"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Cart Panel */}
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-xl sm:w-96">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Your Cart ({cartItemCount})
                  </h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="h-6 w-6"
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
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex gap-4 rounded-lg border p-3"
                    >
                      {/* Product Image */}
                      {item.image_url && (
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}

                      {/* Item Details */}
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-green-600">
                          {formatCurrency(item.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="mt-2 flex text-gray-500 items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.product_id,
                                item.quantity - 1
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded border hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.product_id,
                                item.quantity + 1
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded border hover:bg-gray-100"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemoveFromCart(item.product_id)}
                            className="ml-auto text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t px-6 py-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>

                <button
                  onClick={handleSubmitCart}
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <span className="mr-2">📱</span>
                      Send Order to {vendor.store_name}
                    </>
                  )}
                </button>

                <p className="mt-2 text-center text-xs text-gray-500">
                  You'll be redirected to WhatsApp to complete your order
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Customer Details Form Modal */}
      {showCustomerForm && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 bg-opacity-50"
            onClick={() => !isSubmitting && setShowCustomerForm(false)}
          />

          {/* Form Panel */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
            <div className="w-full bg-white sm:max-w-md sm:rounded-lg">
              <div className="max-h-[90vh] overflow-y-auto p-6">
                <CustomerDetailsForm
                  onSubmit={handleCustomerFormSubmit}
                  isReturning={isReturning}
                  cachedProfile={customerProfile}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Cart Recovery Prompt */}
      {showRecoveryPrompt && recoverableCart && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/50 bg-opacity-50" />

          {/* Recovery Prompt */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Welcome back! 👋
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    You have a pending order from your last visit. Would you like to continue where you left off?
                  </p>
                  <div className="mt-3 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500">Previous cart:</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {getCartItemCount(recoverableCart.items || [])} item(s) · {formatCurrency(calculateCartTotal(recoverableCart.items || []))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    // Load recoverable cart items and ensure correct format
                    const cartItems = Array.isArray(recoverableCart.items) ? recoverableCart.items : []
                    setCart(cartItems)
                    setShowRecoveryPrompt(false)
                    setIsCartOpen(true)
                  }}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  Resume Order
                </button>
                <button
                  onClick={async () => {
                    // Delete the draft cart from Supabase
                    if (recoverableCart?.id) {
                      console.log('Attempting to delete draft cart:', recoverableCart.id)
                      const { success, error } = await deleteDraftCart(recoverableCart.id)
                      if (error || !success) {
                        console.error('Error deleting draft cart:', error)
                        alert('Failed to delete cart. Please try again.')
                        return
                      } else {
                        console.log('Draft cart deleted successfully')
                      }
                    }
                    setShowRecoveryPrompt(false)
                  }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
