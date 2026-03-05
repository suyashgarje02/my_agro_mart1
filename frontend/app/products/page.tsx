"use client"
//redeploy
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
import { Search, ShoppingCart, Check, Star, SlidersHorizontal, Sparkles, Heart } from "lucide-react"
import { api } from "@/lib/api"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

/* ─── tiny scroll-reveal hook ─── */
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
    <div ref={ref} style={{ opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(24px)", transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

const CATEGORIES = [
  { label: "All", value: "", emoji: "🌿" },
  { label: "Seeds & Fertilizers", value: "seeds-fertilizers", emoji: "🌱" },
  { label: "Tools & Equipment", value: "tools-equipment", emoji: "🔧" },
  { label: "Pesticides & Chemicals", value: "pesticides-chemicals", emoji: "🧪" },
  { label: "Irrigation", value: "irrigation", emoji: "💧" },
  { label: "Organic", value: "organic", emoji: "🍃" },
]

const CATEGORY_COLORS: Record<string, string> = {
  "seeds-fertilizers": "from-green-400 to-emerald-600",
  "tools-equipment": "from-amber-400 to-orange-500",
  "pesticides-chemicals": "from-blue-400 to-cyan-500",
  "irrigation": "from-sky-400 to-blue-600",
  "organic": "from-lime-400 to-green-600",
  "": "from-primary to-emerald-600",
}

interface Product {
  _id: string; name: string; description: string; price: number; discountPrice?: number
  category: string; brand?: string; stock: number
  images?: { url: string; alt: string }[]; ratings?: { average: number; count: number }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [visible, setVisible] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())

  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t) }, [])
  useEffect(() => { setPage(1) }, [selectedCategory, searchTerm, minPrice, maxPrice])
  useEffect(() => { fetchProducts() }, [selectedCategory, searchTerm, minPrice, maxPrice, page])
  useEffect(() => {
    if (!loading && products.length > 0) { setVisible(false); const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t) }
  }, [loading, products])
  useEffect(() => { if (isAuthenticated) fetchWishlist() }, [isAuthenticated])

  const fetchWishlist = async () => {
    try { const res = await api.get("/wishlist"); setWishlistIds(new Set(res.data?.map((p: any) => p._id) || [])) }
    catch { }
  }

  const toggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    if (!isAuthenticated) { window.location.href = "/login"; return }
    try {
      const res = await api.post(`/wishlist/${productId}`, {})
      setWishlistIds(prev => {
        const n = new Set(prev)
        if (res.added) n.add(productId); else n.delete(productId)
        return n
      })
    } catch { }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true); setVisible(false)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (selectedCategory) params.append("category", selectedCategory)
      if (minPrice) params.append("minPrice", minPrice)
      if (maxPrice) params.append("maxPrice", maxPrice)
      params.append("limit", "12")
      params.append("page", String(page))
      const res = await api.get(`/products?${params.toString()}`)

setProducts(res.data?.data || [])

if (res.data?.pagination) {
  setTotalPages(res.data.pagination.pages || 1)
  setTotalCount(res.data.pagination.total || 0)

      }
    } catch { setProducts([]) } finally { setLoading(false) }
  }

  const getCategoryLabel = (value: string) => CATEGORIES.find((c) => c.value === value)?.label ?? value
  const getCategoryEmoji = (value: string) => CATEGORIES.find((c) => c.value === value)?.emoji ?? "🌿"

  const getDiscountPct = (price: number, dp: number) => Math.round(((price - dp) / price) * 100)

  const handleAddToCart = (product: Product) => {
    addItem({ id: product._id, name: product.name, price: product.discountPrice || product.price, image: product.images?.[0]?.url, type: "product", category: product.category })
    setAddedIds((prev) => new Set(prev).add(product._id))
    setTimeout(() => setAddedIds((prev) => { const n = new Set(prev); n.delete(product._id); return n }), 1500)
  }

  const activeCat = CATEGORIES.find((c) => c.value === selectedCategory)

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "oklch(0.97 0.01 142)" }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% center}100%{background-position:200% center} }
        @keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
        @keyframes stockPulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.5)}70%{box-shadow:0 0 0 7px rgba(34,197,94,0)} }
        @keyframes addedBounce { 0%{transform:scale(1)}40%{transform:scale(1.08)}100%{transform:scale(1)} }

        .shimmer-text { background:linear-gradient(90deg,oklch(0.45 0.15 142) 0%,#6ee7b7 40%,oklch(0.45 0.15 142) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite; }
        .blob-shape { animation:blob 8s ease-in-out infinite; }

        .product-card { transition:transform .25s ease,box-shadow .25s ease; border:1px solid oklch(0.92 0.02 142); }
        .product-card:hover { transform:translateY(-8px);box-shadow:0 24px 50px rgba(0,0,0,.13); }
        .product-img { transition:transform .45s ease; }
        .product-card:hover .product-img { transform:scale(1.09); }

        .product-card-animate { opacity:0;animation:fadeSlideUp .5s ease forwards; }

        .cat-pill { transition:transform .18s ease,box-shadow .2s ease,background-color .2s ease; }
        .cat-pill:hover { transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.1); }
        .cat-pill-active { transform:scale(1.06) !important; }

        .stock-pulse { animation:stockPulse 2.2s ease-in-out infinite; }

        .add-btn { transition:background-color .22s ease,transform .14s ease; overflow:hidden; position:relative; }
        .add-btn::after { content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);transform:translateX(-100%);transition:transform .4s ease; }
        .add-btn:hover:not(:disabled)::after { transform:translateX(100%); }
        .add-btn:active { transform:scale(.96); }
        .add-btn-added { background-color:#16a34a !important;animation:addedBounce .3s ease; }

        .search-box { transition:box-shadow .2s ease,border-color .2s ease; }
        .search-box:focus-within { box-shadow:0 0 0 3px rgba(34,197,94,.25);border-color:oklch(0.55 0.15 142); }
      `}</style>

      <Navigation />

      {/* ─── HERO ─── */}
      <section className="relative py-20 px-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.98 0.02 142) 0%, oklch(0.93 0.05 142) 50%, oklch(0.95 0.04 70) 100%)" }}>
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full blob-shape opacity-20" style={{ background: "oklch(0.65 0.15 142)" }} />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full blob-shape opacity-15" style={{ background: "oklch(0.65 0.12 70)", animationDelay: "3s" }} />

        <div className="max-w-7xl mx-auto relative z-10"
          style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(-16px)", transition: "opacity .7s ease, transform .7s ease" }}>
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-1.5 mb-5 text-sm font-medium text-primary">
            <Sparkles size={14} /> Premium Agricultural Products
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
            Our <span className="shimmer-text">Products</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl leading-relaxed mb-8">
            Quality agricultural essentials for every farming need — seeds, tools, fertilizers and more.
          </p>

          {/* Inline search bar right in hero */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary/20 rounded-2xl px-5 py-3 max-w-lg shadow-lg search-box">
            <Search size={20} className="text-muted-foreground flex-shrink-0" />
            <input
              placeholder="Search products, brands, categories..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-muted-foreground hover:text-foreground text-xs px-2 py-0.5 rounded-full bg-secondary">
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─── CATEGORY PILL FILTER ─── */}
      <section className="py-6 px-4 bg-background border-b border-border/50 sticky top-0 z-20 backdrop-blur-md"
        style={{ background: "rgba(255,255,255,0.92)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 flex-wrap items-center">
            <SlidersHorizontal size={16} className="text-muted-foreground mr-1" />
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.value
              return (
                <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
                  className={`cat-pill flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md cat-pill-active"
                    : "bg-white border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}>
                  <span>{cat.emoji}</span> {cat.label}
                </button>
              )
            })}
            {/* Price range filter */}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium hidden sm:block">₹ Range:</span>
              <input
                type="number" placeholder="Min" value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-20 px-2 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <span className="text-muted-foreground text-xs">–</span>
              <input
                type="number" placeholder="Max" value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-20 px-2 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
              {(minPrice || maxPrice) && (
                <button onClick={() => { setMinPrice(""); setMaxPrice("") }}
                  className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-full bg-secondary/60">
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS GRID ─── */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Active category label */}
          {activeCat && (
            <Reveal>
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[selectedCategory]} flex items-center justify-center text-xl shadow-sm`}>
                  {activeCat.emoji}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold">{activeCat.label}</h2>
                  <p className="text-sm text-muted-foreground">Showing all {activeCat.label.toLowerCase()} products</p>
                </div>
              </div>
            </Reveal>
          )}

          {loading ? (
            /* Skeleton */
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white border border-border">
                  <div className="h-52 bg-gradient-to-br from-secondary/40 to-secondary/20 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-secondary/40 rounded-full animate-pulse w-2/3" />
                    <div className="h-5 bg-secondary/50 rounded-full animate-pulse" />
                    <div className="h-3 bg-secondary/30 rounded-full animate-pulse" />
                    <div className="h-3 bg-secondary/30 rounded-full animate-pulse w-3/4" />
                    <div className="flex gap-2 mt-4">
                      <div className="h-7 bg-secondary/50 rounded-full animate-pulse w-1/3" />
                      <div className="h-7 bg-secondary/30 rounded-full animate-pulse w-1/4 ml-auto" />
                    </div>
                    <div className="h-10 bg-secondary/40 rounded-xl animate-pulse mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, i) => {
                const pct = product.discountPrice ? getDiscountPct(product.price, product.discountPrice) : 0
                const catColor = CATEGORY_COLORS[product.category] || "from-green-400 to-emerald-600"
                const isAdded = addedIds.has(product._id)

                return (
                  <Link key={product._id} href={`/products/${product._id}`}
                    className={`product-card rounded-2xl overflow-hidden bg-white block ${visible ? "product-card-animate" : "opacity-0"}`}
                    style={{ animationDelay: `${i * 70}ms` }}>

                    {/* Image area */}
                    <div className="relative h-52 bg-gradient-to-br from-secondary/20 to-secondary/10 overflow-hidden flex items-center justify-center">
                      {product.images?.[0] ? (
                        <img src={product.images[0].url} alt={product.images[0].alt || product.name}
                          className="product-img w-full h-full object-cover" />
                      ) : (
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${catColor} flex items-center justify-center text-4xl shadow-lg`}>
                          {getCategoryEmoji(product.category)}
                        </div>
                      )}

                      {/* Top badges */}
                      {pct > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                          -{pct}%
                        </div>
                      )}
                      <div className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full shadow ${product.stock > 0 ? "bg-green-500 text-white stock-pulse" : "bg-red-100 text-red-700"}`}>
                        {product.stock > 0 ? "In Stock" : "Out"}
                      </div>

                      {/* Wishlist heart */}
                      <button onClick={(e) => toggleWishlist(e, product._id)}
                        className="absolute bottom-10 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow transition hover:scale-110"
                        title={wishlistIds.has(product._id) ? "Remove from wishlist" : "Save to wishlist"}>
                        <Heart size={14} className={wishlistIds.has(product._id) ? "fill-red-500 text-red-500" : "text-muted-foreground"} />
                      </button>

                      {/* Category chip at bottom of image */}
                      <div className="absolute bottom-0 left-0 right-0 px-3 py-2"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)" }}>
                        <span className="text-white text-xs font-semibold">{getCategoryLabel(product.category)}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-base mb-1 leading-tight line-clamp-1">{product.name}</h3>
                      {product.brand && <p className="text-xs text-muted-foreground mb-1">by {product.brand}</p>}
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{product.description}</p>

                      {/* Ratings */}
                      {product.ratings && product.ratings.count > 0 && (
                        <div className="flex items-center gap-1 mb-3">
                          <div className="flex">
                            {[...Array(5)].map((_, s) => (
                              <Star key={s} size={11} className={s < Math.round(product.ratings!.average) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">({product.ratings.count})</span>
                        </div>
                      )}

                      {/* Price row */}
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-extrabold text-primary">
                          ₹{product.discountPrice ?? product.price}
                        </span>
                        {product.discountPrice && (
                          <span className="text-sm text-muted-foreground line-through">₹{product.price}</span>
                        )}
                      </div>

                      {/* Add to cart — stop propagation so click doesn't navigate */}
                      <button
                        className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 add-btn ${isAdded ? "add-btn-added text-white" : product.stock > 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground cursor-not-allowed"}`}
                        disabled={product.stock <= 0}
                        onClick={(e) => { e.preventDefault(); handleAddToCart(product) }}>
                        {isAdded ? (
                          <><Check size={15} className="animate-bounce" /> Added to Cart</>
                        ) : (
                          <><ShoppingCart size={15} /> {product.stock > 0 ? "Add to Cart" : "Out of Stock"}</>
                        )}
                      </button>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">Try a different search term or category</p>
              <button onClick={() => { setSearchTerm(""); setSelectedCategory(""); setMinPrice(""); setMaxPrice("") }}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:opacity-90 transition">
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10 flex-wrap">
              <button
                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                disabled={page <= 1}
                className="px-5 py-2.5 rounded-full border-2 border-border font-semibold text-sm transition hover:border-primary hover:text-primary disabled:opacity-40 bg-white">
                ← Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i + 1} onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                  className={`w-9 h-9 rounded-full text-sm font-bold transition ${page === i + 1 ? "bg-primary text-white shadow-md" : "bg-white border border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                disabled={page >= totalPages}
                className="px-5 py-2.5 rounded-full border-2 border-border font-semibold text-sm transition hover:border-primary hover:text-primary disabled:opacity-40 bg-white">
                Next →
              </button>
            </div>
          )}
          {!loading && totalCount > 0 && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, totalCount)} of {totalCount} products
            </p>
          )}
        </div>
      </section>

      <footer className="bg-foreground text-background py-10 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm opacity-60">
          <p>&copy; 2025 Agri Mart. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
