"use client"

import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { X, Plus, Minus, Trash2, ShoppingBag, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

export function CartSidebar() {
    const { items, isOpen, closeCart, removeItem, updateQuantity, updateDays, clearCart, totalItems, totalPrice } = useCart()
    const { isAuthenticated } = useAuth()
    const router = useRouter()

    const handleCheckout = () => {
        if (!isAuthenticated) {
            closeCart()
            router.push("/login")
            return
        }
        closeCart()
        router.push("/checkout")
    }

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                    onClick={closeCart}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={20} className="text-primary" />
                        <h2 className="text-lg font-bold">Your Cart</h2>
                        {totalItems > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={closeCart}
                        className="p-2 hover:bg-secondary rounded-full transition"
                        aria-label="Close cart"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "calc(100vh - 220px)" }}>
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <ShoppingBag size={48} className="text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground font-medium">Your cart is empty</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                                Browse products or equipment to get started
                            </p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-3 p-3 bg-secondary/30 rounded-xl border border-border/50 hover:border-border transition"
                            >
                                {/* Image */}
                                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <span className="text-2xl">{item.type === "rental" ? "🚜" : "🌾"}</span>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h3 className="font-medium text-sm truncate">{item.name}</h3>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {item.type === "rental" ? "📅 Rental" : item.category?.replace(/-/g, " ") || "Product"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-1 text-muted-foreground hover:text-red-500 transition flex-shrink-0"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        {item.type === "rental" ? (
                                            /* Rental: days selector */
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} className="text-muted-foreground" />
                                                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => updateDays(item.id, (item.days || 1) - 1)}
                                                        className="px-2 py-1 hover:bg-secondary transition"
                                                        disabled={(item.days || 1) <= 1}
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="px-2 py-1 text-xs font-medium min-w-[32px] text-center">
                                                        {item.days || 1}d
                                                    </span>
                                                    <button
                                                        onClick={() => updateDays(item.id, (item.days || 1) + 1)}
                                                        className="px-2 py-1 hover:bg-secondary transition"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Product: quantity selector */
                                            <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="px-2 py-1 hover:bg-secondary transition"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="px-3 py-1 text-xs font-medium min-w-[32px] text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="px-2 py-1 hover:bg-secondary transition"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        )}

                                        <span className="font-bold text-sm text-primary">
                                            ₹{item.type === "rental"
                                                ? ((item.pricePerDay || item.price) * (item.days || 1)).toLocaleString()
                                                : (item.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">Subtotal</span>
                            <span className="text-xl font-bold">₹{totalPrice.toLocaleString()}</span>
                        </div>
                        <Button className="w-full gap-2" size="lg" onClick={handleCheckout}>
                            <ShoppingBag size={18} />
                            Proceed to Checkout
                        </Button>
                        <button
                            onClick={clearCart}
                            className="w-full text-sm text-muted-foreground hover:text-red-500 transition text-center py-1"
                        >
                            Clear Cart
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}
