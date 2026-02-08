"use client"

import React from "react"
import { CartProvider } from "@/components/cart-provider"
import { LanguageProvider } from "@/components/language-provider"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <CartProvider>
                {children}
            </CartProvider>
            <Toaster />
        </LanguageProvider>
    )
}
