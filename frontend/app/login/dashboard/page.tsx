"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLogin() {
  const router = useRouter()
  useEffect(() => { router.replace("/login") }, [router])
  return <div className="min-h-screen flex items-center justify-center"><p>Redirecting to login...</p></div>
}
