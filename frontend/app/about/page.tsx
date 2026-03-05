"use client"

import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Target, Award, Globe, ArrowRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"

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

const VALUES = [
  { icon: Target, title: "Quality First", desc: "We ensure all products meet the highest quality standards", color: "from-green-400 to-emerald-600" },
  { icon: Users, title: "Community", desc: "Building strong relationships with farmers and suppliers", color: "from-amber-400 to-orange-500" },
  { icon: Award, title: "Excellence", desc: "Delivering exceptional service and farmer support", color: "from-blue-400 to-cyan-500" },
  { icon: Globe, title: "Sustainability", desc: "Promoting eco-friendly and sustainable farming practices", color: "from-purple-400 to-violet-600" },
]

const TEAM = [
  { name: "Arun Solse", role: "Founder & CEO", expertise: "Agricultural Business", emoji: "👨‍💼" },
  { name: "Anuj Solse", role: "CTO", expertise: "Technology & Innovation", emoji: "👨‍💻" },
  { name: "Amit Patel", role: "Head of Operations", expertise: "Supply Chain Management", emoji: "⚙️" },
]

const TECH_TEAM = [
  { name: "Aniket Wagh", role: "Full Stack Developer", expertise: "Backend Integration", emoji: "🔧" },
  { name: "Om Sutar", role: "Database Engineer", expertise: "MongoDB Setup & Queries", emoji: "🗄️" },
  { name: "Suyash Garje", role: "Full Stack Developer", expertise: "UI/UX Designer", emoji: "🎨" },
]

const STATS = [
  { value: "100+", label: "Active Users" },
  { value: "25+", label: "Products Listed" },
  { value: "12+", label: "Equipment Available" },
  { value: "15+", label: "Villages Covered" },
]

export default function AboutPage() {
  const [heroVisible, setHeroVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t) }, [])

  return (
    <main className="min-h-screen overflow-x-hidden">
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        @keyframes floatSlow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .shimmer-text { background:linear-gradient(90deg,oklch(0.45 0.15 142) 0%,#6ee7b7 40%,oklch(0.45 0.15 142) 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 3s linear infinite; }
        .blob-shape { animation:blob 8s ease-in-out infinite; }
        .float-slow { animation:floatSlow 5s ease-in-out infinite; }
        .value-card { transition:transform .25s ease,box-shadow .25s ease; }
        .value-card:hover { transform:translateY(-7px); box-shadow:0 20px 44px rgba(0,0,0,.12); }
        .team-card { transition:transform .2s ease,box-shadow .2s ease; }
        .team-card:hover { transform:translateY(-5px); box-shadow:0 16px 36px rgba(0,0,0,.1); }
        .stat-chip { transition:transform .2s ease,box-shadow .2s ease; }
        .stat-chip:hover { transform:translateY(-4px); box-shadow:0 12px 28px rgba(34,197,94,.25); }
      `}</style>

      <Navigation />

      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.98 0.02 142) 0%, oklch(0.93 0.05 142) 50%, oklch(0.95 0.04 70) 100%)" }}>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blob-shape opacity-20" style={{ background: "oklch(0.65 0.15 142)" }} />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full blob-shape opacity-15" style={{ background: "oklch(0.65 0.12 70)", animationDelay: "3s" }} />
        <div className="max-w-7xl mx-auto relative z-10" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(-20px)", transition: "opacity .7s ease, transform .7s ease" }}>
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-primary">
            🌿 Our Story
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-5 leading-tight">
            About <span className="shimmer-text">Agri Mart</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Connecting farmers, suppliers, and agricultural professionals to build a sustainable and prosperous farming community across India.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <RevealSection>
              <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-5">Our Mission</span>
              <h2 className="text-4xl font-extrabold mb-5">Empowering Farmers <span className="shimmer-text">Across India</span></h2>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                We believe in empowering farmers with access to quality products, affordable equipment rental, and a community of like-minded agricultural professionals.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our platform eliminates middlemen, reduces costs, and connects buyers directly with trusted suppliers ensuring fair prices and quality products.
              </p>
              <Button asChild className="rounded-full px-8 gap-2">
                <Link href="/products">Explore Products <ArrowRight size={16} /></Link>
              </Button>
            </RevealSection>
            <RevealSection delay={150}>
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl float-slow h-80"
                  style={{ background: "linear-gradient(145deg, oklch(0.45 0.15 142), oklch(0.35 0.12 142))" }}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                  <div className="flex flex-col items-center justify-center h-full text-white text-center p-8 gap-4">
                    <span className="text-7xl">🌾</span>
                    <h3 className="text-2xl font-bold">Farm to Community</h3>
                    <p className="opacity-80 text-sm max-w-xs">Direct farmer access to markets and quality inputs</p>
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4" style={{ background: "oklch(0.97 0.01 142)" }}>
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">What We Stand For</span>
              <h2 className="text-4xl font-extrabold">Our <span className="shimmer-text">Values</span></h2>
            </div>
          </RevealSection>
          <div className="grid md:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <RevealSection key={v.title} delay={i * 90}>
                <Card className="value-card p-7 text-center h-full border border-border">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${v.color} flex items-center justify-center mx-auto mb-5 shadow-md`}>
                    <v.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4" style={{ background: "linear-gradient(90deg, oklch(0.45 0.15 142), oklch(0.38 0.12 142))" }}>
        <RevealSection>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <RevealSection key={s.label} delay={i * 80}>
                <div className="stat-chip bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20">
                  <div className="text-4xl font-extrabold mb-1">{s.value}</div>
                  <p className="text-sm opacity-80">{s.label}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* Leadership Team */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Leadership</span>
              <h2 className="text-4xl font-extrabold">Our <span className="shimmer-text">Team</span></h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Our dedicated team of agricultural experts, technologists, and business professionals</p>
            </div>
          </RevealSection>
          <div className="grid md:grid-cols-3 gap-8">
            {TEAM.map((m, i) => (
              <RevealSection key={m.name} delay={i * 100}>
                <Card className="team-card p-8 text-center border border-border">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 mx-auto mb-5 flex items-center justify-center text-4xl shadow-md">
                    {m.emoji}
                  </div>
                  <h3 className="font-bold text-xl mb-1">{m.name}</h3>
                  <p className="text-primary font-semibold mb-2 text-sm">{m.role}</p>
                  <p className="text-sm text-muted-foreground">{m.expertise}</p>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Team */}
      <section className="py-24 px-4" style={{ background: "oklch(0.97 0.01 142)" }}>
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Tech</span>
              <h2 className="text-4xl font-extrabold">Our <span className="shimmer-text">Technical Team</span></h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">The dedicated developers, database engineers, and UI/UX designers behind Agri Mart</p>
            </div>
          </RevealSection>
          <div className="grid md:grid-cols-3 gap-8">
            {TECH_TEAM.map((m, i) => (
              <RevealSection key={m.name} delay={i * 100}>
                <Card className="team-card p-8 text-center border border-border">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 mx-auto mb-5 flex items-center justify-center text-4xl shadow-md">
                    {m.emoji}
                  </div>
                  <h3 className="font-bold text-xl mb-1">{m.name}</h3>
                  <p className="text-primary font-semibold mb-2 text-sm">{m.role}</p>
                  <p className="text-sm text-muted-foreground">{m.expertise}</p>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.4 0.15 142), oklch(0.3 0.12 142))" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }} />
        <RevealSection>
          <div className="max-w-3xl mx-auto text-center text-white relative z-10">
            <div className="text-5xl mb-6">🤝</div>
            <h2 className="text-4xl font-extrabold mb-4">Join Our Growing Community</h2>
            <p className="text-lg opacity-80 mb-10 max-w-xl mx-auto">Be part of the agricultural revolution. Connect with farmers and suppliers today.</p>
            <Button size="lg" variant="secondary" asChild className="rounded-full px-10 font-bold">
              <Link href="/signup">Get Started Now</Link>
            </Button>
          </div>
        </RevealSection>
      </section>

      <footer className="bg-foreground text-background py-10 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm opacity-60">
          <p>&copy; 2025 Agri Mart. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
