import type { NextConfig } from "next";

/**
 * Next.js Image Optimization Configuration
 *
 * Performance optimizations for low-data environments:
 * 1. RemotePatterns: Allows next/image to optimize Supabase images
 * 2. Automatic WebP: Converts JPEG/PNG to WebP on supported browsers (~25-35% smaller)
 * 3. Quality optimization: Default 75 quality saves ~40% file size
 * 4. Responsive images: Different sizes for different viewports
 * 5. Cache strategy: Images cached at CDN level (Vercel)
 */

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Allow optimization of images from Supabase storage
        // Supabase CDN automatically serves WebP on compatible browsers
        // Significantly improves performance on slow networks
        protocol: "https",
        hostname: "mjxgvwgemdyrzqbiakwl.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Device sizes for responsive image selection
    // Browser selects closest device size for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for responsive srcset generation
    // Optimizes bandwidth: mobile gets smaller files than desktop
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Format preference: modern formats first
    // Next.js automatically converts if browser doesn't support WebP
    formats: ["image/avif", "image/webp"],
    // Cache strategy: images cached for 31536000 seconds (1 year)
    // Static images effectively cached forever
    // Dynamic images require revalidation on demand
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;

