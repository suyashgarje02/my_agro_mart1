"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Leaf, Wrench, TrendingUp, Users, ArrowRight, Star, Shield, Truck } from "lucide-react"
import { useEffect, useRef, useState } from "react"

/* ─── tiny scroll-reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShown(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, shown }
}

function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, shown } = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

const STATS = [
  { value: "100+", label: "Active Users" },
  { value: "25+", label: "Products Listed" },
  { value: "12+", label: "Equipment Items" },
  { value: "15+", label: "Villages Covered" },
]

const FEATURES = [
  { icon: Leaf, title: "Quality Products", desc: "Verified agricultural products from trusted local suppliers", color: "from-green-400 to-emerald-600" },
  { icon: Wrench, title: "Equipment Rental", desc: "Affordable daily rental options for all farming equipment", color: "from-amber-400 to-orange-500" },
  { icon: TrendingUp, title: "Best Prices", desc: "Competitive pricing, flash deals and seasonal discounts", color: "from-blue-400 to-cyan-500" },
  { icon: Users, title: "Community", desc: "Connect with local farmers and agricultural experts near you", color: "from-purple-400 to-violet-600" },
]

const CATEGORIES = [
  { name: "Seeds & Fertilizers", image: "/seeds-fertilizers.jpg.webp", emoji: "🌱", href: "/products?category=seeds-fertilizers" },
  { name: "Tools & Equipment", image: "/tools-equipment.jpg.jpg", emoji: "🔧", href: "/products?category=tools-equipment" },
  { name: "Pesticides & Chemicals", image: "/pesticides-chemicals.jpg.webp", emoji: "🧪", href: "/products?category=pesticides-chemicals" },
]

const TESTIMONIALS = [
  { name: "Rajesh Kumar", role: "Wheat Farmer, Sinnar", quote: "Agri Mart helped me find the best seeds at fair prices. My yield improved by 30% this season!", stars: 5 },
  { name: "Priya Singh", role: "Supplier, Nashik", quote: "The platform is incredibly easy to use. My products reach farmers across the region now.", stars: 5 },
  { name: "Manoj Patil", role: "Equipment Owner, Pune", quote: "Renting out my tractor through this platform has doubled my off-season income.", stars: 4 },
]

export default function Home() {
  const [heroVisible, setHeroVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t) }, [])

  return (
    <main className="min-h-screen overflow-x-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-14px) rotate(3deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          70%  { box-shadow: 0 0 0 18px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes blob {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50%       { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }

        .float-emoji { animation: float 3.5s ease-in-out infinite; }
        .float-slow  { animation: floatSlow 5s ease-in-out infinite; }
        .blob-shape  { animation: blob 8s ease-in-out infinite; }

        .shimmer-text {
          background: linear-gradient(90deg, var(--color-primary) 0%, #6ee7b7 40%, var(--color-primary) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }

        .hero-btn-primary {
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hero-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(34,197,94,0.4); }
        .hero-btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%);
          transition: transform 0.4s ease;
        }
        .hero-btn-primary:hover::after { transform: translateX(100%); }

        .hero-btn-outline {
          transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }
        .hero-btn-outline:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }

        .feature-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .feature-card:hover { transform: translateY(-8px); box-shadow: 0 20px 48px rgba(0,0,0,0.13); }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .feature-card:hover::before { opacity: 1; }

        .category-card {
          transition: transform 0.28s ease, box-shadow 0.28s ease;
          overflow: hidden;
        }
        .category-card:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 24px 56px rgba(0,0,0,0.14); }
        .category-img { transition: transform 0.5s ease; }
        .category-card:hover .category-img { transform: scale(1.1); }

        .stat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(34,197,94,0.2); }

        .testimonial-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .testimonial-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }

        .footer-link { transition: color 0.15s ease, padding-left 0.15s ease; }
        .footer-link:hover { color: #6ee7b7; padding-left: 4px; }

        .cta-pulse { animation: pulse-ring 2.5s ease-in-out infinite; }
      `}</style>

      <Navigation />

      {/* ─── HERO ─── */}
      <section className="relative min-h-[90vh] flex items-center px-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.98 0.02 142) 0%, oklch(0.93 0.05 142) 40%, oklch(0.95 0.04 70) 100%)" }}>

        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blob-shape opacity-20"
          style={{ background: "oklch(0.65 0.15 142)" }} />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blob-shape opacity-15"
          style={{ background: "oklch(0.65 0.12 70)", animationDelay: "3s" }} />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Text */}
            <div style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateX(0)" : "translateX(-40px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}>
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-primary">
                <span className="w-2 h-2 rounded-full bg-primary cta-pulse inline-block" />
                India's Agricultural Marketplace
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight">
                Connect with
                <span className="shimmer-text block">Agricultural</span>
                Excellence
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
                Buy premium agricultural products, rent equipment, and connect with trusted farmers and suppliers in your region.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="hero-btn-primary rounded-full px-8">
                  <Link href="/products" className="flex items-center gap-2">
                    Browse Products <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="hero-btn-outline rounded-full px-8 bg-white/50 backdrop-blur-sm">
                  <Link href="/rentals">Explore Rentals</Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-10 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Shield size={16} className="text-primary" /> Verified Sellers</span>
                <span className="flex items-center gap-1.5"><Truck size={16} className="text-primary" /> Fast Delivery</span>
                <span className="flex items-center gap-1.5"><Star size={16} className="text-primary" /> Top Rated</span>
              </div>
            </div>

            {/* Hero visual */}
            <div style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateX(0) scale(1)" : "translateX(40px) scale(0.95)",
              transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
            }}>
              <div className="relative">
                {/* Main card */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl float-slow" style={{ minHeight: 360 }}>
                  {/* Tractor image fills the card */}
                  <img
                    src="https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=700&q=80"
                    alt="Tractor on farm field"
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ minHeight: 360 }}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,83,45,0.92) 0%, rgba(20,83,45,0.3) 55%, transparent 100%)" }} />
                  {/* Text at bottom */}
                  <div className="relative flex flex-col items-start justify-end h-full py-8 px-8 text-white" style={{ minHeight: 360 }}>
                    <h3 className="text-2xl font-bold mb-1">Farm to Table</h3>
                    <p className="opacity-80 text-sm max-w-xs">Empowering farmers with modern tools and direct market access</p>
                  </div>
                </div>

                {/* Floating chips */}
                <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-2 text-sm font-semibold"
                  style={{ animation: "floatSlow 4s ease-in-out infinite" }}>
                  <span className="text-lg">🌱</span> Seeds & Crops
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-2 text-sm font-semibold"
                  style={{ animation: "floatSlow 4.5s ease-in-out infinite 1.5s" }}>
                  <span className="text-lg">🚜</span> Equipment Rental
                </div>
                <div className="absolute top-1/2 -right-6 bg-white rounded-2xl shadow-lg px-3 py-2 flex items-center gap-1.5 text-xs font-semibold"
                  style={{ animation: "floatSlow 3.8s ease-in-out infinite 0.8s" }}>
                  <span>⭐</span> Trusted by Farmers
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-16 px-4" style={{ background: "linear-gradient(90deg, oklch(0.45 0.15 142) 0%, oklch(0.38 0.12 142) 100%)" }}>
        <RevealSection>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <RevealSection key={stat.label} delay={i * 100}>
                <div className="stat-card bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20">
                  <div className="text-4xl font-extrabold mb-1">{stat.value}</div>
                  <p className="text-sm opacity-80">{stat.label}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Why Choose Us</span>
              <h2 className="text-4xl font-extrabold">Why Choose <span className="shimmer-text">Agri Mart?</span></h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Built for Indian farmers — simple, reliable, affordable</p>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <RevealSection key={f.title} delay={i * 100}>
                <Card className="feature-card p-7 text-center h-full border border-border">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-5 shadow-md`}>
                    <f.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="py-24 px-4" style={{ background: "oklch(0.97 0.01 142)" }}>
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Shop by Category</span>
              <h2 className="text-4xl font-extrabold">Popular <span className="shimmer-text">Categories</span></h2>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-8">
            {CATEGORIES.map((cat, i) => (
              <RevealSection key={cat.name} delay={i * 120}>
                <Link href={cat.href} className="group block">
                  <Card className="category-card border-0 shadow-md overflow-hidden">
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden bg-primary/10">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="category-img w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <div className="text-3xl mb-1">{cat.emoji}</div>
                        <h3 className="font-bold text-lg leading-tight">{cat.name}</h3>
                      </div>
                    </div>
                    {/* Footer */}
                    <div className="p-4 flex items-center justify-between bg-white group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <span className="text-sm font-semibold">Shop Now</span>
                      <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </Card>
                </Link>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Testimonials</span>
              <h2 className="text-4xl font-extrabold">What <span className="shimmer-text">Farmers Say</span></h2>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <RevealSection key={t.name} delay={i * 100}>
                <Card className="testimonial-card p-7 h-full border border-border relative overflow-hidden">
                  <div className="absolute top-4 right-5 text-6xl opacity-5 font-serif select-none">"</div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.stars)].map((_, s) => (
                      <Star key={s} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                    {t.stars < 5 && <Star size={16} className="text-muted-foreground/30" />}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <RevealSection>
        <section className="py-24 px-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, oklch(0.4 0.15 142) 0%, oklch(0.3 0.12 142) 100%)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1.5px, transparent 1.5px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "32px 32px, 24px 24px" }} />
          <div className="max-w-3xl mx-auto text-center relative z-10 text-white">
            <div className="text-5xl mb-6 float-emoji inline-block">🚀</div>
            <h2 className="text-4xl font-extrabold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-10 opacity-80 max-w-xl mx-auto">
              Join farmers and suppliers across Maharashtra on Agri Mart
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="hero-btn-primary rounded-full px-10 font-bold">
                <Link href="/signup">Create Your Account</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild
                className="rounded-full px-10 border border-white/30 text-white hover:bg-white/10">
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ─── FOOTER ─── */}
      <footer className="bg-foreground text-background py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div>
              <h4 className="text-lg font-extrabold mb-3 flex items-center gap-2">
                <span className="text-primary">🌿</span> Agri Mart
              </h4>
              <p className="text-sm opacity-60 leading-relaxed mb-4">
                Empowering Indian farmers with technology and community.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wide opacity-60">About</h4>
              <ul className="space-y-2.5 text-sm">
                {[["About Us", "/about"], ["Contact", "/contact"], ["Blog", "#"]].map(([label, href]) => (
                  <li key={label}><Link href={href} className="footer-link opacity-70 inline-block">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wide opacity-60">Products</h4>
              <ul className="space-y-2.5 text-sm">
                {[["Browse Products", "/products"], ["Equipment Rental", "/rentals"], ["Deals", "#"]].map(([label, href]) => (
                  <li key={label}><Link href={href} className="footer-link opacity-70 inline-block">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wide opacity-60">Support</h4>
              <ul className="space-y-2.5 text-sm">
                {[["Help Center", "#"], ["FAQ", "#"], ["Privacy Policy", "#"]].map(([label, href]) => (
                  <li key={label}><Link href={href} className="footer-link opacity-70 inline-block">{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-background/10 pt-8 text-center text-sm opacity-50">
            <p>&copy; 2025 Agri Mart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
