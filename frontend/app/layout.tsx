import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { CartProvider } from "@/lib/cart-context"
import { CartSidebar } from "@/components/cart-sidebar"
import { FloatingActions } from "@/components/floating-actions"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Agri Mart - Agricultural Products & Equipment Rental",
  description: "Buy and rent agricultural products, tools, and equipment. Connect with farmers and suppliers.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartSidebar />
            <FloatingActions />
          </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
