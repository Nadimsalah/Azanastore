import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Almarai } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from "@/components/cart-provider"
import { LanguageProvider } from "@/components/language-provider"
import { Toaster } from "sonner"
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const almarai = Almarai({ subsets: ["arabic"], weight: ["300", "400", "700", "800"], variable: "--font-almarai" });

export const metadata: Metadata = {
  title: 'Azana | Boutique & Luxury Women\'s Clothing',
  description: 'Azana is a boutique & luxury women\'s clothing store. Discover elegant dresses, timeless essentials, and statement pieces for every occasion.',
  icons: {
    icon: [
      {
        url: '/logo.webp',
      },
    ],
    apple: '/logo.webp',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${almarai.variable}`}>
        <LanguageProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LanguageProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
