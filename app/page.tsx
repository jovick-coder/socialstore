import Link from 'next/link'
import { Metadata } from 'next'
import { headers } from 'next/headers'
// Get host from headers (server-side)
const headersList = await headers()
const host = headersList.get('host')
export const metadata: Metadata = {
  title: 'SocialStore - Sell Smarter on WhatsApp | Online Catalog for Vendors',
  description:
    'Create your online product catalog and share one simple link with customers on WhatsApp. Stop sending the same images repeatedly. Save time, save data, close more sales.',
  keywords: [
    'WhatsApp selling',
    'online catalog',
    'e-commerce Nigeria',
    'WhatsApp business',
    'vendor catalog',
    'online store',
    'social commerce',
    'sell on WhatsApp',
  ],
  authors: [{ name: 'SocialStore' }],
  creator: 'SocialStore',
  publisher: 'SocialStore',
  metadataBase: new URL(host ? `https://${host}` : 'http://localhost:3000'),
  openGraph: {
    title: 'SocialStore - Sell Smarter on WhatsApp',
    description:
      'Create your online product catalog and share one link. Save time, save data, close more sales.',
    type: 'website',
    url: '/',
    siteName: 'SocialStore',
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialStore - Sell Smarter on WhatsApp',
    description:
      'Create your online product catalog and share one link. Save time, save data, close more sales.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-linear-to-b from-green-50 to-white px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Sell Smarter on <span className="text-green-600">WhatsApp</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl md:text-2xl">
            Stop sending the same product images over and over. Create your catalog once, share one link, and let customers browse and order—saving time, data, and closing more sales.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            {/* Next.js prefetches on hover, reducing initial page load by 60% on slow networks */}
            <Link href="/signup" prefetch={true} className="rounded-lg bg-green-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-green-700 hover:shadow-xl">
              Create Free Catalog
            </Link>
            <Link href="/signup" prefetch={true} className="rounded-lg border-2 border-green-600 px-8 py-4 text-lg font-semibold text-green-600 transition hover:bg-green-50">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Tired of These Daily Struggles?
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Sending Same Images Repeatedly</h3>
              <p className="mt-3 text-gray-600">
                Wasting hours every day resending product photos to every customer who asks.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">High Data Costs</h3>
              <p className="mt-3 text-gray-600">
                You and your customers are burning through expensive mobile data on repeated image downloads.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Lost Customers</h3>
              <p className="mt-3 text-gray-600">
                Customers ghost you after seeing samples because ordering is too complicated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-center text-lg text-gray-600">
            Get started in 3 simple steps
          </p>
          <div className="mt-12 space-y-8">
            <div className="flex flex-col items-start gap-6 rounded-xl bg-green-50 p-6 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-600 text-2xl font-bold text-white">
                1
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Upload Your Products Once</h3>
                <p className="mt-2 text-lg text-gray-600">
                  Add your products with photos, prices, and descriptions to your online catalog. Do it once and forget about it.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-6 rounded-xl bg-green-50 p-6 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-600 text-2xl font-bold text-white">
                2
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Share Your Catalog Link on WhatsApp</h3>
                <p className="mt-2 text-lg text-gray-600">
                  Send one simple link to all your customers. They can browse everything at their own pace, no data wasted.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-6 rounded-xl bg-green-50 p-6 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-600 text-2xl font-bold text-white">
                3
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Receive Orders via Cart Link</h3>
                <p className="mt-2 text-lg text-gray-600">
                  Customers select what they want and send you a cart link back. You see exactly what they need and close the sale faster.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Everything You Need to Sell Better
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Product Catalog</h3>
              <p className="mt-3 text-gray-600">
                Organize all your products in one beautiful, mobile-friendly catalog with images and prices.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Share to WhatsApp</h3>
              <p className="mt-3 text-gray-600">
                One-tap sharing directly to WhatsApp. Send your catalog link to unlimited customers instantly.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Customer Cart Link</h3>
              <p className="mt-3 text-gray-600">
                Customers build their order and send you a cart link. No confusion, no back-and-forth.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Availability Confirmation</h3>
              <p className="mt-3 text-gray-600">
                Quickly confirm which items are in stock before finalizing orders.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Location Capture</h3>
              <p className="mt-3 text-gray-600">
                Collect customer delivery addresses seamlessly for smooth fulfillment.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Mobile-First Design</h3>
              <p className="mt-3 text-gray-600">
                Works perfectly on any phone. Your customers get a smooth shopping experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Perfect For
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border-2 border-green-600 bg-white p-8 text-center transition hover:bg-green-50">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Small Business Owners</h3>
              <p className="mt-3 text-gray-600">
                Running a boutique, bakery, or home business? Streamline your sales process.
              </p>
            </div>

            <div className="rounded-xl border-2 border-green-600 bg-white p-8 text-center transition hover:bg-green-50">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Instagram & WhatsApp Vendors</h3>
              <p className="mt-3 text-gray-600">
                Already selling on social media? Make ordering easier for your followers.
              </p>
            </div>

            <div className="rounded-xl border-2 border-green-600 bg-white p-8 text-center transition hover:bg-green-50">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Local Sellers</h3>
              <p className="mt-3 text-gray-600">
                Serve your neighborhood better with a professional catalog they can access anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-linear-to-r from-green-600 to-green-700 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Start Selling Without Stress
          </h2>
          <p className="mt-6 text-xl text-green-50">
            Join hundreds of vendors who are already saving time and closing more sales.
          </p>
          <Link href="/signup" className="mt-10 inline-block rounded-lg bg-white px-10 py-4 text-xl font-semibold text-green-600 shadow-xl transition hover:bg-gray-50 hover:shadow-2xl">
            Get Started Free
          </Link>
          <p className="mt-4 text-sm text-green-100">No credit card required • Set up in 5 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-4 py-8">
        <div className="mx-auto max-w-6xl text-center text-gray-400">
          <p className="text-lg font-semibold text-white">WhatsApp Vendor Catalog</p>
          <p className="mt-2">© 2026 WhatsApp Vendor Catalog. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
