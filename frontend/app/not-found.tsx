"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function NotFound() {
    const [visible, setVisible] = useState(false)
    useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t) }, [])

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center overflow-hidden"
            style={{ background: "linear-gradient(135deg, oklch(0.98 0.02 142) 0%, oklch(0.93 0.05 142) 50%, oklch(0.95 0.04 70) 100%)" }}>
            <style>{`
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        @keyframes blob{0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}}
        .shimmer-text{background:linear-gradient(90deg,oklch(0.45 0.15 142) 0%,#6ee7b7 40%,oklch(0.45 0.15 142) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite;}
        .blob-shape{animation:blob 8s ease-in-out infinite;}
        .floating{animation:float 3s ease-in-out infinite;}
        .btn-home{transition:transform .15s ease,box-shadow .2s ease;background:linear-gradient(135deg,oklch(0.45 0.15 142),oklch(0.35 0.12 142));color:white;border-radius:9999px;padding:.75rem 2rem;font-weight:700;font-size:.95rem;}
        .btn-home:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(34,197,94,.35);}
        .btn-outline{transition:transform .15s ease,box-shadow .2s ease;border:2px solid oklch(0.45 0.15 142);color:oklch(0.4 0.15 142);border-radius:9999px;padding:.75rem 2rem;font-weight:700;font-size:.95rem;}
        .btn-outline:hover{transform:translateY(-2px);background:oklch(0.45 0.15 142);color:white;}
      `}</style>

            {/* Background blobs */}
            <div className="fixed -top-20 -right-20 w-80 h-80 rounded-full blob-shape opacity-20 pointer-events-none" style={{ background: "oklch(0.65 0.15 142)" }} />
            <div className="fixed -bottom-10 -left-10 w-56 h-56 rounded-full blob-shape opacity-15 pointer-events-none" style={{ background: "oklch(0.65 0.12 70)", animationDelay: "3s" }} />

            <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity .7s ease, transform .7s ease" }}>
                {/* Tractor icon */}
                <div className="floating text-8xl mb-6 select-none">🚜</div>

                {/* 404 number */}
                <h1 className="text-[120px] font-black leading-none mb-2 shimmer-text">404</h1>

                <h2 className="text-2xl font-extrabold mb-3 text-foreground">Oops! Field Not Found</h2>
                <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto leading-relaxed">
                    Looks like this page wandered off into the fields. Let's get you back on track!
                </p>

                <div className="flex gap-4 justify-center flex-wrap">
                    <Link href="/" className="btn-home">🌿 Go to Home</Link>
                    <Link href="/products" className="btn-outline">Browse Products</Link>
                </div>

                {/* Quick links */}
                <div className="mt-10 flex gap-6 justify-center text-sm text-muted-foreground">
                    {[["Rentals", "/rentals"], ["About", "/about"], ["Contact", "/contact"]].map(([l, h]) => (
                        <Link key={h} href={h} className="hover:text-primary transition underline-offset-4 hover:underline">{l}</Link>
                    ))}
                </div>
            </div>
        </main>
    )
}
