"use client"

/**
 * Utility for Haptic Feedback (Physical Clicks)
 */
export async function triggerHaptic() {
    try {
        const { Haptics, ImpactStyle } = await import("@capacitor/haptics")
        await Haptics.impact({ style: ImpactStyle.Medium })
    } catch (error) {
        // Fallback to Web Vibration API if Capacitor fails
        if (typeof window !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate(12)
        }
    }
}

/**
 * Utility for Biometric Authentication
 */
export async function authenticateBiometric(): Promise<boolean> {
    try {
        // @ts-ignore - plugin may not be installed in some environments
        const { NativeBiometric, BiometryType } = await import("@capacitor-community/native-biometric")

        const result = await NativeBiometric.isAvailable()
        if (!result.isAvailable) return false

        await NativeBiometric.verifyIdentity({
            reason: "Authenticate to access Kabadiyo Security Features",
            title: "Security Verification",
            subtitle: "Use fingerprint or face to continue",
            description: "Kabadiyo uses your device security to keep your data safe.",
            negativeButtonText: "Cancel",
        })
        return true
    } catch (error) {
        console.warn("Biometric authentication failed or not available:", error)
        // Fallback to password or just return true for "simulated success" in dev
        return false
    }
}

/**
 * Scroll to top with native feel
 */
export function scrollToTop() {
    if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }
}
