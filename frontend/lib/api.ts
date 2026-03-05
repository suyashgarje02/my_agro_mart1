const API_BASE = "https://agro-mart1-backend.onrender.com/api"

export class ApiError extends Error {
    status: number
    errors?: string[]

    constructor(message: string, status: number, errors?: string[]) {
        super(message)
        this.status = status
        this.errors = errors
    }
}

export async function apiFetch<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token =
        typeof window !== "undefined" ? localStorage.getItem("agro_token") : null

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    })

    const data = await res.json()

    if (!res.ok || data.success === false) {
        throw new ApiError(
            data.message || "Something went wrong",
            res.status,
            data.errors
        )
    }

    return data
}

// Convenience methods
export const api = {
    get: <T = any>(endpoint: string) => apiFetch<T>(endpoint),

    post: <T = any>(endpoint: string, body: any) =>
        apiFetch<T>(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        }),

    put: <T = any>(endpoint: string, body: any) =>
        apiFetch<T>(endpoint, {
            method: "PUT",
            body: JSON.stringify(body),
        }),

    delete: <T = any>(endpoint: string) =>
        apiFetch<T>(endpoint, { method: "DELETE" }),
}
