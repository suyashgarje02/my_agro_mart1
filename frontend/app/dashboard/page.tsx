"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { Navigation } from "@/components/navigation"
import { ShoppingBag, TrendingUp, Clock, Package, Loader2, ChevronDown, ChevronUp, X } from "lucide-react"

interface OrderItem { product: any; quantity: number; price: number; name: string; image?: string }
interface Order {
  _id: string; items: OrderItem[]; totalAmount: number; orderStatus: string; createdAt: string
  shippingAddress?: any; trackingNumber?: string; estimatedDelivery?: string; deliveredAt?: string
  statusHistory?: { status: string; timestamp: string; note?: string }[]
  itemsTotal?: number; shippingCharges?: number; tax?: number
}

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"]
const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed", confirmed: "Confirmed", processing: "Processing",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
}
const STATUS_ICONS: Record<string, string> = {
  pending: "📋", confirmed: "✅", processing: "⚙️", shipped: "🚚", delivered: "📦", cancelled: "❌",
}

function getStatusColor(status: string) {
  switch (status) {
    case "delivered": return "bg-green-100 text-green-800 border-green-200"
    case "shipped": return "bg-blue-100 text-blue-800 border-blue-200"
    case "confirmed": return "bg-purple-100 text-purple-800 border-purple-200"
    case "processing": return "bg-amber-100 text-amber-800 border-amber-200"
    case "cancelled": return "bg-red-100 text-red-800 border-red-200"
    default: return "bg-yellow-100 text-yellow-800 border-yellow-200"
  }
}

function StatusTracker({ order }: { order: Order }) {
  if (order.orderStatus === "cancelled") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
        <span className="text-2xl">❌</span>
        <div>
          <p className="font-bold text-red-800">Order Cancelled</p>
          {order.statusHistory?.find(h => h.status === "cancelled")?.note && (
            <p className="text-sm text-red-600">{order.statusHistory.find(h => h.status === "cancelled")?.note}</p>
          )}
        </div>
      </div>
    )
  }

  const currentIdx = STATUS_STEPS.indexOf(order.orderStatus)

  return (
    <div className="py-4">
      {/* Desktop stepper */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* connector line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-border z-0" />
        <div className="absolute top-5 left-5 h-0.5 bg-primary z-0 transition-all duration-700"
          style={{ width: currentIdx >= 0 ? `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` : "0%" }} />

        {STATUS_STEPS.map((step, idx) => {
          const done = idx <= currentIdx
          const active = idx === currentIdx
          return (
            <div key={step} className="flex flex-col items-center gap-2 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${done ? "bg-primary shadow-md scale-110" : "bg-white border-2 border-border"}`}>
                {done ? <span className="text-white text-sm">{STATUS_ICONS[step]}</span>
                  : <span className="text-muted-foreground text-xs">{idx + 1}</span>}
              </div>
              <p className={`text-xs font-semibold text-center max-w-[64px] leading-tight ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                {STATUS_LABELS[step]}
              </p>
            </div>
          )
        })}
      </div>

      {/* Mobile: compact */}
      <div className="sm:hidden flex items-center gap-2 overflow-x-auto pb-1">
        {STATUS_STEPS.map((step, idx) => {
          const done = idx <= currentIdx
          return (
            <div key={step} className={`flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1.5 rounded-full text-xs font-semibold ${done ? "bg-primary text-white" : "bg-secondary/60 text-muted-foreground"}`}>
              {STATUS_ICONS[step]} {STATUS_LABELS[step]}
            </div>
          )
        })}
      </div>

      {/* Tracking info */}
      {order.trackingNumber && (
        <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-sm">
          <span className="text-lg">🚚</span>
          <div><p className="font-semibold text-blue-800">Tracking # {order.trackingNumber}</p>
            {order.estimatedDelivery && <p className="text-blue-600 text-xs">Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

function OrderRow({ order, onCancel }: { order: Order; onCancel: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const canCancel = !["shipped", "delivered", "cancelled"].includes(order.orderStatus)

  const handleCancel = async () => {
    if (!confirm("Cancel this order?")) return
    setCancelling(true)
    await onCancel(order._id)
    setCancelling(false)
  }

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-white transition-shadow hover:shadow-md">
      {/* Row header */}
      <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/20 transition text-left"
        onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "oklch(0.93 0.04 142)" }}>
            {STATUS_ICONS[order.orderStatus] || "📦"}
          </div>
          <div>
            <p className="font-bold text-sm">Order #{order._id.slice(-6).toUpperCase()}</p>
            <p className="text-xs text-muted-foreground">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-extrabold text-primary">₹{order.totalAmount?.toLocaleString()}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${getStatusColor(order.orderStatus)}`}>
            {order.orderStatus}
          </span>
          {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border px-5 py-5 space-y-5">
          {/* Status tracker */}
          <StatusTracker order={order} />

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Items Ordered</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20">
                  {item.product?.images?.[0]?.url || item.image ? (
                    <img src={item.product?.images?.[0]?.url || item.image} alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg flex-shrink-0">🌿</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.name || item.product?.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-sm text-primary flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals summary */}
          <div className="p-4 rounded-xl bg-secondary/20 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Items Total</span><span>₹{order.itemsTotal?.toLocaleString() ?? "—"}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className={order.shippingCharges === 0 ? "text-green-600 font-medium" : ""}>{order.shippingCharges === 0 ? "FREE" : `₹${order.shippingCharges}`}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>GST (18%)</span><span>₹{order.tax?.toLocaleString() ?? "—"}</span></div>
            <div className="flex justify-between font-extrabold text-base pt-1.5 border-t border-border"><span>Grand Total</span><span className="text-primary">₹{order.totalAmount?.toLocaleString()}</span></div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Deliver To</p>
              <p>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.zipCode}</p>
            </div>
          )}

          {/* Actions */}
          {canCancel && (
            <div className="flex gap-2 pt-1">
              <button onClick={handleCancel} disabled={cancelling}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition disabled:opacity-60">
                {cancelling ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                Cancel Order
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (!authLoading && !isAuthenticated) router.push("/login") }, [authLoading, isAuthenticated, router])
  useEffect(() => { if (isAuthenticated) fetchOrders() }, [isAuthenticated])

  const fetchOrders = async () => {
    try { const res = await api.get("/orders"); setOrders(res.data || []) }
    catch { } finally { setLoading(false) }
  }

  const handleCancel = async (orderId: string) => {
    try {
      await api.put(`/orders/${orderId}/cancel`, {})
      await fetchOrders()
    } catch { }
  }

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={36} />
    </div>
  )
  if (!isAuthenticated) return null

  const TABS = ["overview", "orders", "profile"]
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.orderStatus)).length
  const totalSpent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0)

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 142)" }}>
      <style>{`
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .shimmer-text{background:linear-gradient(90deg,oklch(0.45 0.15 142) 0%,#6ee7b7 40%,oklch(0.45 0.15 142) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite;}
        .stat-card{transition:transform .2s ease,box-shadow .2s ease;}
        .stat-card:hover{transform:translateY(-4px);box-shadow:0 14px 32px rgba(34,197,94,.18);}
        .tab-btn{transition:color .15s ease,border-color .15s ease;}
      `}</style>

      <Navigation />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, oklch(0.45 0.15 142), oklch(0.35 0.12 142))" }}>
        <div className="max-w-7xl mx-auto px-4 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-extrabold shadow-md">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">Welcome, <span className="opacity-90">{user?.name}</span> 👋</h1>
              <p className="text-sm opacity-70 mt-0.5 capitalize">{user?.role} · {user?.email}</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {TABS.map((tab) => (
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: "Total Orders", value: orders.length, icon: ShoppingBag, color: "from-green-400 to-emerald-600" },
                { title: "Total Spent", value: `₹${totalSpent.toLocaleString()}`, icon: TrendingUp, color: "from-amber-400 to-orange-500" },
                { title: "Active Orders", value: activeOrders, icon: Clock, color: "from-blue-400 to-cyan-500" },
              ].map((stat) => (
                <Card key={stat.title} className="stat-card border border-border overflow-hidden">
                  <div className="p-6 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                      <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Recent Orders preview */}
            <Card className="border border-border">
              <CardHeader className="border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Package size={20} className="text-primary" /> Recent Orders</CardTitle>
                {orders.length > 5 && <button onClick={() => setActiveTab("orders")} className="text-xs text-primary underline underline-offset-2">View All</button>}
              </CardHeader>
              <CardContent className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">🛒</div>
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Button asChild className="rounded-full px-6"><Link href="/products">Browse Products</Link></Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <OrderRow key={order._id} order={order} onCancel={handleCancel} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* All Orders */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold">All Orders <span className="text-muted-foreground font-normal text-base ml-1">({orders.length})</span></h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-muted-foreground mb-6">No orders yet</p>
                <Button asChild className="rounded-full px-8"><Link href="/products">Start Shopping</Link></Button>
              </div>
            ) : (
              orders.map((order) => (
                <OrderRow key={order._id} order={order} onCancel={handleCancel} />
              ))
            )}
          </div>
        )}

        {/* Profile */}
        {activeTab === "profile" && (
          <Card className="border border-border max-w-lg">
            <CardHeader className="border-b border-border"><CardTitle>My Profile</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-5 mb-8 p-5 rounded-2xl" style={{ background: "linear-gradient(135deg, oklch(0.45 0.15 142), oklch(0.35 0.12 142))" }}>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-extrabold text-white shadow">{user?.name?.[0]?.toUpperCase()}</div>
                <div className="text-white">
                  <h3 className="text-xl font-extrabold">{user?.name}</h3>
                  <p className="opacity-80 text-sm capitalize">{user?.role}</p>
                </div>
              </div>
              <div className="space-y-4">
                {[["Email", user?.email], ["Role", user?.role], ["User Type", user?.userType], ["Phone", user?.phone]].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label as string} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background">
                    <p className="text-sm text-muted-foreground font-medium w-24">{label}</p>
                    <p className="font-semibold capitalize">{value as string}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
