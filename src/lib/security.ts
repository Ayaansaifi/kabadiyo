/**
 * Advanced Security Utilities for the Kabadiwala App
 * Enhanced with brute force protection, session security, and more
 */

import { encryptAES, decryptAES, generateHMAC, hashSHA256, generateSecureToken } from './crypto'

// ============================================
// XSS Prevention - HTML entity encoding
// ============================================
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

// ============================================
// SQL Injection prevention (Prisma handles this, but extra layer)
// ============================================
export function sanitizeForDb(input: string): string {
    if (!input) return ""
    return input
        .replace(/['\"\\;]/g, "") // Remove quotes, backslashes, semicolons
        .trim()
}

// ============================================
// Phone number masking
// ============================================
export function maskPhone(phone: string): string {
    if (!phone || phone.length < 10) return "**********"
    return phone.slice(0, 2) + "****" + phone.slice(-2)
}

// ============================================
// Message Encryption (Now using AES-256-GCM)
// ============================================
export async function encryptMessage(message: string): Promise<string> {
    return encryptAES(message)
}

export async function decryptMessage(encrypted: string): Promise<string> {
    return decryptAES(encrypted)
}

// Legacy sync versions for backward compatibility
export function encryptMessageSync(message: string): string {
    if (!message) return ""
    // Simple base64 for sync operations (async AES preferred)
    return Buffer.from(message).toString("base64")
}

export function decryptMessageSync(encrypted: string): string {
    if (!encrypted) return ""
    try {
        return Buffer.from(encrypted, "base64").toString("utf8")
    } catch {
        return encrypted
    }
}

// ============================================
// Advanced Session Fingerprinting
// ============================================
export interface SessionFingerprint {
    hash: string
    components: {
        ip: string
        userAgent: string
        acceptLanguage: string
        timezone: string
    }
}

export function generateAdvancedFingerprint(
    userAgent: string,
    ip: string,
    acceptLanguage: string = 'en',
    timezone: string = 'Asia/Kolkata'
): SessionFingerprint {
    const components = {
        ip: ip || 'unknown',
        userAgent: userAgent || 'unknown',
        acceptLanguage: acceptLanguage || 'en',
        timezone: timezone || 'UTC'
    }

    const data = `${components.userAgent}|${components.ip}|${components.acceptLanguage}|${components.timezone}`
    const hash = hashSHA256(data)

    return { hash, components }
}

// Simple fingerprint for backward compatibility
export function generateFingerprint(userAgent: string, ip: string): string {
    return generateAdvancedFingerprint(userAgent, ip).hash.slice(0, 16)
}

// ============================================
// Enhanced Password Strength Checker
// ============================================
export interface PasswordStrengthResult {
    score: number // 0-5
    level: 'weak' | 'fair' | 'good' | 'strong' | 'excellent'
    feedback: string[]
    feedbackHi: string[] // Hindi feedback
    isAcceptable: boolean
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
    const feedback: string[] = []
    const feedbackHi: string[] = []
    let score = 0

    // Length check
    if (password.length >= 8) {
        score++
    } else {
        feedback.push("Password should be at least 8 characters")
        feedbackHi.push("पासवर्ड कम से कम 8 अक्षर का होना चाहिए")
    }

    if (password.length >= 12) score += 0.5 // Bonus for longer passwords

    // Lowercase check
    if (/[a-z]/.test(password)) {
        score++
    } else {
        feedback.push("Add lowercase letters")
        feedbackHi.push("छोटे अक्षर जोड़ें")
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
        score++
    } else {
        feedback.push("Add uppercase letters")
        feedbackHi.push("बड़े अक्षर जोड़ें")
    }

    // Number check
    if (/[0-9]/.test(password)) {
        score++
    } else {
        feedback.push("Add numbers")
        feedbackHi.push("नंबर जोड़ें")
    }

    // Special character check
    if (/[^a-zA-Z0-9]/.test(password)) {
        score++
    } else {
        feedback.push("Add special characters (!@#$%)")
        feedbackHi.push("विशेष अक्षर जोड़ें (!@#$%)")
    }

    // Common patterns check (penalty)
    const commonPatterns = ['123456', 'password', 'qwerty', 'abc123', '111111', 'admin']
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
        score -= 1
        feedback.push("Avoid common patterns")
        feedbackHi.push("आम पैटर्न से बचें")
    }

    // Determine level
    let level: PasswordStrengthResult['level']
    if (score <= 1) level = 'weak'
    else if (score <= 2) level = 'fair'
    else if (score <= 3) level = 'good'
    else if (score <= 4) level = 'strong'
    else level = 'excellent'

    return {
        score: Math.min(5, Math.max(0, Math.floor(score))),
        level,
        feedback,
        feedbackHi,
        isAcceptable: score >= 3
    }
}

// ============================================
// Brute Force Protection with Exponential Backoff
// ============================================
interface LoginAttempt {
    count: number
    lastAttempt: number
    lockUntil: number | null
}

const loginAttempts = new Map<string, LoginAttempt>()

export interface BruteForceResult {
    allowed: boolean
    remainingAttempts: number
    lockoutRemaining: number // seconds until unlock
    message: string
    messageHi: string
}

const MAX_ATTEMPTS = 5
const BASE_LOCKOUT_MS = 60 * 1000 // 1 minute base
const MAX_LOCKOUT_MS = 30 * 60 * 1000 // 30 minutes max

export function checkBruteForce(identifier: string): BruteForceResult {
    const now = Date.now()
    const attempt = loginAttempts.get(identifier)

    if (!attempt) {
        loginAttempts.set(identifier, { count: 0, lastAttempt: now, lockUntil: null })
        return {
            allowed: true,
            remainingAttempts: MAX_ATTEMPTS,
            lockoutRemaining: 0,
            message: '',
            messageHi: ''
        }
    }

    // Check if locked
    if (attempt.lockUntil && now < attempt.lockUntil) {
        const remaining = Math.ceil((attempt.lockUntil - now) / 1000)
        return {
            allowed: false,
            remainingAttempts: 0,
            lockoutRemaining: remaining,
            message: `Account locked. Try again in ${remaining} seconds.`,
            messageHi: `खाता लॉक है। ${remaining} सेकंड बाद प्रयास करें।`
        }
    }

    // Reset if lock expired
    if (attempt.lockUntil && now >= attempt.lockUntil) {
        loginAttempts.set(identifier, { count: 0, lastAttempt: now, lockUntil: null })
        return {
            allowed: true,
            remainingAttempts: MAX_ATTEMPTS,
            lockoutRemaining: 0,
            message: '',
            messageHi: ''
        }
    }

    return {
        allowed: true,
        remainingAttempts: MAX_ATTEMPTS - attempt.count,
        lockoutRemaining: 0,
        message: '',
        messageHi: ''
    }
}

export function recordFailedAttempt(identifier: string): BruteForceResult {
    const now = Date.now()
    const attempt = loginAttempts.get(identifier) || { count: 0, lastAttempt: now, lockUntil: null }

    attempt.count++
    attempt.lastAttempt = now

    if (attempt.count >= MAX_ATTEMPTS) {
        // Exponential backoff: 1min, 2min, 4min, 8min...
        const lockoutMultiplier = Math.min(Math.pow(2, Math.floor(attempt.count / MAX_ATTEMPTS) - 1), 30)
        const lockoutDuration = Math.min(BASE_LOCKOUT_MS * lockoutMultiplier, MAX_LOCKOUT_MS)
        attempt.lockUntil = now + lockoutDuration

        loginAttempts.set(identifier, attempt)

        const remaining = Math.ceil(lockoutDuration / 1000)
        return {
            allowed: false,
            remainingAttempts: 0,
            lockoutRemaining: remaining,
            message: `Too many failed attempts. Locked for ${remaining} seconds.`,
            messageHi: `बहुत अधिक गलत प्रयास। ${remaining} सेकंड के लिए लॉक।`
        }
    }

    loginAttempts.set(identifier, attempt)

    return {
        allowed: true,
        remainingAttempts: MAX_ATTEMPTS - attempt.count,
        lockoutRemaining: 0,
        message: `${MAX_ATTEMPTS - attempt.count} attempts remaining`,
        messageHi: `${MAX_ATTEMPTS - attempt.count} प्रयास शेष`
    }
}

export function clearFailedAttempts(identifier: string): void {
    loginAttempts.delete(identifier)
}

// ============================================
// Rate Limiting
// ============================================
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

// ============================================
// Profanity Filter (expanded)
// ============================================
const profanityList = [
    "abuse", "spam", "fraud", "cheat", "scam", "fake",
    "stupid", "idiot", "fool", "damn", "crap", "sucks",
    // Add Hindi profanity words with caution
]

export function filterProfanity(text: string): string {
    let filtered = text
    profanityList.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, "gi")
        filtered = filtered.replace(regex, "***")
    })
    return filtered
}

// ============================================
// Validation Functions
// ============================================
export function validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, "")
    return /^[6-9]\d{9}$/.test(cleaned)
}

export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateOTP(otp: string): boolean {
    return /^\d{6}$/.test(otp)
}

export function validateName(name: string): boolean {
    return name.length >= 2 && name.length <= 100 && /^[a-zA-Z\s\u0900-\u097F]+$/.test(name)
}

// ============================================
// Login Activity Logging
// ============================================
export interface LoginActivity {
    id: string
    userId: string
    timestamp: Date
    ip: string
    userAgent: string
    location?: string
    success: boolean
    reason?: string
}

const loginActivityLog: LoginActivity[] = []

export function logLoginActivity(activity: Omit<LoginActivity, 'id' | 'timestamp'>): void {
    const entry: LoginActivity = {
        ...activity,
        id: generateSecureToken(8),
        timestamp: new Date()
    }

    loginActivityLog.push(entry)

    // Keep only last 1000 entries in memory
    if (loginActivityLog.length > 1000) {
        loginActivityLog.shift()
    }

    // TODO: In production, save to database
    console.log('[LOGIN_ACTIVITY]', JSON.stringify(entry))
}

export function getLoginActivity(userId: string, limit: number = 10): LoginActivity[] {
    return loginActivityLog
        .filter(a => a.userId === userId)
        .slice(-limit)
        .reverse()
}

// ============================================
// Session Security
// ============================================
export function generateSessionToken(): string {
    return generateSecureToken(32)
}

export function isValidSessionToken(token: string): boolean {
    return typeof token === 'string' && token.length === 64 && /^[a-f0-9]+$/.test(token)
}
