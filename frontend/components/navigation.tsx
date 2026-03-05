"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, User, ShoppingCart, Heart } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"

/* ─── Brand logo mark (SVG leaf + sprout) ─── */
function LogoMark() {
  return (
    <div className="relative flex-shrink-0" style={{ width: 42, height: 42 }}>
      <div className="absolute inset-0 rounded-[14px] shadow-lg"
        style={{ background: "linear-gradient(145deg, #16a34a 0%, #065f46 100%)" }} />
      {/* Leaf SVG */}
      <svg viewBox="0 0 42 42" className="absolute inset-0 w-full h-full" fill="none">
        {/* stem */}
        <path d="M21 34 L21 20" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" />
        {/* left leaf */}
        <path d="M21 22 C17 18 12 16 11 11 C16 10 20 14 21 18" fill="rgba(255,255,255,0.9)" />
        {/* right leaf */}
        <path d="M21 26 C25 22 30 20 31 15 C26 14 22 18 21 22" fill="rgba(255,255,255,0.75)" />
        {/* top sprout */}
        <circle cx="21" cy="10" r="3" fill="rgba(255,255,255,0.95)" />
      </svg>
    </div>
  )
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/rentals", label: "Rentals" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, loading, logout } = useAuth()
  const { totalItems, toggleCart } = useCart()
  const router = useRouter()

  const handleLogout = () => { logout(); router.push("/") }
  const getDashboardLink = () => {
    if (!user) return "/dashboard"
    if (user.role === "admin") return "/admin"
    if (user.role === "seller") return "/seller"
    return "/dashboard"
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-border/60 backdrop-blur-md"
      style={{ background: "rgba(255,255,255,0.94)" }}>
      <style>{`
        .nav-link { position:relative; font-weight:500; font-size:.875rem; color:oklch(0.35 0 0); transition:color .2s ease; }
        .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; right:0; height:2px; background:linear-gradient(90deg,oklch(0.45 0.15 142),oklch(0.6 0.15 142)); border-radius:9999px; transform:scaleX(0); transform-origin:center; transition:transform .2s ease; }
        .nav-link:hover { color:oklch(0.4 0.15 142); }
        .nav-link:hover::after { transform:scaleX(1); }
        .brand-name { font-size:1.25rem; font-weight:900; letter-spacing:-0.03em; background:linear-gradient(110deg,#166534 0%,#16a34a 50%,#4ade80 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .cart-btn { position:relative; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:background .2s ease,transform .15s ease; }
        .cart-btn:hover { background:oklch(0.95 0.03 142); transform:scale(1.08); }
        .login-btn { transition:transform .15s ease,box-shadow .2s ease; }
        .login-btn:hover { transform:translateY(-1px); box-shadow:0 4px 14px rgba(22,163,74,.25); }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[70px]">

          {/* ── Brand ── */}
          <Link href="/" className="flex items-center gap-3">
            <LogoMark />
            <div className="hidden sm:flex flex-col gap-0 leading-none">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="brand-name">Agri Mart</span>
                <span className="text-sm font-semibold" style={{ color: "oklch(0.45 0.12 142)" }}>– The Farmer's Hub</span>
              </div>
              <span className="text-[10px] tracking-[0.18em] uppercase font-semibold mt-0.5"
                style={{ color: "oklch(0.55 0.12 142)" }}>
                🌱 Grow. Harvest. Thrive.
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
            ))}
          </div>

          {/* ── Auth + Cart ── */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && (
              <Link href="/wishlist" className="cart-btn" aria-label="My Wishlist">
                <Heart size={19} />
              </Link>
            )}
            <button onClick={toggleCart} className="cart-btn" aria-label="Open cart">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ background: "linear-gradient(135deg,#16a34a,#065f46)" }}>
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            {loading ? (
              <div className="w-20 h-9 bg-muted animate-pulse rounded-full" />
            ) : isAuthenticated && user ? (
              <>
                <Link href={getDashboardLink()}
                  className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-primary/10 hover:text-primary transition"
                  style={{ color: "oklch(0.4 0.12 142)" }}>
                  <User size={15} /> {user.name}
                </Link>
                <Button variant="outline" size="sm" className="rounded-full" onClick={handleLogout}>
                  <LogOut size={14} className="mr-1" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild className="rounded-full login-btn">
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild className="rounded-full login-btn shadow-sm">
                  <Link href="/signup">Sign Up →</Link>
                </Button>
              </>
            )}
          </div>

          {/* ── Mobile: Cart + Hamburger ── */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleCart} className="cart-btn" aria-label="Open cart">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ background: "linear-gradient(135deg,#16a34a,#065f46)" }}>
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu"
              className="p-2 rounded-lg hover:bg-secondary transition">
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {isOpen && (
          <div className="md:hidden pb-5 pt-2 space-y-1 border-t border-border/50 mt-1">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/8 hover:text-primary transition"
                onClick={() => setIsOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 px-4 pt-3">
              {isAuthenticated && user ? (
                <>
                  <Button variant="outline" asChild className="flex-1 rounded-full">
                    <Link href={getDashboardLink()}>Dashboard</Link>
                  </Button>
                  <Button className="flex-1 rounded-full" onClick={handleLogout}>Logout</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="flex-1 rounded-full">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="flex-1 rounded-full">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
