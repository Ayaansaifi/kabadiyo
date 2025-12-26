/**
 * CSRF Protection Utilities
 * Double-submit cookie pattern with HMAC verification
 */

import { cookies } from 'next/headers'
import { generateSecureToken, generateHMAC, verifyHMAC } from './crypto'

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour

interface CSRFToken {
    token: string
    timestamp: number
}

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
    const timestamp = Date.now()
    const randomToken = generateSecureToken(16)
    const data = `${randomToken}:${timestamp}`
    const hmac = generateHMAC(data)
    return `${data}:${hmac}`
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(token: string): boolean {
    if (!token) return false

    try {
        const parts = token.split(':')
        if (parts.length !== 3) return false

        const [randomToken, timestampStr, hmac] = parts
        const timestamp = parseInt(timestampStr, 10)

        // Check expiry
        if (Date.now() - timestamp > CSRF_TOKEN_EXPIRY) {
            return false
        }

        // Verify HMAC
        const data = `${randomToken}:${timestampStr}`
        return verifyHMAC(data, hmac)
    } catch {
        return false
    }
}

/**
 * Set CSRF cookie (server-side)
 */
export async function setCSRFCookie(): Promise<string> {
    const token = generateCSRFToken()
    const cookieStore = await cookies()

    cookieStore.set(CSRF_COOKIE_NAME, token, {
        httpOnly: false, // Needs to be readable by JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: CSRF_TOKEN_EXPIRY / 1000,
        path: '/'
    })

    return token
}

/**
 * Get CSRF token from cookie
 */
export async function getCSRFFromCookie(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get(CSRF_COOKIE_NAME)?.value || null
}

/**
 * Validate CSRF from request headers against cookie
 */
export async function validateCSRFRequest(request: Request): Promise<boolean> {
    const headerToken = request.headers.get(CSRF_HEADER_NAME)
    const cookieStore = await cookies()
    const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value

    if (!headerToken || !cookieToken) {
        return false
    }

    // Tokens must match
    if (headerToken !== cookieToken) {
        return false
    }

    // Validate token format and expiry
    return validateCSRFToken(headerToken)
}

/**
 * CSRF middleware helper for API routes
 */
export async function csrfProtection(request: Request): Promise<{ valid: boolean; error?: string }> {
    // Skip CSRF for GET, HEAD, OPTIONS
    const method = request.method.toUpperCase()
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        return { valid: true }
    }

    const isValid = await validateCSRFRequest(request)

    if (!isValid) {
        return {
            valid: false,
            error: 'Invalid or expired CSRF token'
        }
    }

    return { valid: true }
}

/**
 * Client-side: Get CSRF token for forms
 */
export function getCSRFTokenFromMeta(): string | null {
    if (typeof document === 'undefined') return null
    const meta = document.querySelector('meta[name="csrf-token"]')
    return meta?.getAttribute('content') || null
}

/**
 * Client-side: Add CSRF token to fetch headers
 */
export function withCSRF(options: RequestInit = {}): RequestInit {
    const token = getCSRFTokenFromMeta() || getCookie(CSRF_COOKIE_NAME)

    return {
        ...options,
        headers: {
            ...options.headers,
            [CSRF_HEADER_NAME]: token || ''
        }
    }
}

/**
 * Helper to get cookie value on client side
 */
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null
    }
    return null
}
