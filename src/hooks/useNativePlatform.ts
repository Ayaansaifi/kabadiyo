"use client"

import { useState, useEffect } from "react"

/**
 * Hook to detect if running inside Capacitor native app (Android/iOS)
 * Returns false on website, true in app
 */
export function useIsNativePlatform() {
    const [isNative, setIsNative] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkPlatform = async () => {
            try {
                const { Capacitor } = await import(/* webpackIgnore: true */ "@capacitor/core")
                setIsNative(Capacitor.isNativePlatform())
            } catch {
                // Capacitor not available (running on web)
                setIsNative(false)
            } finally {
                setIsLoading(false)
            }
        }
        checkPlatform()
    }, [])

    return { isNative, isLoading }
}

/**
 * Sync version for server components (always returns false)
 * Use this only when you can't use the hook
 */
export function checkIsNativePlatform(): boolean {
    if (typeof window === "undefined") return false
    try {
        // @ts-ignore - Capacitor may not be loaded
        return window.Capacitor?.isNativePlatform?.() || false
    } catch {
        return false
    }
}
