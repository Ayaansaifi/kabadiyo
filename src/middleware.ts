/**
 * Middleware
 * ----------
 * Handles rate limiting and security headers.
 * NextAuth session handling is done through auth() in route handlers.
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

// Rate limiting storage (in-memory for demo, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = 100 // requests
const RATE_WINDOW = 60 * 1000 // 1 minute

export default auth((req) => {
    const request = req as unknown as NextRequest // Cast to NextRequest for consistency

    // 1. Auth Guard is handled by authConfig before we get here? 
    // Actually, 'auth' middleware runs 'authorized' callback. 
    // If 'authorized' returns false, it redirects automatically. 
    // If true, it executes this function.

    // 2. Existing Middleware Logic (Rate Limit + Headers)

    // Skip static files and assets logic is handled by matcher in config usually,
    // but we can keep the check if needed.
    if (
        request.nextUrl.pathname.startsWith("/_next") ||
        request.nextUrl.pathname.startsWith("/static") ||
        request.nextUrl.pathname.includes(".")
    ) {
        return NextResponse.next()
    }

    // Get client IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("x-real-ip") ||
        "unknown"

    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()

    // Rate limiting for API routes
    if (request.nextUrl.pathname.startsWith("/api")) {
        const record = rateLimitMap.get(key)

        if (!record || now > record.resetTime) {
            rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW })
        } else if (record.count >= RATE_LIMIT) {
            const resetIn = Math.ceil((record.resetTime - now) / 1000)
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": resetIn.toString(),
                        "X-RateLimit-Limit": RATE_LIMIT.toString(),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": record.resetTime.toString()
                    }
                }
            )
        } else {
            record.count++
        }
    }

    // Add security headers
    const response = NextResponse.next()

    // Prevent XSS
    response.headers.set("X-XSS-Protection", "1; mode=block")

    // Prevent clickjacking
    response.headers.set("X-Frame-Options", "DENY")

    // Prevent MIME sniffing
    response.headers.set("X-Content-Type-Options", "nosniff")

    // Referrer policy
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

    // Content Security Policy (basic)
    response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:;"
    )

    // Strict Transport Security (HSTS)
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
    )

    return response
})

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - rewards (rewards page)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
}
