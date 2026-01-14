import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { Metadata } from 'next'
import {
  formatCurrency,
  generateWhatsAppLink,
  generateConfirmationWhatsAppMessage,
} from '@/lib/whatsapp'
import {
  Cart,
  CartItem,
  calculateCartTotal,
  getCartItemCount,
} from '@/lib/cart'
import BackButton from '@/components/BackButton'

interface CartPageProps {
  params: Promise<{
    cartId: string
  }>
}

/**
 * Generate metadata for cart page
 */
export async function generateMetadata({
  params,
}: CartPageProps): Promise<Metadata> {
  const { cartId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: cart } = await supabase
    .from('carts')
    .select('vendor_id')
    .eq('id', cartId)
    .single()

  if (!cart) {
    return {
      title: 'Cart Not Found | SocialStore',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  // Get vendor info
  const { data: vendor } = await supabase
    .from('vendors')
    .select('store_name')
    .eq('id', cart.vendor_id)
    .single()

  const storeName = vendor?.store_name || 'Store'

  return {
    title: `Your Order - ${storeName} | SocialStore`,
    description: `View and manage your order from ${storeName}`,
    robots: {
      index: false, // Don't index cart pages
      follow: true,
    },
  }
}

export default async function CartPage({ params }: CartPageProps) {
  const { cartId } = await params
  const supabase = await createServerSupabaseClient()

  // Get cart details
  const { data: cart, error: cartError } = await supabase
    .from('carts')
    .select('*')
    .eq('id', cartId)
    .single()

  if (cartError || !cart) {
    notFound()
  }

  // Get vendor details separately
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', cart.vendor_id)
    .single()

  if (vendorError || !vendor) {
    notFound()
  }

  // Get customer details if available
  let customer = null
  if (cart.customer_id) {
    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('id', cart.customer_id)
      .single()
    customer = customerData
  }

  const items = cart.items as CartItem[]
  const total = calculateCartTotal(items)
  const itemCount = getCartItemCount(items)

  // Check if current user is the vendor (for edit access)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isVendor = !!(user && vendor.user_id === user.id)

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Cart</h1>
              <p className="mt-1 text-sm text-gray-600">
                From: <span className="font-semibold">{vendor.store_name}</span>
              </p>
            </div>
            <StatusBadge status={cart.status} />
          </div>

          {/* Cart Info */}
          <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 text-sm">
            <div>
              <p className="text-gray-600">Order ID</p>
              <p className="font-mono text-xs text-gray-900">
                {cartId.slice(0, 8)}...
              </p>
            </div>
            <div>
              <p className="text-gray-600">Created</p>
              <p className="text-gray-900">
                {new Date(cart.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information (Vendor View Only) */}
        {isVendor && customer && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Customer Information
              </h2>
              {cart.returning_customer && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  Returning Customer
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">
                  <a
                    href={`tel:${customer.phone}`}
                    className="text-green-600 hover:text-green-700"
                  >
                    {customer.phone}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Address</p>
                <p className="font-semibold text-gray-900">{customer.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Order Items ({itemCount})
          </h2>

          <div className="space-y-4">
            {items.map((item, index) => (
              <CartItemCard
                key={item.product_id}
                item={item}
                index={index}
                isVendor={isVendor}
                cartId={cartId}
              />
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {cart.customer_notes && (
          <div className="mb-6 rounded-xl bg-blue-50 p-6">
            <h3 className="mb-2 font-semibold text-blue-900">
              Customer Notes
            </h3>
            <p className="text-blue-800">{cart.customer_notes}</p>
          </div>
        )}

        {cart.vendor_notes && (
          <div className="mb-6 rounded-xl bg-green-50 p-6">
            <h3 className="mb-2 font-semibold text-green-900">Vendor Notes</h3>
            <p className="text-green-800">{cart.vendor_notes}</p>
          </div>
        )}

        {/* Actions */}
        {isVendor ? (
          <VendorActions cart={cart as Cart} vendor={vendor} />
        ) : (
          <CustomerActions cart={cart as Cart} vendor={vendor} />
        )}
      </div>
    </div>
  )
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: Cart['status'] }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewing: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const labels = {
    pending: '⏳ Pending',
    reviewing: '👀 Reviewing',
    confirmed: '✅ Confirmed',
    cancelled: '❌ Cancelled',
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

/**
 * Cart Item Card Component
 */
function CartItemCard({
  item,
  index,
  isVendor,
  cartId,
}: {
  item: CartItem
  index: number
  isVendor: boolean
  cartId: string
}) {
  return (
    <div className="flex gap-4 rounded-lg border p-4">
      {/* Product Image */}
      {item.image_url && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      )}

      {/* Product Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{item.name}</h3>
        <p className="mt-1 text-sm text-gray-600">
          {formatCurrency(item.price)} × {item.quantity}
        </p>
        <p className="mt-1 font-semibold text-green-600">
          {formatCurrency(item.price * item.quantity)}
        </p>
      </div>
    </div>
  )
}

/**
 * Vendor Actions Component
 */
function VendorActions({ cart, vendor }: { cart: Cart; vendor: any }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">Vendor Actions</h3>

        <form action={`/api/cart/${cart.id}/update-status`} method="POST">
          <div className="space-y-4">
            {/* Status Update */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Update Status
              </label>
              <select
                name="status"
                defaultValue={cart.status}
                className="w-full rounded-lg border px-4 py-2"
              >
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Vendor Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Add Notes
              </label>
              <textarea
                name="vendor_notes"
                defaultValue={cart.vendor_notes || ''}
                placeholder="Add notes about availability, delivery, etc..."
                rows={3}
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              Update Order
            </button>
          </div>
        </form>

        {/* Send Confirmation to Customer */}
        {cart.status === 'confirmed' && vendor.whatsapp_number && (
          <div className="mt-4 border-t pt-4">
            <a
              href={generateWhatsAppLink(
                vendor.whatsapp_number,
                generateConfirmationWhatsAppMessage(
                  vendor.store_name,
                  cart.items as CartItem[]
                )
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600"
            >
              <span>📱</span>
              Send Confirmation via WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Customer Actions Component
 */
function CustomerActions({ cart, vendor }: { cart: Cart; vendor: any }) {
  const items = cart.items as CartItem[]

  return (
    <div className="space-y-4">
      {/* Contact Vendor */}
      {vendor.whatsapp_number && cart.status === 'pending' && (
        <div className="rounded-xl bg-green-50 p-6">
          <p className="mb-4 text-center text-sm text-gray-700">
            Your order is pending. Contact the vendor to complete your purchase.
          </p>
          <a
            href={`https://wa.me/${vendor.whatsapp_number.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            <span>💬</span>
            Contact {vendor.store_name} on WhatsApp
          </a>
        </div>
      )}

      {/* Order Confirmed Message */}
      {cart.status === 'confirmed' && (
        <div className="rounded-xl bg-green-100 p-6 text-center">
          <div className="mb-2 text-4xl">✅</div>
          <h3 className="mb-2 text-lg font-semibold text-green-900">
            Order Confirmed!
          </h3>
          <p className="text-green-800">
            {vendor.store_name} has confirmed your order. They will contact you
            with delivery details shortly.
          </p>
        </div>
      )}

      {/* Order Cancelled Message */}
      {cart.status === 'cancelled' && (
        <div className="rounded-xl bg-red-100 p-6 text-center">
          <div className="mb-2 text-4xl">❌</div>
          <h3 className="mb-2 text-lg font-semibold text-red-900">
            Order Cancelled
          </h3>
          <p className="text-red-800">
            This order has been cancelled. Please contact the vendor for more
            information.
          </p>
        </div>
      )}

      {/* Back to Store */}
      <a
        href={`/${vendor.slug}`}
        className="block w-full rounded-lg border-2 border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
      >
        ← Back to Store
      </a>
    </div>
  )
}
