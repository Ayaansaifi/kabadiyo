// Security utilities for the Kabadiwala app

// XSS Prevention - HTML entity encoding
export function sanitizeInput(input: string): string {
    if (!input) return ""
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;")
}

// SQL Injection prevention (Prisma handles this, but extra layer)
export function sanitizeForDb(input: string): string {
    if (!input) return ""
    return input
        .replace(/['"\\;]/g, "") // Remove quotes, backslashes, semicolons
        .trim()
}

// Phone number masking
export function maskPhone(phone: string): string {
    if (!phone || phone.length < 10) return "**********"
    return phone.slice(0, 2) + "****" + phone.slice(-2)
}

// Simple encryption for messages (using Base64 + XOR for demo)
// In production, use proper AES-256 encryption
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "kabadiwala-secret-key-2024"

export function encryptMessage(message: string): string {
    if (!message) return ""
    let encrypted = ""
    for (let i = 0; i < message.length; i++) {
        encrypted += String.fromCharCode(
            message.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
        )
    }
    return Buffer.from(encrypted).toString("base64")
}

export function decryptMessage(encrypted: string): string {
    if (!encrypted) return ""
    try {
        const decoded = Buffer.from(encrypted, "base64").toString()
        let decrypted = ""
        for (let i = 0; i < decoded.length; i++) {
            decrypted += String.fromCharCode(
                decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
            )
        }
        return decrypted
    } catch {
        return encrypted // Return as-is if decryption fails
    }
}

// Session fingerprint (device + IP hash)
export function generateFingerprint(userAgent: string, ip: string): string {
    const data = `${userAgent}|${ip}`
    let hash = 0
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16)
}

// Password strength checker
export function checkPasswordStrength(password: string): {
    score: number
    feedback: string[]
} {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score++
    else feedback.push("Password should be at least 8 characters")

    if (/[a-z]/.test(password)) score++
    else feedback.push("Add lowercase letters")

    if (/[A-Z]/.test(password)) score++
    else feedback.push("Add uppercase letters")

    if (/[0-9]/.test(password)) score++
    else feedback.push("Add numbers")

    if (/[^a-zA-Z0-9]/.test(password)) score++
    else feedback.push("Add special characters")

    return { score, feedback }
}

// Rate limiting check
export interface RateLimitResult {
    allowed: boolean
    remaining: number
    resetIn: number // seconds
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000
): RateLimitResult {
    const now = Date.now()
    const key = identifier
    const record = rateLimitStore.get(key)

    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
        return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs / 1000 }
    }

    if (record.count >= maxRequests) {
        const resetIn = Math.ceil((record.resetTime - now) / 1000)
        return { allowed: false, remaining: 0, resetIn }
    }

    record.count++
    return {
        allowed: true,
        remaining: maxRequests - record.count,
        resetIn: Math.ceil((record.resetTime - now) / 1000)
    }
}

// Profanity filter (expanded)
const profanityList = [
    "abuse", "spam", "fraud", "cheat", "scam", "fake",
    "stupid", "idiot", "fool", "damn", "crap", "sucks"
]

export function filterProfanity(text: string): string {
    let filtered = text
    profanityList.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, "gi")
        filtered = filtered.replace(regex, "***")
    })
    return filtered
}

// Validate phone number (Indian format)
export function validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, "")
    return /^[6-9]\d{9}$/.test(cleaned)
}

// Validate email
export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
