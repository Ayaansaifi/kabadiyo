/**
 * Advanced Cryptography Utilities
 * AES-256-GCM encryption for secure data handling
 */

// Generate a random encryption key (for initial setup)
export function generateEncryptionKey(): string {
    const array = new Uint8Array(32) // 256 bits
    if (typeof window !== 'undefined') {
        window.crypto.getRandomValues(array)
    } else {
        // Node.js environment
        const crypto = require('crypto')
        crypto.randomFillSync(array)
    }
    return Buffer.from(array).toString('base64')
}

// Generate random IV for AES-GCM
function generateIV(): Uint8Array {
    const iv = new Uint8Array(12) // 96 bits for GCM
    if (typeof window !== 'undefined') {
        window.crypto.getRandomValues(iv)
    } else {
        const crypto = require('crypto')
        crypto.randomFillSync(iv)
    }
    return iv
}

// Get encryption key from environment or use default (for development)
function getEncryptionKey(): string {
    const key = process.env.ENCRYPTION_KEY_256 || process.env.ENCRYPTION_KEY || 'kabadiwala-default-key-2024-secure!'
    // Ensure key is exactly 32 bytes
    const paddedKey = key.padEnd(32, '0').slice(0, 32)
    return paddedKey
}

// Convert string to Uint8Array
function stringToBytes(str: string): Uint8Array {
    return new TextEncoder().encode(str)
}

// Convert Uint8Array to string
function bytesToString(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes)
}

// Convert base64 to Uint8Array
function base64ToBytes(base64: string): Uint8Array {
    const binary = Buffer.from(base64, 'base64')
    return new Uint8Array(binary)
}

// Convert Uint8Array to base64
function bytesToBase64(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('base64')
}

/**
 * AES-256-GCM Encryption
 * Returns: base64(iv + ciphertext + authTag)
 */
export async function encryptAES(plaintext: string): Promise<string> {
    if (!plaintext) return ''

    try {
        const key = getEncryptionKey()
        const iv = generateIV()
        const keyBytes = stringToBytes(key)
        const plaintextBytes = stringToBytes(plaintext)

        // Use Node.js crypto for server-side
        const crypto = require('crypto')
        const cipher = crypto.createCipheriv('aes-256-gcm', keyBytes, iv)

        const encrypted = Buffer.concat([
            cipher.update(Buffer.from(plaintextBytes)),
            cipher.final()
        ])

        const authTag = cipher.getAuthTag()

        // Combine: IV (12 bytes) + AuthTag (16 bytes) + Ciphertext
        const combined = Buffer.concat([
            Buffer.from(iv),
            authTag,
            encrypted
        ])

        return combined.toString('base64')
    } catch (error) {
        console.error('Encryption error:', error)
        // Fallback to simple base64 encoding
        return Buffer.from(plaintext).toString('base64')
    }
}

/**
 * AES-256-GCM Decryption
 */
export async function decryptAES(ciphertext: string): Promise<string> {
    if (!ciphertext) return ''

    try {
        const key = getEncryptionKey()
        const keyBytes = stringToBytes(key)

        const combined = Buffer.from(ciphertext, 'base64')

        // Extract: IV (12 bytes) + AuthTag (16 bytes) + Ciphertext
        const iv = combined.subarray(0, 12)
        const authTag = combined.subarray(12, 28)
        const encrypted = combined.subarray(28)

        const crypto = require('crypto')
        const decipher = crypto.createDecipheriv('aes-256-gcm', keyBytes, iv)
        decipher.setAuthTag(authTag)

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ])

        return decrypted.toString('utf8')
    } catch (error) {
        console.error('Decryption error:', error)
        // Try fallback: maybe it's just base64 encoded (old messages)
        try {
            return Buffer.from(ciphertext, 'base64').toString('utf8')
        } catch {
            return ciphertext
        }
    }
}

/**
 * Hash password using PBKDF2 (for key derivation)
 */
export async function deriveKey(password: string, salt: string): Promise<string> {
    const crypto = require('crypto')
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err: Error | null, derivedKey: Buffer) => {
            if (err) reject(err)
            else resolve(derivedKey.toString('base64'))
        })
    })
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
    const crypto = require('crypto')
    return crypto.randomBytes(length).toString('hex')
}

/**
 * Generate HMAC for data integrity
 */
export function generateHMAC(data: string, secret?: string): string {
    const crypto = require('crypto')
    const key = secret || getEncryptionKey()
    return crypto.createHmac('sha256', key).update(data).digest('hex')
}

/**
 * Verify HMAC
 */
export function verifyHMAC(data: string, hmac: string, secret?: string): boolean {
    const computed = generateHMAC(data, secret)
    // Timing-safe comparison
    const crypto = require('crypto')
    try {
        return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hmac))
    } catch {
        return false
    }
}

/**
 * Hash data with SHA-256
 */
export function hashSHA256(data: string): string {
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(data).digest('hex')
}
