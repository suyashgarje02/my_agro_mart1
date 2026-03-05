"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { TrendingUp, ShoppingBag, Users, Package, Loader2, ArrowLeft, ShieldCheck, Check, X } from "lucide-react"

export default function AdminDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [users, setUsers] = useState<any[]>([])
  const [sellers, setSellers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, activeUsers: 0, activeProducts: 0 })
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [orderEdits, setOrderEdits] = useState<Record<string, { status: string; tracking: string }>>({})
  const [sellerActionId, setSellerActionId] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) router.push("/login")
  }, [authLoading, isAuthenticated, user, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") fetchAllData()
  }, [isAuthenticated, user])

  const fetchAllData = async () => {
    try {
      const [usersRes, productsRes, ordersRes, sellersRes] = await Promise.all([
        api.get("/users"), api.get("/products"), api.get("/orders/admin/all"), api.get("/users/sellers"),
      ])
      const usersData = usersRes.data || []
      const productsData = productsRes.data || []
      const ordersData = ordersRes.data || []
      const sellersData = sellersRes.data || []
      setUsers(usersData); setProducts(productsData); setOrders(ordersData); setSellers(sellersData)
      const edits: Record<string, { status: string; tracking: string }> = {}
      ordersData.forEach((o: any) => { edits[o._id] = { status: o.orderStatus, tracking: o.trackingNumber || "" } })
      setOrderEdits(edits)
      setStats({ totalRevenue: ordersData.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0), totalOrders: ordersData.length, activeUsers: usersData.length, activeProducts: productsData.length })
    } catch { } finally { setLoading(false) }
  }

  const handleUpdateOrderStatus = async (orderId: string) => {
    const edit = orderEdits[orderId]
    if (!edit) return
    try {
      setUpdatingOrderId(orderId)
      await api.put(`/orders/${orderId}/status`, { orderStatus: edit.status, trackingNumber: edit.tracking || undefined })
      await fetchAllData()
    } catch { } finally { setUpdatingOrderId(null) }
  }

  const handleSellerStatus = async (sellerId: string, status: "approved" | "rejected") => {
    setSellerActionId(sellerId)
    try {
      await api.put(`/users/${sellerId}/seller-status`, { sellerStatus: status, sellerNote: rejectNotes[sellerId] || "" })
      await fetchAllData()
    } catch { } finally { setSellerActionId(null) }
  }

  const handleToggleBlock = async (userId: string) => {
    try { await api.put(`/users/${userId}/block`, {}); await fetchAllData() } catch { }
  }

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={36} />
    </div>
  )
  if (!isAuthenticated || user?.role !== "admin") return null

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-800 border-green-200"
      case "shipped": return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled": return "bg-red-100 text-red-800 border-red-200"
      case "approved": return "bg-green-100 text-green-800 border-green-200"
      case "rejected": return "bg-red-100 text-red-800 border-red-200"
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const pendingSellers = sellers.filter(s => s.sellerStatus === "pending").length

  const STAT_CARDS = [
    { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "from-green-400 to-emerald-600" },
    { title: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "from-amber-400 to-orange-500" },
    { title: "Users", value: stats.activeUsers, icon: Users, color: "from-blue-400 to-cyan-500" },
    { title: "Products", value: stats.activeProducts, icon: Package, color: "from-purple-400 to-violet-600" },
  ]

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 142)" }}>
      <style>{`
        .stat-card{transition:transform .2s ease,box-shadow .2s ease;}
        .stat-card:hover{transform:translateY(-4px);box-shadow:0 14px 32px rgba(34,197,94,.18);}
        .data-row{transition:transform .15s ease,background-color .15s ease;}
        .data-row:hover{background-color:oklch(0.94 0.03 142);}
        .tab-btn{transition:color .15s ease,border-color .15s ease;}
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, oklch(0.35 0.13 142), oklch(0.25 0.1 142))" }}>
        <div className="max-w-7xl mx-auto px-4 py-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">⚙️ Admin Dashboard</h1>
              <p className="text-sm opacity-70 mt-0.5">Manage products, users, and orders · {user?.name}</p>
            </div>
          </div>
          <Link href="/"><Button variant="secondary" className="gap-2 rounded-full"><ArrowLeft size={16} /> Home</Button></Link>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {["overview", "sellers", "users", "products", "orders"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`tab-btn py-3 px-5 text-sm font-semibold border-b-2 capitalize transition-all relative ${activeTab === tab ? "border-white text-white" : "border-transparent text-white/50 hover:text-white/80"}`}>
              {tab}
              {tab === "sellers" && pendingSellers > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center">{pendingSellers}</span>
              )}
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

        {/* ── SELLERS TAB ── */}
        {activeTab === "sellers" && (
          <Card className="border border-border">
            <CardHeader className="border-b border-border">
              <CardTitle>Seller Management</CardTitle>
              <CardDescription>{sellers.length} seller(s) · <span className="text-yellow-700 font-semibold">{pendingSellers} pending approval</span></CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {sellers.length === 0 ? (
                <div className="text-center py-12"><div className="text-5xl mb-4">🏪</div><p className="text-muted-foreground">No sellers yet</p></div>
              ) : (
                <div className="divide-y divide-border">
                  {sellers.map((seller: any) => {
                    const isActioning = sellerActionId === seller._id
                    const isPending = seller.sellerStatus === "pending"
                    return (
                      <div key={seller._id} className="data-row px-6 py-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary text-lg font-extrabold text-primary flex-shrink-0">
                              {seller.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold">{seller.name}</p>
                              <p className="text-sm text-muted-foreground">{seller.email} · {seller.phone || "No phone"}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 capitalize">{seller.userType} · {seller.location || "—"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor(seller.sellerStatus)}`}>
                              {seller.sellerStatus}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${seller.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                              {seller.isActive ? "Active" : "Blocked"}
                            </span>
                            {isPending && (
                              <>
                                <button onClick={() => handleSellerStatus(seller._id, "approved")} disabled={isActioning}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition disabled:opacity-60">
                                  {isActioning ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Approve
                                </button>
                                <button onClick={() => handleSellerStatus(seller._id, "rejected")} disabled={isActioning}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition disabled:opacity-60">
                                  {isActioning ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />} Reject
                                </button>
                              </>
                            )}
                            {!isPending && (
                              <button onClick={() => handleToggleBlock(seller._id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${seller.isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                                {seller.isActive ? "Block" : "Unblock"}
                              </button>
                            )}
                          </div>
                        </div>
                        {isPending && (
                          <div className="mt-3 flex gap-2">
                            <input
                              placeholder="Rejection reason (optional)"
                              value={rejectNotes[seller._id] || ""}
                              onChange={(e) => setRejectNotes(prev => ({ ...prev, [seller._id]: e.target.value }))}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <Card className="border border-border">
            <CardHeader className="border-b border-border"><CardTitle>User Management</CardTitle><CardDescription>{users.length} registered user(s)</CardDescription></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left py-3 px-6 font-semibold text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-6 font-semibold text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-6 font-semibold text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-6 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-6 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u: any) => (
                    <tr key={u._id} className="data-row">
                      <td className="py-3 px-6 font-medium">{u.name}</td>
                      <td className="py-3 px-6 text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-6"><span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-xs font-semibold capitalize">{u.role}</span></td>
                      <td className="py-3 px-6"><span className={`px-3 py-1 rounded-full text-xs font-semibold border ${u.isActive !== false ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>{u.isActive !== false ? "Active" : "Blocked"}</span></td>
                      <td className="py-3 px-6">
                        <button onClick={() => handleToggleBlock(u._id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${u.isActive !== false ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                          {u.isActive !== false ? "Block" : "Unblock"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Products */}
        {activeTab === "products" && (
          <Card className="border border-border">
            <CardHeader className="border-b border-border"><CardTitle>Product Management</CardTitle><CardDescription>{products.length} product(s) on platform</CardDescription></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left py-3 px-6 font-semibold text-muted-foreground">Product Name</th>
                    <th className="text-left py-3 px-6 font-semibold text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-6 font-semibold text-muted-foreground">Price</th>
                    <th className="text-left py-3 px-6 font-semibold text-muted-foreground">Stock</th>
                    <th className="text-left py-3 px-6 font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p: any) => (
                    <tr key={p._id} className="data-row">
                      <td className="py-3 px-6 font-semibold">{p.name}</td>
                      <td className="py-3 px-6 capitalize text-muted-foreground">{p.category?.replace(/-/g, " ")}</td>
                      <td className="py-3 px-6 font-bold text-primary">₹{p.price}</td>
                      <td className="py-3 px-6">{p.stock}</td>
                      <td className="py-3 px-6"><span className={`px-3 py-1 rounded-full text-xs font-semibold border ${p.stock > 0 ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}>{p.stock > 0 ? "Active" : "Out of Stock"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <Card className="border border-border">
            <CardHeader className="border-b border-border"><CardTitle>Order Management</CardTitle><CardDescription>{orders.length} order(s) total</CardDescription></CardHeader>
            <CardContent className="p-0">
              {orders.length === 0 ? (
                <div className="text-center py-12"><div className="text-5xl mb-4">📋</div><p className="text-muted-foreground">No orders yet</p></div>
              ) : (
                <div className="divide-y divide-border">
                  {orders.map((order: any) => {
                    const edit = orderEdits[order._id] || { status: order.orderStatus, tracking: order.trackingNumber || "" }
                    const isUpdating = updatingOrderId === order._id
                    const changed = edit.status !== order.orderStatus || edit.tracking !== (order.trackingNumber || "")
                    return (
                      <div key={order._id} className="data-row px-6 py-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <p className="font-semibold">Order #{order._id.slice(-6).toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">{order.user?.name || "Unknown"} · {new Date(order.createdAt).toLocaleDateString("en-IN")} · ₹{order.totalAmount}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              value={edit.status}
                              onChange={(e) => setOrderEdits(prev => ({ ...prev, [order._id]: { ...edit, status: e.target.value } }))}
                              className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 capitalize">
                              {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                            <input
                              placeholder="Tracking #"
                              value={edit.tracking}
                              onChange={(e) => setOrderEdits(prev => ({ ...prev, [order._id]: { ...edit, tracking: e.target.value } }))}
                              className="px-3 py-1.5 rounded-lg border border-border text-xs w-32 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            <button
                              onClick={() => handleUpdateOrderStatus(order._id)}
                              disabled={isUpdating || !changed}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1 disabled:opacity-40 transition hover:opacity-90"
                              style={{ backgroundColor: changed ? "oklch(0.45 0.15 142)" : "oklch(0.85 0.02 142)" }}>
                              {isUpdating ? <Loader2 size={12} className="animate-spin" /> : "✓"} Update
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
