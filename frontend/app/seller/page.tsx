"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { Package, Wrench, TrendingUp, ShoppingBag, Loader2, ArrowLeft, Plus, Pencil, Trash2, X, Check } from "lucide-react"

const CATEGORIES = ["seeds-fertilizers", "tools-equipment", "pesticides-chemicals", "irrigation", "organic", "other"]

const EMPTY_FORM = { name: "", description: "", price: "", discountPrice: "", category: "seeds-fertilizers", brand: "", stock: "", imageUrl: "", tags: "" }

export default function SellerDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [products, setProducts] = useState<any[]>([])
  const [rentals, setRentals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [formMsg, setFormMsg] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "seller")) router.push("/login")
  }, [authLoading, isAuthenticated, user, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === "seller") fetchSellerData()
  }, [isAuthenticated, user])

  const fetchSellerData = async () => {
    try {
      const [productsRes, rentalsRes] = await Promise.all([api.get("/products"), api.get("/rentals/my")])
      setProducts(productsRes.data || []); setRentals(rentalsRes.data || [])
    } catch { } finally { setLoading(false) }
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setForm({ ...EMPTY_FORM })
    setFormMsg("")
    setShowModal(true)
  }

  const openEditModal = (product: any) => {
    setEditingProduct(product)
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      discountPrice: product.discountPrice?.toString() || "",
      category: product.category || "seeds-fertilizers",
      brand: product.brand || "",
      stock: product.stock?.toString() || "",
      imageUrl: product.images?.[0]?.url || "",
      tags: (product.tags || []).join(", "),
    })
    setFormMsg("")
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price || !form.stock) {
      setFormMsg("Please fill in all required fields.")
      return
    }
    try {
      setSaving(true)
      setFormMsg("")
      const payload: any = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        brand: form.brand,
        stock: Number(form.stock),
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      }
      if (form.discountPrice) payload.discountPrice = Number(form.discountPrice)
      if (form.imageUrl) payload.images = [{ url: form.imageUrl, alt: form.name }]

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload)
        setFormMsg("✅ Product updated!")
      } else {
        await api.post("/products", payload)
        setFormMsg("✅ Product added!")
      }
      await fetchSellerData()
      setTimeout(() => { setShowModal(false); setFormMsg("") }, 900)
    } catch (e: any) {
      setFormMsg(e?.response?.data?.message || "Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This action cannot be undone.")) return
    try {
      setDeletingId(id)
      await api.delete(`/products/${id}`)
      await fetchSellerData()
    } catch { } finally { setDeletingId(null) }
  }

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={36} />
    </div>
  )
  if (!isAuthenticated || user?.role !== "seller") return null

  const totalRevenue = products.reduce((sum, p) => sum + (p.price * (p.sold || 0)), 0)
  const totalSold = products.reduce((sum, p) => sum + (p.sold || 0), 0)

  const STAT_CARDS = [
    { title: "Active Products", value: products.length, icon: Package, color: "from-green-400 to-emerald-600" },
    { title: "Rental Listings", value: rentals.length, icon: Wrench, color: "from-amber-400 to-orange-500" },
    { title: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "from-blue-400 to-cyan-500" },
    { title: "Items Sold", value: totalSold, icon: ShoppingBag, color: "from-purple-400 to-violet-600" },
  ]

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 142)" }}>
      <style>{`
        .stat-card{transition:transform .2s ease,box-shadow .2s ease;}
        .stat-card:hover{transform:translateY(-4px);box-shadow:0 14px 32px rgba(34,197,94,.18);}
        .product-row{transition:transform .15s ease,background-color .15s ease;}
        .product-row:hover{background-color:oklch(0.94 0.03 142);transform:translateX(3px);}
        .tab-btn{transition:color .15s ease,border-color .15s ease;}
        @keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .modal-card{animation:modalIn .25s ease both;}
        .form-input{width:100%;padding:.6rem .85rem;border-radius:.75rem;border:1px solid oklch(0.88 0.02 142);font-size:.875rem;outline:none;transition:box-shadow .2s ease,border-color .2s ease;}
        .form-input:focus{box-shadow:0 0 0 3px rgba(34,197,94,.2);border-color:oklch(0.55 0.15 142);}
        .save-btn{transition:transform .15s ease,box-shadow .2s ease;}
        .save-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(34,197,94,.35);}
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, oklch(0.42 0.15 142), oklch(0.33 0.12 142))" }}>
        <div className="max-w-7xl mx-auto px-4 py-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-extrabold shadow-md">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold flex items-center gap-2">🏪 Seller Dashboard</h1>
              <p className="text-sm opacity-70 mt-0.5">{user?.name} · {user?.email}</p>
            </div>
          </div>
          <Link href="/"><Button variant="secondary" className="gap-2 rounded-full"><ArrowLeft size={16} /> Home</Button></Link>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {["overview", "products", "rentals"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`tab-btn py-3 px-5 text-sm font-semibold border-b-2 capitalize transition-all ${activeTab === tab ? "border-white text-white" : "border-transparent text-white/50 hover:text-white/80"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {STAT_CARDS.map((stat) => (
              <Card key={stat.title} className="stat-card border border-border overflow-hidden">
                <div className="p-6 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-3xl font-extrabold">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <Card className="border border-border">
            <CardHeader className="border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>{products.length} product(s) listed</CardDescription>
              </div>
              <Button onClick={openAddModal} className="gap-2 rounded-full" size="sm">
                <Plus size={16} /> Add Product
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📦</div>
                  <p className="text-muted-foreground mb-4">No products yet. Add your first product!</p>
                  <Button onClick={openAddModal} className="gap-2 rounded-full"><Plus size={15} /> Add Product</Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {products.map((product: any) => (
                    <div key={product._id} className="product-row flex items-center justify-between px-6 py-4 gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary/30 flex-shrink-0">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{product.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{product.category?.replace(/-/g, " ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right flex-shrink-0">
                        <div>
                          <p className="font-bold text-primary">₹{product.price}</p>
                          <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${product.stock > 0 ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                          {product.stock > 0 ? "In Stock" : "Out"}
                        </span>
                        {/* Edit + Delete */}
                        <button onClick={() => openEditModal(product)}
                          className="p-2 rounded-xl hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(product._id)}
                          disabled={deletingId === product._id}
                          className="p-2 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-600 transition" title="Delete">
                          {deletingId === product._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Rentals Tab */}
        {activeTab === "rentals" && (
          <Card className="border border-border">
            <CardHeader className="border-b border-border"><CardTitle>Your Rental Listings</CardTitle><CardDescription>{rentals.length} rental(s)</CardDescription></CardHeader>
            <CardContent className="p-0">
              {rentals.length === 0 ? (
                <div className="text-center py-12"><div className="text-5xl mb-4">🚜</div><p className="text-muted-foreground">No rental listings yet.</p></div>
              ) : (
                <div className="divide-y divide-border">
                  {rentals.map((rental: any) => (
                    <div key={rental._id} className="product-row flex items-center justify-between px-6 py-4 gap-4">
                      <div className="flex-1">
                        <p className="font-semibold">{rental.name}</p>
                        <p className="text-sm text-muted-foreground">{rental.location} · {rental.category?.replace(/-/g, " ")}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-primary">₹{rental.pricePerDay}<span className="text-xs text-muted-foreground font-normal">/day</span></p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${rental.availability === "available" ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}>
                          {rental.availability}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── ADD / EDIT PRODUCT MODAL ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="modal-card bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-extrabold">{editingProduct ? "✏️ Edit Product" : "➕ Add New Product"}</h2>
                <p className="text-sm text-muted-foreground">{editingProduct ? "Update the product details below" : "Fill in the details to list a new product"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-secondary transition"><X size={20} /></button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Product Name *</label>
                <input className="form-input" placeholder="e.g. Premium Hybrid Seeds" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Description *</label>
                <textarea className="form-input resize-none" rows={3} placeholder="Describe your product..."
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              {/* Category + Brand */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Category *</label>
                  <select className="form-input bg-white" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/-/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Brand</label>
                  <input className="form-input" placeholder="e.g. AgriGold" value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                </div>
              </div>

              {/* Price + Discount + Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Price (₹) *</label>
                  <input className="form-input" type="number" min="0" placeholder="450" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Discount ₹</label>
                  <input className="form-input" type="number" min="0" placeholder="399" value={form.discountPrice}
                    onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Stock *</label>
                  <input className="form-input" type="number" min="0" placeholder="100" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Image URL</label>
                <input className="form-input" placeholder="/hybrid-seeds.jpg or https://..." value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Tags <span className="font-normal normal-case">(comma-separated)</span></label>
                <input className="form-input" placeholder="seeds, organic, hybrid" value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>

              {/* Message */}
              {formMsg && (
                <div className={`text-sm px-4 py-3 rounded-xl ${formMsg.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {formMsg}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 save-btn disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, oklch(0.45 0.15 142), oklch(0.35 0.12 142))" }}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : formMsg.startsWith("✅") ? <Check size={16} /> : editingProduct ? <Pencil size={16} /> : <Plus size={16} />}
                  {saving ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                </button>
                <button onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl border-2 border-border font-semibold text-sm hover:border-primary hover:text-primary transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
