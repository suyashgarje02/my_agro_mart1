"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

interface User {
    id: string
    name: string
    email: string
    role: "user" | "seller" | "admin"
    phone?: string
    userType?: string
    farmSize?: string
    location?: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    loading: boolean
    login: (email: string, password: string) => Promise<User>
    register: (data: RegisterData) => Promise<User>
    logout: () => void
    updateUser: (data: Partial<User>) => void
}

interface RegisterData {
    name: string
    email: string
    password: string
    phone?: string
    userType?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Load user on mount
    useEffect(() => {
        const savedToken = localStorage.getItem("agro_token")
        if (savedToken) {
            setToken(savedToken)
            fetchUser(savedToken)
        } else {
            setLoading(false)
        }
    }, [])

    const fetchUser = async (t: string) => {
        try {
            const res = await api.get("/auth/me")
            setUser(res.data)
            setToken(t)
        } catch {
            localStorage.removeItem("agro_token")
            setToken(null)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const login = useCallback(async (email: string, password: string): Promise<User> => {
        const res = await api.post("/auth/login", { email, password })
        const { user: userData, token: newToken } = res.data
        localStorage.setItem("agro_token", newToken)
        setToken(newToken)
        setUser(userData)
        return userData
    }, [])

    const register = useCallback(async (data: RegisterData): Promise<User> => {
        const res = await api.post("/auth/register", data)
        const { user: userData, token: newToken } = res.data
        localStorage.setItem("agro_token", newToken)
        setToken(newToken)
        setUser(userData)
        return userData
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem("agro_token")
        setToken(null)
        setUser(null)
    }, [])

    const updateUser = useCallback((data: Partial<User>) => {
        setUser((prev) => (prev ? { ...prev, ...data } : null))
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                loading,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
