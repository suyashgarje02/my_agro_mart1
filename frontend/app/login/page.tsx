"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { User, ShieldCheck, Store, ArrowRight } from "lucide-react"

const LOGIN_TABS = [
    { key: "user", label: "User", icon: User, hint: "Login as a buyer / farmer", color: "from-green-400 to-emerald-600" },
    { key: "seller", label: "Seller", icon: Store, hint: "Login as a seller / supplier", color: "from-amber-400 to-orange-500" },
    { key: "admin", label: "Admin", icon: ShieldCheck, hint: "Login as platform admin", color: "from-blue-400 to-cyan-500" },
] as const

type LoginRole = (typeof LOGIN_TABS)[number]["key"]

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<LoginRole>("user")
    const [email, setEmail] = useState("rajesh@agro.com")
    const [password, setPassword] = useState("user123")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(false)
    const { login } = useAuth()
    const router = useRouter()

    useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t) }, [])

    const handleTabChange = (tab: LoginRole) => {
        setActiveTab(tab); setError("")
        if (tab === "admin") { setEmail("admin@agro.com"); setPassword("admin123") }
        else if (tab === "seller") { setEmail("priya@agro.com"); setPassword("seller123") }
        else { setEmail("rajesh@agro.com"); setPassword("user123") }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError(""); setLoading(true)
        try {
            const user = await login(email, password)
            if (user.role === "admin") router.push("/admin")
            else if (user.role === "seller") router.push("/seller")
            else router.push("/dashboard")
        } catch (err: any) {
            setError(err.message || "Invalid credentials. Please try again.")
        } finally { setLoading(false) }
    }

    const currentTab = LOGIN_TABS.find((t) => t.key === activeTab)!

    return (
        <main className="min-h-screen overflow-hidden">
            <style>{`
                @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
                @keyframes blob{0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}}
                @keyframes floatRight{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(2deg)}}
                .shimmer-text{background:linear-gradient(90deg,oklch(0.45 0.15 142) 0%,#6ee7b7 40%,oklch(0.45 0.15 142) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite;}
                .blob-shape{animation:blob 8s ease-in-out infinite;}
                .float-décor{animation:floatRight 4s ease-in-out infinite;}
                .tab-btn{transition:all .2s ease;}
                .input-anim{transition:box-shadow .2s ease,border-color .2s ease;}
                .input-anim:focus{box-shadow:0 0 0 3px rgba(34,197,94,.25);border-color:oklch(0.45 0.15 142);}
                .login-btn{transition:transform .15s ease,box-shadow .2s ease;}
                .login-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 24px rgba(34,197,94,.35);}
                .login-btn:active{transform:scale(.97);}
            `}</style>

            <Navigation />

            <div className="min-h-[calc(100vh-64px)] grid md:grid-cols-2">
                {/* Left: Decorative Panel */}
                <div className="hidden md:flex relative overflow-hidden items-center justify-center p-12"
                    style={{ background: "linear-gradient(145deg, oklch(0.45 0.15 142), oklch(0.32 0.13 142))" }}>
                    <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blob-shape opacity-20" style={{ background: "white" }} />
                    <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full blob-shape opacity-15" style={{ background: "white", animationDelay: "3s" }} />
                    <div className="relative z-10 text-white text-center">
                        <div className="text-8xl mb-6 float-décor">🌾</div>
                        <h2 className="text-3xl font-extrabold mb-4">Welcome to<br />Agri Mart</h2>
                        <p className="opacity-80 text-lg max-w-xs mx-auto leading-relaxed">Empowering farmers with technology and direct market access</p>
                        <div className="mt-10 grid grid-cols-2 gap-4 text-sm">
                            {["100+ Users", "25+ Products", "12+ Equipment", "15+ Villages"].map(s => (
                                <div key={s} className="bg-white/15 rounded-xl px-4 py-3 font-semibold">{s}</div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="flex items-center justify-center px-6 py-12"
                    style={{ background: "linear-gradient(160deg, oklch(0.98 0.02 142) 0%, oklch(0.96 0.01 142) 100%)" }}>
                    <div className="w-full max-w-md" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity .6s ease, transform .6s ease" }}>
                        <div className="mb-8 text-center">
                            <h1 className="text-4xl font-extrabold mb-2">Welcome <span className="shimmer-text">Back</span></h1>
                            <p className="text-muted-foreground">Login to your Agri Mart account</p>
                        </div>

                        <Card className="p-8 border border-border shadow-xl">
                            {/* Tabs */}
                            <div className="flex rounded-xl bg-secondary/60 p-1 mb-6 gap-1">
                                {LOGIN_TABS.map((tab) => {
                                    const Icon = tab.icon; const isActive = activeTab === tab.key
                                    return (
                                        <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                                            className={`tab-btn flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium ${isActive ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                                            <Icon size={15} /> {tab.label}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="flex items-center gap-2 mb-5 p-3 bg-primary/5 rounded-lg">
                                <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${currentTab.color} inline-block`} />
                                <p className="text-xs text-muted-foreground">{currentTab.hint}</p>
                            </div>

                            {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mb-5">{error}</div>}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <Input className="input-anim" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Password</label>
                                    <Input className="input-anim" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <Button type="submit" size="lg" className="w-full gap-2 login-btn rounded-full mt-2" disabled={loading}>
                                    {loading ? "Logging in..." : <><span>Login as {currentTab.label}</span> <ArrowRight size={16} /></>}
                                </Button>
                            </form>

                            {/* Demo credentials */}
                            <div className="mt-5 p-4 bg-secondary/40 rounded-xl border border-border">
                                <p className="text-xs text-muted-foreground text-center font-semibold mb-3 uppercase tracking-wide">Demo Credentials</p>
                                <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground text-center">
                                    {[["User", "rajesh@agro.com", "user123"], ["Seller", "priya@agro.com", "seller123"], ["Admin", "admin@agro.com", "admin123"]].map(([r, e, p]) => (
                                        <div key={r} className="bg-background rounded-lg p-2">
                                            <p className="font-bold text-foreground mb-1">{r}</p>
                                            <p className="truncate">{e}</p>
                                            <p className="font-mono">{p}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-sm text-center mt-5 text-muted-foreground">
                                Don't have an account?{" "}
                                <Link href="/signup" className="text-primary font-semibold hover:underline">Sign Up</Link>
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}
