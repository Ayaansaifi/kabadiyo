/**
 * API Error Handling Utilities
 * Standardized error responses for all API routes
 */

import { NextResponse } from 'next/server'

// Error codes
export const ErrorCodes = {
    // Auth errors (1xxx)
    UNAUTHORIZED: 'AUTH_001',
    INVALID_CREDENTIALS: 'AUTH_002',
    SESSION_EXPIRED: 'AUTH_003',
    ACCOUNT_LOCKED: 'AUTH_004',
    TOO_MANY_ATTEMPTS: 'AUTH_005',
    INVALID_TOKEN: 'AUTH_006',

    // Validation errors (2xxx)
    VALIDATION_ERROR: 'VAL_001',
    MISSING_FIELD: 'VAL_002',
    INVALID_FORMAT: 'VAL_003',
    DUPLICATE_ENTRY: 'VAL_004',

    // Resource errors (3xxx)
    NOT_FOUND: 'RES_001',
    ALREADY_EXISTS: 'RES_002',
    FORBIDDEN: 'RES_003',

    // Server errors (5xxx)
    INTERNAL_ERROR: 'SRV_001',
    DATABASE_ERROR: 'SRV_002',
    EXTERNAL_SERVICE_ERROR: 'SRV_003',

    // Rate limiting (4xxx)
    RATE_LIMITED: 'RATE_001',
    CSRF_INVALID: 'RATE_002'
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

// Error messages in Hindi and English
const errorMessages: Record<ErrorCode, { en: string; hi: string }> = {
    AUTH_001: { en: 'Authentication required', hi: 'लॉगिन करना आवश्यक है' },
    AUTH_002: { en: 'Invalid credentials', hi: 'गलत लॉगिन जानकारी' },
    AUTH_003: { en: 'Session expired, please login again', hi: 'सत्र समाप्त, कृपया पुनः लॉगिन करें' },
    AUTH_004: { en: 'Account locked due to too many failed attempts', hi: 'बहुत अधिक गलत प्रयासों के कारण खाता लॉक' },
    AUTH_005: { en: 'Too many login attempts, try again later', hi: 'बहुत अधिक प्रयास, कुछ देर बाद प्रयास करें' },
    AUTH_006: { en: 'Invalid or expired token', hi: 'अमान्य या समाप्त टोकन' },

    VAL_001: { en: 'Validation error', hi: 'मान्यता त्रुटि' },
    VAL_002: { en: 'Required field missing', hi: 'आवश्यक फ़ील्ड गायब है' },
    VAL_003: { en: 'Invalid format', hi: 'अमान्य प्रारूप' },
    VAL_004: { en: 'Entry already exists', hi: 'प्रविष्टि पहले से मौजूद है' },

    RES_001: { en: 'Resource not found', hi: 'संसाधन नहीं मिला' },
    RES_002: { en: 'Resource already exists', hi: 'संसाधन पहले से मौजूद है' },
    RES_003: { en: 'Access forbidden', hi: 'पहुंच निषिद्ध' },

    SRV_001: { en: 'Something went wrong', hi: 'कुछ गलत हो गया' },
    SRV_002: { en: 'Database error', hi: 'डेटाबेस त्रुटि' },
    SRV_003: { en: 'External service error', hi: 'बाहरी सेवा त्रुटि' },

    RATE_001: { en: 'Too many requests, please slow down', hi: 'बहुत अधिक अनुरोध, कृपया धीमा करें' },
    RATE_002: { en: 'Security token invalid', hi: 'सुरक्षा टोकन अमान्य' }
}

export interface APIError {
    success: false
    error: {
        code: ErrorCode
        message: string
        messageHi: string
        details?: Record<string, unknown>
    }
}

export interface APISuccess<T = unknown> {
    success: true
    data: T
}

export type APIResponse<T = unknown> = APISuccess<T> | APIError

/**
 * Create error response
 */
export function createErrorResponse(
    code: ErrorCode,
    status: number = 400,
    details?: Record<string, unknown>
): NextResponse<APIError> {
    const messages = errorMessages[code] || { en: 'Unknown error', hi: 'अज्ञात त्रुटि' }

    return NextResponse.json(
        {
            success: false,
            error: {
                code,
                message: messages.en,
                messageHi: messages.hi,
                details
            }
        },
        { status }
    )
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse<APISuccess<T>> {
    return NextResponse.json(
        {
            success: true,
            data
        },
        { status }
    )
}

/**
 * Error response shortcuts
 */
export const ApiErrors = {
    unauthorized: () => createErrorResponse(ErrorCodes.UNAUTHORIZED, 401),
    invalidCredentials: () => createErrorResponse(ErrorCodes.INVALID_CREDENTIALS, 401),
    sessionExpired: () => createErrorResponse(ErrorCodes.SESSION_EXPIRED, 401),
    accountLocked: () => createErrorResponse(ErrorCodes.ACCOUNT_LOCKED, 403),
    tooManyAttempts: (retryAfter?: number) =>
        createErrorResponse(ErrorCodes.TOO_MANY_ATTEMPTS, 429, { retryAfter }),

    validationError: (fields?: string[]) =>
        createErrorResponse(ErrorCodes.VALIDATION_ERROR, 400, { fields }),
    missingField: (field: string) =>
        createErrorResponse(ErrorCodes.MISSING_FIELD, 400, { field }),
    invalidFormat: (field: string, expected?: string) =>
        createErrorResponse(ErrorCodes.INVALID_FORMAT, 400, { field, expected }),
    duplicateEntry: (field: string) =>
        createErrorResponse(ErrorCodes.DUPLICATE_ENTRY, 409, { field }),

    notFound: (resource?: string) =>
        createErrorResponse(ErrorCodes.NOT_FOUND, 404, { resource }),
    forbidden: () => createErrorResponse(ErrorCodes.FORBIDDEN, 403),

    internalError: () => createErrorResponse(ErrorCodes.INTERNAL_ERROR, 500),
    databaseError: () => createErrorResponse(ErrorCodes.DATABASE_ERROR, 500),

    rateLimited: (retryAfter: number) =>
        createErrorResponse(ErrorCodes.RATE_LIMITED, 429, { retryAfter }),
    csrfInvalid: () => createErrorResponse(ErrorCodes.CSRF_INVALID, 403)
}

/**
 * Wrap API handler with error handling
 */
export function withErrorHandling<T>(
    handler: (request: Request) => Promise<NextResponse<T>>
) {
    return async (request: Request): Promise<NextResponse<T> | NextResponse<APIError>> => {
        try {
            return await handler(request)
        } catch (error) {
            console.error('API Error:', error)

            if (error instanceof Error) {
                // Check for specific error types
                if (error.message.includes('not found')) {
                    return ApiErrors.notFound()
                }
                if (error.message.includes('duplicate') || error.message.includes('unique')) {
                    return ApiErrors.duplicateEntry('unknown')
                }
            }

            return ApiErrors.internalError()
        }
    }
}

/**
 * Log error for monitoring (can be extended to send to logging service)
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString()
    const errorData = {
        timestamp,
        error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : error,
        context
    }

    console.error('[ERROR]', JSON.stringify(errorData, null, 2))

    // TODO: Send to external logging service in production
    // if (process.env.NODE_ENV === 'production') {
    //     sendToLoggingService(errorData)
    // }
}
