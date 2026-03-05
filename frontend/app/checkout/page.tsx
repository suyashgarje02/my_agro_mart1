"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { ShoppingBag, MapPin, CreditCard, CheckCircle, Loader2, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"

declare global {
    interface Window {
        Razorpay: any
    }
}

type Step = "address" | "review" | "payment" | "success"

export default function CheckoutPage() {
    const { items, totalPrice, clearCart, removeItem } = useCart()
    const { user, isAuthenticated, loading: authLoading } = useAuth()
    const router = useRouter()

    const [step, setStep] = useState<Step>("address")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [orderId, setOrderId] = useState("")

    const [address, setAddress] = useState({
        street: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        country: "India",
    })

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [authLoading, isAuthenticated, router])

    // Redirect if cart empty (but not after success)
    useEffect(() => {
        if (!authLoading && isAuthenticated && items.length === 0 && step !== "success") {
            router.push("/products")
        }
    }, [items, authLoading, isAuthenticated, step, router])

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        document.head.appendChild(script)
        return () => {
            document.head.removeChild(script)
        }
    }, [])

    // Separate product items (only products go through order API; rentals are handled separately)
    const productItems = items.filter((i) => i.type === "product")
    const rentalItems = items.filter((i) => i.type === "rental")

    const productTotal = productItems.reduce((s, i) => s + i.price * i.quantity, 0)
    const rentalTotal = rentalItems.reduce((s, i) => s + (i.pricePerDay || i.price) * (i.days || 1), 0)
    const shippingCharges = productTotal > 500 ? 0 : productTotal > 0 ? 50 : 0
    const tax = Math.round(productTotal * 0.18)
    const grandTotal = productTotal + rentalTotal + shippingCharges + tax

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!address.street || !address.city || !address.state || !address.pincode || !address.phone) {
            setError("Please fill all address fields")
            return
        }
        setError("")
        setStep("review")
    }

    const handlePlaceOrder = async () => {
        setLoading(true)
        setError("")

        try {
            // Create order on backend (for product items)
            const orderPayload = {
                items: productItems.map((item) => ({
                    product: item.id,
                    quantity: item.quantity,
                })),
                shippingAddress: {
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    zipCode: address.pincode,
                    phone: address.phone,
                    country: address.country,
                },
                notes: rentalItems.length > 0
                    ? `Also booking rentals: ${rentalItems.map((r) => `${r.name} (${r.days}d)`).join(", ")}`
                    : undefined,
            }

            const res = await api.post("/orders", orderPayload)
            const { order, razorpayOrder, key } = res.data

            setOrderId(order._id)

            // Open Razorpay checkout
            const options = {
                key: key,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "Agri Mart",
                description: `Order #${order._id.slice(-6).toUpperCase()}`,
                order_id: razorpayOrder.id,
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                    contact: user?.phone || "",
                },
                theme: {
                    color: "#16a34a",
                },
                handler: async (response: any) => {
                    // Verify payment
                    try {
                        await api.post("/payments/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: order._id,
                        })
                        clearCart()
                        setStep("success")
                    } catch (verifyErr: any) {
                        setError("Payment verification failed. Please contact support.")
                    }
                    setLoading(false)
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false)
                        setError("Payment was cancelled. You can try again.")
                    },
                },
            }

            const rzp = new window.Razorpay(options)
            rzp.on("payment.failed", (response: any) => {
                setLoading(false)
                setError(`Payment failed: ${response.error.description}`)
            })
            rzp.open()
        } catch (err: any) {
            setLoading(false)
            setError(err.message || "Failed to create order. Please try again.")
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        )
    }

    if (!isAuthenticated) return null

    return (
        <main className="min-h-screen" style={{ background: "oklch(0.97 0.01 142)" }}>
            <style>{`
                .step-active{background:linear-gradient(135deg,oklch(0.45 0.15 142),oklch(0.38 0.12 142));color:white;box-shadow:0 4px 16px rgba(34,197,94,.35);}
                .step-done{background:linear-gradient(135deg,oklch(0.55 0.15 142),oklch(0.45 0.15 142));color:white;}
                .step-inactive{background:oklch(0.92 0.02 142);color:oklch(0.5 0.05 142);}
                .checkout-card{transition:box-shadow .2s ease;}
                .checkout-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.08);}
                @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
            `}</style>
            <Navigation />

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Step Indicator */}
                {step !== "success" && (
                    <div className="flex items-center justify-center gap-2 mb-10">
                        {[
                            { key: "address", label: "Address", icon: MapPin },
                            { key: "review", label: "Review", icon: ShoppingBag },
                            { key: "payment", label: "Payment", icon: CreditCard },
                        ].map((s, i) => {
                            const stepOrder = ["address", "review", "payment"]
                            const currentIdx = stepOrder.indexOf(step)
                            const thisIdx = stepOrder.indexOf(s.key)
                            const isActive = thisIdx === currentIdx
                            const isDone = thisIdx < currentIdx

                            return (
                                <div key={s.key} className="flex items-center gap-2">
                                    {i > 0 && (
                                        <div className={`w-8 sm:w-16 h-0.5 ${isDone ? "bg-primary" : "bg-border"}`} />
                                    )}
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isDone ? "step-done" : isActive ? "step-active" : "step-inactive"}`}
                                        >
                                            {isDone ? <CheckCircle size={16} /> : i + 1}
                                        </div>
                                        <span className={`text-sm font-medium hidden sm:inline ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                                            {s.label}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg text-sm mb-6 max-w-2xl mx-auto">
                        {error}
                    </div>
                )}

                {/* STEP 1: Address */}
                {step === "address" && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <MapPin size={20} className="text-primary" />
                                    Shipping Address
                                </h2>
                                <form onSubmit={handleAddressSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Street Address</label>
                                        <Input
                                            value={address.street}
                                            onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                            placeholder="House No., Street, Landmark"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">City</label>
                                            <Input
                                                value={address.city}
                                                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                                placeholder="City"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">State</label>
                                            <Input
                                                value={address.state}
                                                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                                placeholder="State"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Pincode</label>
                                            <Input
                                                value={address.pincode}
                                                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                                                placeholder="6-digit pincode"
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Phone</label>
                                            <Input
                                                value={address.phone}
                                                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                                placeholder="10-digit phone number"
                                                maxLength={10}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Country</label>
                                        <Input value={address.country} disabled className="bg-muted" />
                                    </div>
                                    <Button type="submit" size="lg" className="w-full mt-4">
                                        Continue to Review
                                    </Button>
                                </form>
                            </Card>
                        </div>

                        {/* Order Summary Sidebar */}
                        <OrderSummary
                            productItems={productItems}
                            rentalItems={rentalItems}
                            productTotal={productTotal}
                            rentalTotal={rentalTotal}
                            shippingCharges={shippingCharges}
                            tax={tax}
                            grandTotal={grandTotal}
                        />
                    </div>
                )}

                {/* STEP 2: Review */}
                {step === "review" && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Address Card */}
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <MapPin size={18} className="text-primary" />
                                        Delivering To
                                    </h2>
                                    <Button variant="outline" size="sm" onClick={() => setStep("address")}>
                                        Change
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {address.street}, {address.city}, {address.state} — {address.pincode}, {address.country}
                                </p>
                            </Card>

                            {/* Items Card */}
                            <Card className="p-6">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <ShoppingBag size={18} className="text-primary" />
                                    Order Items ({items.length})
                                </h2>
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-xl">
                                            <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <span className="text-xl">{item.type === "rental" ? "🚜" : "🌾"}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-sm truncate">{item.name}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.type === "rental"
                                                        ? `₹${item.pricePerDay || item.price}/day × ${item.days || 1} day(s)`
                                                        : `₹${item.price} × ${item.quantity}`}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-bold text-primary">
                                                    ₹{item.type === "rental"
                                                        ? ((item.pricePerDay || item.price) * (item.days || 1)).toLocaleString()
                                                        : (item.price * item.quantity).toLocaleString()}
                                                </p>
                                                <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <div className="flex gap-4">
                                <Button variant="outline" className="gap-2" onClick={() => setStep("address")}>
                                    <ArrowLeft size={16} /> Back
                                </Button>
                                <Button className="flex-1 gap-2" size="lg" onClick={() => { setStep("payment"); handlePlaceOrder() }} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                                    {loading ? "Processing..." : `Pay ₹${grandTotal.toLocaleString()}`}
                                </Button>
                            </div>
                        </div>

                        <OrderSummary
                            productItems={productItems}
                            rentalItems={rentalItems}
                            productTotal={productTotal}
                            rentalTotal={rentalTotal}
                            shippingCharges={shippingCharges}
                            tax={tax}
                            grandTotal={grandTotal}
                        />
                    </div>
                )}

                {/* STEP 3: Payment (loading state while Razorpay is open) */}
                {step === "payment" && (
                    <div className="max-w-md mx-auto text-center py-16">
                        <Card className="p-12">
                            <Loader2 className="animate-spin mx-auto text-primary mb-6" size={48} />
                            <h2 className="text-xl font-bold mb-2">Processing Payment</h2>
                            <p className="text-muted-foreground">
                                Complete your payment in the Razorpay checkout window.
                            </p>
                            <p className="text-sm text-muted-foreground mt-4">
                                Don't close this page.
                            </p>
                        </Card>
                    </div>
                )}

                {/* STEP 4: Success + Invoice */}
                {step === "success" && (
                    <div className="max-w-2xl mx-auto py-10">
                        <style>{`
                            @media print {
                                body * { visibility: hidden; }
                                #invoice-root, #invoice-root * { visibility: visible; }
                                #invoice-root { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
                                .no-print { display: none !important; }
                                .invoice-card { box-shadow: none !important; border: 1px solid #ccc !important; }
                            }
                            @keyframes invoicePop { from{opacity:0;transform:scale(.97) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
                            .invoice-animate { animation: invoicePop .5s ease both; }
                        `}</style>

                        {/* Success banner */}
                        <div className="no-print text-center mb-8 invoice-animate">
                            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
                                style={{ background: "linear-gradient(135deg, #16a34a, #065f46)" }}>
                                <CheckCircle className="text-white" size={40} />
                            </div>
                            <h2 className="text-3xl font-extrabold mb-1">Payment Successful! 🎉</h2>
                            <p className="text-muted-foreground">Your order has been confirmed. Here is your invoice.</p>
                        </div>

                        {/* ── INVOICE CARD ── */}
                        <div id="invoice-root">
                            <Card className="invoice-card invoice-animate border border-border overflow-hidden" style={{ animationDelay: "120ms" }}>
                                {/* Invoice Header */}
                                <div className="p-6 text-white" style={{ background: "linear-gradient(135deg, oklch(0.42 0.15 142), oklch(0.32 0.13 142))" }}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-2xl">🌿</span>
                                                <span className="text-xl font-extrabold tracking-tight">Agri Mart</span>
                                            </div>
                                            <p className="text-xs opacity-70 tracking-widest uppercase">The Farmer's Hub · Sinnar, Nashik, India</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs opacity-70 uppercase tracking-wide mb-1">Invoice</p>
                                            <p className="font-bold text-lg font-mono">#{orderId ? orderId.slice(-8).toUpperCase() : "——"}</p>
                                            <p className="text-xs opacity-70 mt-1">{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                                        </div>
                                    </div>
                                    {/* Payment status badge */}
                                    <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 text-sm font-semibold">
                                        <span className="w-2 h-2 rounded-full bg-green-300 inline-block animate-pulse"></span>
                                        Payment Confirmed · Razorpay
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Billed To + Delivery */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Billed To</p>
                                            <p className="font-bold">{user?.name}</p>
                                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                                            {user?.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Deliver To</p>
                                            <p className="text-sm leading-relaxed text-muted-foreground">
                                                {address.street && <span className="block">{address.street}</span>}
                                                {address.city && address.state && <span className="block">{address.city}, {address.state} – {address.pincode}</span>}
                                                {address.country && <span className="block">{address.country}</span>}
                                                {address.phone && <span className="block">📞 {address.phone}</span>}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Order Items</p>
                                        <div className="rounded-xl overflow-hidden border border-border">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr style={{ background: "oklch(0.95 0.02 142)" }}>
                                                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Item</th>
                                                        <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Qty</th>
                                                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Rate</th>
                                                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {productItems.map((item, i) => (
                                                        <tr key={i} className="hover:bg-secondary/20">
                                                            <td className="px-4 py-3">
                                                                <p className="font-medium">{item.name}</p>
                                                                <p className="text-xs text-muted-foreground capitalize">{item.category?.replace(/-/g, " ")}</p>
                                                            </td>
                                                            <td className="px-3 py-3 text-center">{item.quantity}</td>
                                                            <td className="px-4 py-3 text-right">₹{item.price.toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right font-semibold">₹{(item.price * item.quantity).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                    {rentalItems.map((item, i) => (
                                                        <tr key={`r-${i}`} className="hover:bg-secondary/20">
                                                            <td className="px-4 py-3">
                                                                <p className="font-medium">{item.name}</p>
                                                                <p className="text-xs text-muted-foreground">🚜 Rental · {item.days || 1} day(s)</p>
                                                            </td>
                                                            <td className="px-3 py-3 text-center">{item.days || 1}d</td>
                                                            <td className="px-4 py-3 text-right">₹{(item.pricePerDay || item.price).toLocaleString()}/day</td>
                                                            <td className="px-4 py-3 text-right font-semibold">₹{((item.pricePerDay || item.price) * (item.days || 1)).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Totals */}
                                    <div className="flex justify-end">
                                        <div className="w-72 space-y-2 text-sm">
                                            {productItems.length > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Subtotal (Products)</span>
                                                    <span>₹{productTotal.toLocaleString()}</span>
                                                </div>
                                            )}
                                            {rentalItems.length > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Subtotal (Rentals)</span>
                                                    <span>₹{rentalTotal.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Shipping</span>
                                                <span className={shippingCharges === 0 ? "text-green-600 font-semibold" : ""}>{shippingCharges === 0 ? "FREE" : `₹${shippingCharges}`}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">GST (18%)</span>
                                                <span>₹{tax.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-t border-border pt-3 mt-1">
                                                <span className="font-extrabold text-base">Grand Total</span>
                                                <span className="font-extrabold text-xl text-primary">₹{grandTotal.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer note */}
                                    <div className="rounded-xl p-4 text-center text-sm text-muted-foreground" style={{ background: "oklch(0.96 0.02 142)" }}>
                                        🙏 Thank you for shopping with <span className="font-semibold text-primary">Agri Mart</span>! For support, call <span className="font-semibold">+91 96534 60985</span> or email support@agrimart.com
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Action Buttons */}
                        <div className="no-print flex gap-3 mt-6 justify-center flex-wrap">
                            <Button size="lg" className="gap-2 rounded-full px-8"
                                onClick={() => window.print()}>
                                🖨️ Print Invoice
                            </Button>
                            <Button variant="outline" size="lg" asChild className="rounded-full px-8">
                                <Link href="/dashboard">My Orders</Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild className="rounded-full px-8">
                                <Link href="/products">Continue Shopping</Link>
                            </Button>
                        </div>
                    </div>
                )}

            </div>
        </main>
    )
}

/* ─── Order Summary Sidebar ──────────────────────── */
function OrderSummary({
    productItems,
    rentalItems,
    productTotal,
    rentalTotal,
    shippingCharges,
    tax,
    grandTotal,
}: {
    productItems: any[]
    rentalItems: any[]
    productTotal: number
    rentalTotal: number
    shippingCharges: number
    tax: number
    grandTotal: number
}) {
    return (
        <Card className="p-6 h-fit sticky top-24">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
                {productItems.length > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Products ({productItems.length})</span>
                        <span>₹{productTotal.toLocaleString()}</span>
                    </div>
                )}
                {rentalItems.length > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Rentals ({rentalItems.length})</span>
                        <span>₹{rentalTotal.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingCharges === 0 ? <span className="text-green-600 font-medium">FREE</span> : `₹${shippingCharges}`}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (18% GST)</span>
                    <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold text-base">Total</span>
                    <span className="font-bold text-lg text-primary">₹{grandTotal.toLocaleString()}</span>
                </div>
                {shippingCharges === 0 && productTotal > 0 && (
                    <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg text-center">
                        🎉 You get free shipping on orders above ₹500!
                    </p>
                )}
            </div>
        </Card>
    )
}
