import { CartSkeleton } from '@/components/Skeletons'

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Back button placeholder */}
        <div className="mb-6 h-6 w-24 rounded bg-gray-200"></div>

        <CartSkeleton />
      </div>
    </div>
  )
}
