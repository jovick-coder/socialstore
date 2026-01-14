'use client'

import { useEffect } from 'react'
import { trackProductClick } from '@/lib/analytics'

interface ProductViewTrackerProps {
  vendorId: string
  productId: string
  productName: string
}

export default function ProductViewTracker({ vendorId, productId, productName }: ProductViewTrackerProps) {
  useEffect(() => {
    // Track product view when component mounts
    trackProductClick(vendorId, productId, productName)
  }, [vendorId, productId, productName])

  return null
}
