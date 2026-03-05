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
import { ArrowRight, UserPlus } from "lucide-react"

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", userType: "farmer" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t) }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target; setFormData((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("")
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters"); return }
    setLoading(true)
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password, phone: formData.phone, userType: formData.userType })
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    } finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <style>{`
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes blob{0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}}
        @keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .shimmer-text{background:linear-gradient(90deg,oklch(0.45 0.15 142) 0%,#6ee7b7 40%,oklch(0.45 0.15 142) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite;}
        .blob-shape{animation:blob 8s ease-in-out infinite;}
        .float-up{animation:floatUp 4s ease-in-out infinite;}
        .input-anim{transition:box-shadow .2s ease;}
        .input-anim:focus{box-shadow:0 0 0 3px rgba(34,197,94,.25);}
        .signup-btn{transition:transform .15s ease,box-shadow .2s ease;}
        .signup-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 24px rgba(34,197,94,.35);}
        .signup-btn:active{transform:scale(.97);}
      `}</style>

      <Navigation />

      <div className="min-h-[calc(100vh-64px)] grid md:grid-cols-2">
        {/* Left decorative panel */}
        <div className="hidden md:flex relative overflow-hidden items-center justify-center p-12"
          style={{ background: "linear-gradient(145deg, oklch(0.45 0.15 142), oklch(0.32 0.13 142))" }}>
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blob-shape opacity-20" style={{ background: "white" }} />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full blob-shape opacity-15" style={{ background: "white", animationDelay: "3s" }} />
          <div className="relative z-10 text-white text-center">
            <div className="text-8xl mb-6 float-up">🌱</div>
            <h2 className="text-3xl font-extrabold mb-4">Join Our<br />Community</h2>
            <p className="opacity-80 text-lg max-w-xs mx-auto leading-relaxed">Start your journey with India's growing agricultural marketplace</p>
            <div className="mt-10 space-y-3 text-sm max-w-xs mx-auto">
              {[["🌾", "Access 25+ quality products"], ["🚜", "Rent 12+ equipment items"], ["🤝", "Connect with 100+ farmers"], ["🌍", "Serve 15+ villages"]].map(([e, t]) => (
                <div key={t} className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3 text-left font-medium">
                  <span>{e}</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="flex items-center justify-center px-6 py-12"
          style={{ background: "linear-gradient(160deg, oklch(0.98 0.02 142) 0%, oklch(0.96 0.01 142) 100%)" }}>
          <div className="w-full max-w-md" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity .6s ease, transform .6s ease" }}>
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-extrabold mb-2">Create <span className="shimmer-text">Account</span></h1>
              <p className="text-muted-foreground">Join the Agri Mart community today</p>
            </div>

            <Card className="p-8 border border-border shadow-xl">
              {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mb-5">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input className="input-anim" type="text" name="name" placeholder="Your name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input className="input-anim" type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input className="input-anim" type="tel" name="phone" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">I am a</label>
                  <select name="userType" value={formData.userType} onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background input-anim">
                    <option value="farmer">🌾 Farmer</option>
                    <option value="supplier">🏪 Supplier</option>
                    <option value="dealer">🤝 Dealer</option>
                    <option value="other">👤 Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <Input className="input-anim" type="password" name="password" placeholder="Min 6 chars" value={formData.password} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm</label>
                    <Input className="input-anim" type="password" name="confirmPassword" placeholder="Re-enter" value={formData.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full gap-2 signup-btn rounded-full mt-2" disabled={loading}>
                  <UserPlus size={18} />
                  {loading ? "Creating account..." : "Create Account"}
                  {!loading && <ArrowRight size={16} />}
                </Button>
              </form>

              <p className="text-sm text-center mt-5 text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">Login</Link>
              </p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
