"use client"

import type React from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"

function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect() } }, { threshold: 0.1 })
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{ opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(28px)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

const CONTACT_INFO = [
  { icon: Mail, title: "Email", lines: ["myagrimart@gmail.com"], color: "from-green-400 to-emerald-600", emoji: "✉️" },
  { icon: Phone, title: "Phone", lines: ["+91 96534 60985", "Mon-Fri, 9AM-6PM IST"], color: "from-amber-400 to-orange-500", emoji: "📞" },
  { icon: MapPin, title: "Address", lines: ["Sinnar, Nashik, India", "Serving all in Nashik"], color: "from-blue-400 to-cyan-500", emoji: "📍" },
]

const FAQS = [
  { q: "How do I place an order?", a: "Browse our products, add items to cart, and proceed to checkout. You can pay using various payment methods." },
  { q: "What is the delivery time?", a: "Delivery typically takes 3-5 business days depending on your location. Express delivery is available in major cities." },
  { q: "Can I rent equipment for long-term use?", a: "Yes, we offer flexible rental periods. Contact our team for custom rental packages." },
  { q: "What is your return policy?", a: "We offer 7-day returns for products in original condition. Equipment rentals have specific terms." },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t) }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true)
    try {
      await api.post("/contact", formData)
      setSubmitted(true)
      setTimeout(() => { setFormData({ name: "", email: "", phone: "", subject: "", message: "" }); setSubmitted(false) }, 3000)
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.")
    } finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        .shimmer-text { background:linear-gradient(90deg,oklch(0.45 0.15 142) 0%,#6ee7b7 40%,oklch(0.45 0.15 142) 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 3s linear infinite; }
        .blob-shape { animation:blob 8s ease-in-out infinite; }
        .info-card { transition:transform .25s ease,box-shadow .25s ease; }
        .info-card:hover { transform:translateY(-7px); box-shadow:0 20px 44px rgba(0,0,0,.12); }
        .faq-card { transition:transform .2s ease,box-shadow .2s ease; }
        .faq-card:hover { transform:translateY(-4px); box-shadow:0 12px 28px rgba(0,0,0,.08); }
        .input-focus { transition:box-shadow .2s ease,border-color .2s ease; }
        .input-focus:focus { box-shadow:0 0 0 3px rgba(34,197,94,0.2); }
        .submit-btn { transition:transform .15s ease,box-shadow .2s ease; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 24px rgba(34,197,94,.35); }
        .submit-btn:active { transform:scale(.97); }
      `}</style>

      <Navigation />

      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.98 0.02 142) 0%, oklch(0.93 0.05 142) 50%, oklch(0.95 0.04 70) 100%)" }}>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blob-shape opacity-20" style={{ background: "oklch(0.65 0.15 142)" }} />
        <div className="max-w-7xl mx-auto relative z-10" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(-20px)", transition: "opacity .7s ease, transform .7s ease" }}>
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-primary">
            💬 Get In Touch
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-5 leading-tight">
            Contact <span className="shimmer-text">Our Team</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
            Have questions? We'd love to hear from you. Our team is here to help with anything you need.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-4">
            {CONTACT_INFO.map((info, i) => (
              <RevealSection key={info.title} delay={i * 100}>
                <Card className="info-card p-8 text-center border border-border h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center mx-auto mb-5 shadow-md`}>
                    <info.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">{info.title}</h3>
                  {info.lines.map((l) => <p key={l} className="text-muted-foreground text-sm">{l}</p>)}
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-4" style={{ background: "oklch(0.97 0.01 142)" }}>
        <div className="max-w-2xl mx-auto">
          <RevealSection>
            <div className="text-center mb-10">
              <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Message Us</span>
              <h2 className="text-4xl font-extrabold">Send us a <span className="shimmer-text">Message</span></h2>
            </div>
          </RevealSection>
          <RevealSection delay={100}>
            <Card className="p-8 border border-border shadow-lg">
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-5 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Thank you!</h3>
                  <p className="text-muted-foreground">We've received your message and will get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">{error}</div>}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-2">Name</label><Input className="input-focus" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required /></div>
                    <div><label className="block text-sm font-medium mb-2">Email</label><Input className="input-focus" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required /></div>
                  </div>
                  <div><label className="block text-sm font-medium mb-2">Phone</label><Input className="input-focus" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" /></div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <select name="subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-2 border border-border rounded-lg bg-background input-focus" required>
                      <option value="">Select a subject</option>
                      <option value="product-inquiry">Product Inquiry</option>
                      <option value="rental-inquiry">Rental Inquiry</option>
                      <option value="technical-support">Technical Support</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Tell us how we can help..." rows={5} className="w-full px-4 py-2 border border-border rounded-lg bg-background resize-none input-focus" required />
                  </div>
                  <Button type="submit" size="lg" className="w-full gap-2 submit-btn rounded-full" disabled={loading}>
                    <Send size={18} />
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </Card>
          </RevealSection>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <RevealSection>
            <div className="text-center mb-12">
              <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">FAQ</span>
              <h2 className="text-4xl font-extrabold">Frequently Asked <span className="shimmer-text">Questions</span></h2>
            </div>
          </RevealSection>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <RevealSection key={i} delay={i * 80}>
                <Card className="faq-card p-6 border border-border">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><span className="text-primary">Q.</span> {faq.q}</h3>
                  <p className="text-muted-foreground leading-relaxed pl-5">{faq.a}</p>
                </Card>
              </RevealSection>
            ))}
          </div>
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
