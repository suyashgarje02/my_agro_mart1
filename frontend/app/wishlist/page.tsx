"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { Heart, ShoppingCart, Trash2, Loader2 } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"

interface WishlistProduct {
    _id: string; name: string; price: number; discountPrice?: number
    images?: { url: string }[]; category: string; brand?: string; stock: number
}

export default function WishlistPage() {
    const { isAuthenticated, loading: authLoading } = useAuth()
    const router = useRouter()
    const { addItem } = useCart()
    const [items, setItems] = useState<WishlistProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [removingId, setRemovingId] = useState<string | null>(null)
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

    useEffect(() => { if (!authLoading && !isAuthenticated) router.push("/login") }, [authLoading, isAuthenticated, router])
    useEffect(() => { if (isAuthenticated) fetchWishlist() }, [isAuthenticated])

    const fetchWishlist = async () => {
        try { const res = await api.get("/wishlist"); setItems(res.data || []) }
        catch { } finally { setLoading(false) }
    }

    const handleRemove = async (productId: string) => {
        setRemovingId(productId)
        try { await api.delete(`/wishlist/${productId}`); setItems(prev => prev.filter(p => p._id !== productId)) }
        catch { } finally { setRemovingId(null) }
    }

    const handleAddToCart = (product: WishlistProduct) => {
        addItem({ id: product._id, name: product.name, price: product.discountPrice || product.price, image: product.images?.[0]?.url, type: "product", quantity: 1 })
        setAddedIds(prev => new Set([...prev, product._id]))
        setTimeout(() => setAddedIds(prev => { const s = new Set(prev); s.delete(product._id); return s }), 2000)
    }

    if (authLoading || loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={36} />
        </div>
    )

    return (
        <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 142)" }}>
            <style>{`
        .wish-card{transition:transform .2s ease, box-shadow .2s ease;}
        .wish-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(34,197,94,.15);}
        @keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}
        .pop{animation:pop .25s ease;}
      `}</style>
            <Navigation />

            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, oklch(0.45 0.15 142), oklch(0.35 0.12 142))" }} className="px-4 py-10 text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="fill-white" size={28} />
                        <h1 className="text-3xl font-extrabold">My Wishlist</h1>
                    </div>
                    <p className="opacity-75 text-sm">{items.length} item{items.length !== 1 ? "s" : ""} saved</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-10">
                {items.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-7xl mb-5">🌿</div>
                        <h2 className="text-2xl font-extrabold mb-3">Your wishlist is empty</h2>
                        <p className="text-muted-foreground mb-8">Tap the ❤️ on any product to save it for later</p>
                        <Button asChild className="rounded-full px-8 py-6 text-base font-bold">
                            <Link href="/products">Browse Products</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {items.map(product => {
                            const isAdded = addedIds.has(product._id)
                            const isRemoving = removingId === product._id
                            const discount = product.discountPrice && product.discountPrice < product.price
                                ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0

                            return (
                                <div key={product._id} className="wish-card bg-white rounded-2xl border border-border overflow-hidden flex flex-col">
                                    {/* Image */}
                                    <Link href={`/products/${product._id}`} className="relative block overflow-hidden" style={{ height: 200 }}>
                                        {product.images?.[0]?.url ? (
                                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl bg-secondary">🌾</div>
                                        )}
                                        {discount > 0 && (
                                            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full">-{discount}%</span>
                                        )}
                                        <button onClick={(e) => { e.preventDefault(); handleRemove(product._id) }}
                                            disabled={isRemoving}
                                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-red-500 hover:bg-red-50 transition shadow"
                                            title="Remove from wishlist">
                                            {isRemoving ? <Loader2 size={14} className="animate-spin" /> : <Heart size={14} className="fill-red-500" />}
                                        </button>
                                    </Link>

                                    {/* Info */}
                                    <div className="p-4 flex flex-col flex-1 gap-2">
                                        <p className="text-xs text-muted-foreground capitalize">{product.category?.replace(/-/g, " ")}</p>
                                        <Link href={`/products/${product._id}`}>
                                            <h3 className="font-bold text-sm leading-snug hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                                        </Link>
                                        <div className="flex items-center gap-2 mt-auto pt-2">
                                            <span className="text-lg font-extrabold text-primary">₹{(product.discountPrice || product.price).toLocaleString()}</span>
                                            {discount > 0 && <span className="text-xs text-muted-foreground line-through">₹{product.price.toLocaleString()}</span>}
                                        </div>
                                        <div className="flex gap-2 mt-1">
                                            <button onClick={() => handleAddToCart(product)} disabled={product.stock <= 0}
                                                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${isAdded ? "bg-green-500 text-white" : product.stock > 0 ? "bg-primary text-white hover:opacity-90" : "bg-secondary text-muted-foreground cursor-not-allowed"}`}>
                                                <ShoppingCart size={13} />{isAdded ? "Added!" : product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                                            </button>
                                            <button onClick={() => handleRemove(product._id)} disabled={isRemoving}
                                                className="w-9 h-9 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition flex items-center justify-center flex-shrink-0">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
