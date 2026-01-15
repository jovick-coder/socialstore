'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProductWizard, { ProductWizardData } from '@/components/ProductWizard'

export default function AddProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (data: ProductWizardData) => {
    setIsLoading(true)
    try {
      // Get current vendor from session
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      // Get vendor ID from profile
      const { data: profile, error: profileError } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profile) {
        throw new Error('Vendor not found')
      }

      // Insert product
      const { error: productError } = await supabase
        .from('products')
        .insert({
          vendor_id: profile.id,
          name: data.name,
          description: data.description,
          category: data.category,
          price: data.price,
          contact_for_price: data.contactForPrice,
          images: data.images,
          attributes: data.attributes,
          availability: data.availability,
          is_active: true,
          created_at: new Date().toISOString(),
        })

      if (productError) throw productError

      // Show success message
      alert('Product published successfully!')
      // Programmatic navigation after successful form submission is appropriate
      router.push('/dashboard/products')
    } catch (error) {
      console.error('Error submitting product:', error)
      alert('Failed to publish product')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="mt-2 text-gray-600">
          Create a new product with images, details, and attributes
        </p>
      </div>

      <ProductWizard onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}

//  <div className=\mb-6\>
//  <h1 className=\text-3xl font-bold text-gray-900\>Add New Product</h1>
//  <p className=\mt-2 text-gray-600\>
//  Create a new product with images, details, and attributes
//  </p>
//  </div >

//   <ProductWizard onSubmit={handleSubmit} isLoading={isLoading} />
//  </div >
//  )
// }
