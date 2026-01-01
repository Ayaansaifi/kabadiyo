"use client"

import { useState, useEffect } from "react"
import { useIsNativePlatform } from "@/hooks/useNativePlatform"
import { Lock, Fingerprint, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function BiometricLockGuard({ children }: { children: React.ReactNode }) {
    const { isNative } = useIsNativePlatform()
    const [isLocked, setIsLocked] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        // Initial check
        const checkLock = async () => {
            if (!isNative) {
                setChecking(false)
                return
            }

            // Small delay for seamless transition/splash effect in native app
            await new Promise(r => setTimeout(r, 800))

            const enabled = localStorage.getItem('biometric_enabled') === 'true'
            if (enabled) {
                setIsLocked(true)
                // Auto-trigger auth
                setTimeout(() => authenticate(), 300)
            }
            setChecking(false)
        }
        checkLock()
    }, [isNative])

    const authenticate = async () => {
        try {
            const { NativeBiometric } = await import(/* webpackIgnore: true */ "capacitor-native-biometric")

            const result = await NativeBiometric.verifyIdentity({
                reason: "Unlock Access",
                title: "Security Check",
                subtitle: "Confirm it's you",
                description: "Verify identity to access Kabadiyo"
            })

            // If we get here, success
            setIsLocked(false)
        } catch (e) {
            console.error("Auth failed", e)
            // Stays locked
        }
    }

    // Checking state - Show Premium Splash
    if (checking) {
        return (
            <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-green-900 to-emerald-950 flex flex-col items-center justify-center text-white">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-white/20">
                        <ShieldCheck className="h-12 w-12 text-emerald-400" />
                    </div>
                </motion.div>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-2xl tracking-widest">KABADIYO</span>
                </div>
                <p className="text-emerald-400/60 text-sm mt-2 tracking-widest uppercase">Secure Environment</p>

                <div className="absolute bottom-10 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.8 }}
                    />
                </div>
            </div>
        )
    }

    // Locked State - Show Professional Lock Screen
    if (isLocked) {
        return (
            <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-8">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-sm flex flex-col items-center"
                >
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-primary/20 animate-pulse">
                        <Lock className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">App Locked</h1>
                    <p className="text-muted-foreground mb-12 text-center text-lg">
                        This application is secured with biometric protection.
                    </p>
                    <Button
                        size="lg"
                        onClick={authenticate}
                        className="w-full rounded-2xl gap-3 text-lg h-16 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                    >
                        <Fingerprint className="h-6 w-6" />
                        Unlock Now
                    </Button>
                </motion.div>
            </div>
        )
    }

    return <>{children}</>
}
