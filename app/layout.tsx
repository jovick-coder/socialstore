import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LowDataModeProvider } from "@/lib/LowDataModeContext";
import { QueryProvider } from "@/lib/QueryProvider";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "SocialStore - Sell Smarter on WhatsApp",
  description: "Stop sending product images repeatedly. Create your catalog once, share one link, and let customers browse and order—saving time, data, and closing more sales.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* TanStack Query Provider: Enables client-side caching for dashboard navigation */}
        {/* Ensures dashboard pages feel like a client-side SPA (instant navigation) */}
        <QueryProvider>
          {/* Low Data Mode Provider: Enables data saver mode across the app */}
          {/* Detects system Data Saver setting and allows manual override */}
          <LowDataModeProvider>
            {children}
          </LowDataModeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
