"use client"

import { Navigation } from "@/components/navigation"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ShoppingCart, Check, Star, ArrowLeft, Package, Tag,
    Loader2, ShieldCheck, Truck, RefreshCcw, MessageSquare, Send
} from "lucide-react"

/* ─── tiny scroll-reveal ─── */
function useReveal() {
    const ref = useRef<HTMLDivElement>(null)
    const [shown, setShown] = useState(false)
    useEffect(() => {
        const el = ref.current; if (!el) return
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect() } }, { threshold: 0.08 })
        obs.observe(el); return () => obs.disconnect()
    }, [])
    return { ref, shown }
}
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const { ref, shown } = useReveal()
    return (
        <div ref={ref} style={{ opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(20px)", transition: `opacity .55s ease ${delay}ms, transform .55s ease ${delay}ms` }}>
            {children}
        </div>
    )
}

const CATEGORY_LABELS: Record<string, string> = {
    "seeds-fertilizers": "Seeds & Fertilizers",
    "tools-equipment": "Tools & Equipment",
    "pesticides-chemicals": "Pesticides & Chemicals",
    "irrigation": "Irrigation",
    "organic": "Organic",
}

interface Product {
    _id: string; name: string; description: string; price: number; discountPrice?: number
    category: string; brand?: string; stock: number; tags?: string[]
    images?: { url: string; alt: string }[]
    ratings?: { average: number; count: number }
    reviews?: { user: { _id: string; name: string }; rating: number; comment: string; createdAt: string }[]
    createdBy?: { name: string }
    specifications?: Record<string, string>
}

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { addItem } = useCart()
    const { user, isAuthenticated } = useAuth()

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [added, setAdded] = useState(false)
    const [heroVisible, setHeroVisible] = useState(false)

    // Review form state
    const [myRating, setMyRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [myComment, setMyComment] = useState("")
    const [submittingReview, setSubmittingReview] = useState(false)
    const [reviewMsg, setReviewMsg] = useState("")

    useEffect(() => {
        if (params?.id) fetchProduct(params.id as string)
    }, [params?.id])

    useEffect(() => {
        const t = setTimeout(() => setHeroVisible(true), 80)
        return () => clearTimeout(t)
    }, [])

    const fetchProduct = async (id: string) => {
        try {
            setLoading(true)
            const res = await api.get(`/products/${id}`)
            setProduct(res.data)
        } catch {
            setProduct(null)
        } finally {
            setLoading(false)
        }
    }

    const handleAddToCart = () => {
        if (!product) return
        addItem({ id: product._id, name: product.name, price: product.discountPrice || product.price, image: product.images?.[0]?.url, type: "product", category: product.category })
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    const handleSubmitReview = async () => {
        if (!isAuthenticated) { setReviewMsg("Please login to leave a review."); return }
        if (myRating === 0) { setReviewMsg("Please select a rating."); return }
        if (!myComment.trim()) { setReviewMsg("Please write a comment."); return }
        try {
            setSubmittingReview(true)
            await api.post(`/products/${product!._id}/reviews`, { rating: myRating, comment: myComment })
            setReviewMsg("✅ Review submitted! Thank you.")
            setMyRating(0); setMyComment("")
            fetchProduct(product!._id)
        } catch (e: any) {
            setReviewMsg(e?.response?.data?.message || "Could not submit review.")
        } finally {
            setSubmittingReview(false)
        }
    }

    const discountPct = product?.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0

    if (loading) return (
        <main className="min-h-screen" style={{ background: "oklch(0.97 0.01 142)" }}>
            <Navigation />
            <div className="flex items-center justify-center h-[70vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-muted-foreground">Loading product...</p>
                </div>
            </div>
        </main>
    )

    if (!product) return (
        <main className="min-h-screen" style={{ background: "oklch(0.97 0.01 142)" }}>
            <Navigation />
            <div className="flex flex-col items-center justify-center h-[70vh] text-center gap-4">
                <div className="text-6xl">😕</div>
                <h2 className="text-2xl font-bold">Product not found</h2>
                <Link href="/products" className="text-primary underline underline-offset-4">← Back to Products</Link>
            </div>
        </main>
    )

    return (
        <main className="min-h-screen overflow-x-hidden" style={{ background: "oklch(0.97 0.01 142)" }}>
            <style>{`
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .shimmer-text{background:linear-gradient(90deg,oklch(0.45 0.15 142) 0%,#6ee7b7 40%,oklch(0.45 0.15 142) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite;}
        @keyframes stockPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.5)}70%{box-shadow:0 0 0 8px rgba(34,197,94,0)}}
        .stock-pulse{animation:stockPulse 2s ease-in-out infinite;}
        .add-btn{transition:transform .15s ease,box-shadow .2s ease,background-color .2s ease;}
        .add-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(34,197,94,.35);}
        .add-btn:active{transform:scale(.97);}
        .star-btn{transition:transform .1s ease;cursor:pointer;}
        .star-btn:hover{transform:scale(1.2);}
        .tag-pill{display:inline-flex;align-items:center;padding:.25rem .75rem;border-radius:9999px;font-size:.75rem;font-weight:600;background:oklch(0.92 0.04 142);color:oklch(0.4 0.13 142);}
        .trust-badge{display:flex;flex-direction:column;align-items:center;gap:.5rem;padding:1rem;border-radius:1rem;background:white;border:1px solid oklch(0.9 0.02 142);text-align:center;font-size:.75rem;color:oklch(0.4 0.05 142);}
        .review-card{border-radius:1rem;padding:1.25rem;background:white;border:1px solid oklch(0.9 0.02 142);}
      `}</style>

            <Navigation />

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"
                    style={{ opacity: heroVisible ? 1 : 0, transition: "opacity .5s ease" }}>
                    <Link href="/" className="hover:text-primary transition">Home</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-primary transition">Products</Link>
                    <span>/</span>
                    <Link href={`/products?category=${product.category}`} className="hover:text-primary transition capitalize">
                        {CATEGORY_LABELS[product.category] || product.category}
                    </Link>
                    <span>/</span>
                    <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
                </div>
            </div>

            {/* ─── MAIN PRODUCT SECTION ─── */}
            <section className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-10 items-start"
                    style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(16px)", transition: "opacity .6s ease .1s, transform .6s ease .1s" }}>

                    {/* LEFT: Image */}
                    <div className="sticky top-24">
                        <div className="rounded-3xl overflow-hidden bg-white border border-border shadow-lg aspect-square flex items-center justify-center relative">
                            {product.images?.[0] ? (
                                <img src={product.images[0].url} alt={product.images[0].alt || product.name}
                                    className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                    <Package size={64} className="opacity-30" />
                                    <p className="text-sm">No image available</p>
                                </div>
                            )}
                            {/* Discount badge */}
                            {discountPct > 0 && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
                                    -{discountPct}% OFF
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Product Info */}
                    <div className="space-y-6">
                        {/* Category + Brand */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="tag-pill">{CATEGORY_LABELS[product.category] || product.category}</span>
                            {product.brand && <span className="text-sm text-muted-foreground font-medium">by <strong>{product.brand}</strong></span>}
                        </div>

                        {/* Name */}
                        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight shimmer-text">{product.name}</h1>

                        {/* Rating summary */}
                        {product.ratings && product.ratings.count > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="flex">
                                    {[...Array(5)].map((_, s) => (
                                        <Star key={s} size={18} className={s < Math.round(product.ratings!.average) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"} />
                                    ))}
                                </div>
                                <span className="font-semibold">{product.ratings.average.toFixed(1)}</span>
                                <span className="text-muted-foreground text-sm">({product.ratings.count} reviews)</span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-extrabold text-primary">₹{(product.discountPrice ?? product.price).toLocaleString()}</span>
                            {product.discountPrice && (
                                <span className="text-xl text-muted-foreground line-through">₹{product.price.toLocaleString()}</span>
                            )}
                            {discountPct > 0 && (
                                <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Save ₹{(product.price - product.discountPrice!).toLocaleString()}</span>
                            )}
                        </div>

                        {/* Stock */}
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${product.stock > 0 ? "bg-green-100 text-green-700 stock-pulse" : "bg-red-100 text-red-700"}`}>
                                <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`}></span>
                                {product.stock > 0 ? `In Stock (${product.stock} left)` : "Out of Stock"}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-base text-muted-foreground leading-relaxed">{product.description}</p>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <Tag size={14} className="text-muted-foreground" />
                                {product.tags.map((tag) => (
                                    <span key={tag} className="tag-pill">#{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* Add to Cart */}
                        <div className="flex gap-3 pt-2">
                            <button
                                className={`flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 add-btn ${added ? "bg-green-600 text-white" : product.stock > 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground cursor-not-allowed"}`}
                                disabled={product.stock <= 0}
                                onClick={handleAddToCart}>
                                {added ? <><Check size={20} className="animate-bounce" /> Added to Cart!</> : <><ShoppingCart size={20} /> {product.stock > 0 ? "Add to Cart" : "Out of Stock"}</>}
                            </button>
                            <Link href="/products"
                                className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border-2 border-border font-semibold text-sm hover:border-primary hover:text-primary transition">
                                <ArrowLeft size={16} /> Back
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            {[
                                { icon: ShieldCheck, label: "Verified Seller", sub: "Quality assured" },
                                { icon: Truck, label: "Fast Delivery", sub: "2-5 business days" },
                                { icon: RefreshCcw, label: "Easy Returns", sub: "7-day return policy" },
                            ].map(({ icon: Icon, label, sub }) => (
                                <div key={label} className="trust-badge">
                                    <Icon size={22} className="text-primary" />
                                    <div>
                                        <p className="font-semibold text-foreground text-xs">{label}</p>
                                        <p className="opacity-60">{sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── REVIEWS ─── */}
            <section className="max-w-7xl mx-auto px-4 py-10">
                <Reveal>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                            <Star size={20} className="text-white fill-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold">Customer Reviews</h2>
                            <p className="text-sm text-muted-foreground">{product.reviews?.length || 0} review{product.reviews?.length !== 1 ? "s" : ""}</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Review list */}
                        <div className="lg:col-span-2 space-y-4">
                            {!product.reviews || product.reviews.length === 0 ? (
                                <div className="text-center py-12 rounded-2xl bg-white border border-border">
                                    <MessageSquare size={40} className="mx-auto mb-3 text-muted-foreground opacity-40" />
                                    <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                                </div>
                            ) : (
                                product.reviews.map((rev, i) => (
                                    <Reveal key={i} delay={i * 60}>
                                        <div className="review-card">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                                        style={{ background: "linear-gradient(135deg,oklch(0.45 0.15 142),oklch(0.35 0.12 142))" }}>
                                                        {rev.user?.name?.[0]?.toUpperCase() || "U"}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{rev.user?.name || "Farmer"}</p>
                                                        <p className="text-xs text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                                                    </div>
                                                </div>
                                                <div className="flex">
                                                    {[...Array(5)].map((_, s) => (
                                                        <Star key={s} size={13} className={s < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{rev.comment}</p>
                                        </div>
                                    </Reveal>
                                ))
                            )}
                        </div>

                        {/* Write a review */}
                        <div className="review-card h-fit bg-white">
                            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                                <MessageSquare size={16} className="text-primary" /> Write a Review
                            </h3>
                            {!isAuthenticated ? (
                                <p className="text-sm text-muted-foreground">
                                    <Link href="/login" className="text-primary underline underline-offset-2">Login</Link> to leave a review.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {/* Star picker */}
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2 font-medium">Your Rating</p>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button key={s} className="star-btn"
                                                    onMouseEnter={() => setHoverRating(s)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setMyRating(s)}>
                                                    <Star size={26} className={(hoverRating || myRating) >= s ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Comment */}
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2 font-medium">Your Comment</p>
                                        <textarea
                                            rows={3}
                                            className="w-full rounded-xl border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                                            placeholder="Share your experience with this product..."
                                            value={myComment}
                                            onChange={(e) => setMyComment(e.target.value)} />
                                    </div>
                                    {reviewMsg && (
                                        <p className={`text-xs px-3 py-2 rounded-lg ${reviewMsg.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{reviewMsg}</p>
                                    )}
                                    <button
                                        onClick={handleSubmitReview}
                                        disabled={submittingReview}
                                        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 add-btn disabled:opacity-60">
                                        {submittingReview ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                                        Submit Review
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </Reveal>
            </section>

            <footer className="bg-foreground text-background py-10 px-4 mt-6">
                <div className="max-w-7xl mx-auto text-center text-sm opacity-60">
                    <p>&copy; 2025 Agri Mart. All rights reserved.</p>
                </div>
            </footer>
        </main>
    )
}
