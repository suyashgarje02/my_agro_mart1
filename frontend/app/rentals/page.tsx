"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
import { Search, MapPin, Calendar, Check } from "lucide-react"
import { api } from "@/lib/api"
import { useCart } from "@/lib/cart-context"

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

const CATEGORIES = [
  { label: "All Equipment", value: "" },
  { label: "Heavy Machinery", value: "heavy-machinery" },
  { label: "Harvesting Equipment", value: "harvesting-equipment" },
  { label: "Soil Preparation", value: "soil-preparation" },
  { label: "Spraying Equipment", value: "spraying-equipment" },
  { label: "Processing Equipment", value: "processing-equipment" },
  { label: "Planting Equipment", value: "planting-equipment" },
]

const HOW_IT_WORKS = [
  { step: "1", title: "Browse", desc: "Explore our wide range of equipment", emoji: "🔍" },
  { step: "2", title: "Select", desc: "Choose dates and equipment you need", emoji: "📆" },
  { step: "3", title: "Book", desc: "Complete booking and make payment", emoji: "📋" },
  { step: "4", title: "Use", desc: "Equipment delivered to your location", emoji: "🚜" },
]

interface Rental {
  _id: string; name: string; description: string; category: string
  pricePerDay: number; location: string; availability: string
  images?: { url: string; alt: string }[]; ratings?: { average: number; count: number }
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [visible, setVisible] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)
  const { addItem } = useCart()

  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t) }, [])
  useEffect(() => { fetchRentals() }, [selectedCategory, searchTerm, selectedLocation])
  useEffect(() => {
    if (!loading && rentals.length > 0) {
      setVisible(false); const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t)
    }
  }, [loading, rentals])

  const fetchRentals = async () => {
    try {
      setLoading(true); setVisible(false)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (selectedCategory) params.append("category", selectedCategory)
      if (selectedLocation) params.append("location", selectedLocation)
      const res = await api.get(`/rentals?${params.toString()}`)
      setRentals(res.data || [])
    } catch { setRentals([]) } finally { setLoading(false) }
  }

  const locations = [...new Set(rentals.map((r) => r.location))]
  const getCategoryLabel = (v: string) => CATEGORIES.find((c) => c.value === v)?.label ?? v

  const handleBook = (rental: Rental) => {
    addItem({ id: rental._id, name: rental.name, price: rental.pricePerDay, pricePerDay: rental.pricePerDay, image: rental.images?.[0]?.url, type: "rental", category: rental.category, days: 1 })
    setAddedIds((p) => new Set(p).add(rental._id))
    setTimeout(() => setAddedIds((p) => { const n = new Set(p); n.delete(rental._id); return n }), 1500)
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% center}100%{background-position:200% center} }
        @keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
        .shimmer-text { background:linear-gradient(90deg,oklch(0.45 0.15 142) 0%,#6ee7b7 40%,oklch(0.45 0.15 142) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite; }
        .blob-shape { animation:blob 8s ease-in-out infinite; }
        .rental-card { transition:transform .25s ease,box-shadow .25s ease; }
        .rental-card:hover { transform:translateY(-7px);box-shadow:0 20px 44px rgba(0,0,0,.13); }
        .rental-img { transition:transform .45s ease; }
        .rental-card:hover .rental-img { transform:scale(1.08); }
        .rental-card-animate { opacity:0;animation:fadeSlideUp .5s ease forwards; }
        .cat-btn { transition:transform .15s ease,box-shadow .2s ease; }
        .cat-btn:hover { transform:translateY(-2px);box-shadow:0 5px 14px rgba(0,0,0,.1); }
        .cat-btn-active { transform:scale(1.06); }
        .add-btn { transition:background-color .22s ease,transform .14s ease; }
        .add-btn:active { transform:scale(.95); }
        .add-btn-added { background-color:#16a34a !important; }
        .how-step { transition:transform .2s ease,box-shadow .2s ease; }
        .how-step:hover { transform:translateY(-5px);box-shadow:0 14px 32px rgba(34,197,94,.2); }
      `}</style>

      <Navigation />

      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.98 0.02 142) 0%, oklch(0.93 0.05 142) 50%, oklch(0.95 0.04 70) 100%)" }}>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blob-shape opacity-20" style={{ background: "oklch(0.65 0.15 142)" }} />
        <div className="max-w-7xl mx-auto relative z-10" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(-18px)", transition: "opacity .7s ease, transform .7s ease" }}>
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-primary">
            🚜 Equipment Rental
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
            Rent <span className="shimmer-text">Agricultural</span> Equipment
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
            Quality farming machinery at affordable daily rates — delivered to your field.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
              <Input placeholder="Search equipment..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-muted-foreground" size={20} />
              <select className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                <option value="">All Locations</option>
                {locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Button key={cat.value} variant={selectedCategory === cat.value ? "default" : "outline"} onClick={() => setSelectedCategory(cat.value)}
                className={`rounded-full cat-btn ${selectedCategory === cat.value ? "cat-btn-active" : ""}`}>
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Rentals Grid */}
      <section className="py-12 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="bg-secondary/30 h-44 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-secondary/50 rounded animate-pulse" />
                    <div className="h-3 bg-secondary/30 rounded animate-pulse w-2/3" />
                    <div className="h-6 bg-secondary/50 rounded animate-pulse w-1/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : rentals.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rentals.map((rental, i) => (
                <Card key={rental._id}
                  className={`overflow-hidden rental-card ${visible ? "rental-card-animate" : "opacity-0"}`}
                  style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="bg-secondary/30 h-44 flex items-center justify-center overflow-hidden relative">
                    {rental.images?.[0] ? (
                      <img src={rental.images[0].url} alt={rental.images[0].alt} className="rental-img w-full h-full object-cover" />
                    ) : <span className="text-4xl">🚜</span>}
                    <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold capitalize ${rental.availability === "available" ? "bg-green-500 text-white" : "bg-red-100 text-red-800"}`}>
                      {rental.availability}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{getCategoryLabel(rental.category)}</p>
                    <h3 className="font-bold text-lg mb-1">{rental.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{rental.description}</p>
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <MapPin size={14} className="text-muted-foreground" />
                      <span className="text-muted-foreground">{rental.location}</span>
                    </div>
                    {rental.ratings && rental.ratings.count > 0 && (
                      <div className="flex items-center gap-1 mb-3 text-sm">
                        <span className="text-amber-500 font-semibold">★ {rental.ratings.average.toFixed(1)}</span>
                        <span className="text-muted-foreground">({rental.ratings.count})</span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-extrabold text-primary">₹{rental.pricePerDay}</span>
                      <span className="text-xs text-muted-foreground">/day</span>
                    </div>
                    <Button className={`w-full gap-2 add-btn ${addedIds.has(rental._id) ? "add-btn-added" : ""}`}
                      disabled={rental.availability !== "available"} onClick={() => handleBook(rental)}>
                      {addedIds.has(rental._id) ? <><Check size={16} className="animate-bounce" /> Added</> : <><Calendar size={16} /> {rental.availability === "available" ? "Book Now" : "Unavailable"}</>}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No equipment found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4" style={{ background: "oklch(0.97 0.01 142)" }}>
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Process</span>
              <h2 className="text-4xl font-extrabold">How <span className="shimmer-text">Rental Works</span></h2>
            </div>
          </RevealSection>
          <div className="grid md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <RevealSection key={item.step} delay={i * 100}>
                <div className="how-step bg-white rounded-2xl p-7 text-center shadow-sm border border-border">
                  <div className="text-4xl mb-4">{item.emoji}</div>
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-md">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
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
