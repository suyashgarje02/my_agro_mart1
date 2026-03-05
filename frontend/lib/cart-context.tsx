"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export interface CartItem {
    id: string
    name: string
    price: number
    image?: string
    quantity: number
    type: "product" | "rental"
    category?: string
    // rental-specific
    days?: number
    pricePerDay?: number
}

interface CartContextType {
    items: CartItem[]
    isOpen: boolean
    openCart: () => void
    closeCart: () => void
    toggleCart: () => void
    addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    updateDays: (id: string, days: number) => void
    clearCart: () => void
    totalItems: number
    totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isOpen, setIsOpen] = useState(false)

    const openCart = useCallback(() => setIsOpen(true), [])
    const closeCart = useCallback(() => setIsOpen(false), [])
    const toggleCart = useCallback(() => setIsOpen((p) => !p), [])

    const addItem = useCallback(
        (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
            setItems((prev) => {
                const existing = prev.find((i) => i.id === newItem.id)
                if (existing) {
                    return prev.map((i) =>
                        i.id === newItem.id
                            ? { ...i, quantity: i.quantity + (newItem.quantity || 1) }
                            : i
                    )
                }
                return [...prev, { ...newItem, quantity: newItem.quantity || 1, days: newItem.days || 1 }]
            })
            setIsOpen(true)
        },
        []
    )

    const removeItem = useCallback((id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id))
    }, [])

    const updateQuantity = useCallback((id: string, quantity: number) => {
        if (quantity < 1) return
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
    }, [])

    const updateDays = useCallback((id: string, days: number) => {
        if (days < 1) return
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, days } : i)))
    }, [])

    const clearCart = useCallback(() => {
        setItems([])
        setIsOpen(false)
    }, [])

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
    const totalPrice = items.reduce((sum, i) => {
        if (i.type === "rental") {
            return sum + (i.pricePerDay || i.price) * (i.days || 1)
        }
        return sum + i.price * i.quantity
    }, 0)

    return (
        <CartContext.Provider
            value={{
                items,
                isOpen,
                openCart,
                closeCart,
                toggleCart,
                addItem,
                removeItem,
                updateQuantity,
                updateDays,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
