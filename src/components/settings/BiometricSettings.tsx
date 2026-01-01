"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Fingerprint } from "lucide-react"
import { useIsNativePlatform } from "@/hooks/useNativePlatform"

export function BiometricSettings() {
    const [enabled, setEnabled] = useState(false)
    const { isNative } = useIsNativePlatform()
    const [available, setAvailable] = useState(false)

    useEffect(() => {
        if (isNative) {
            checkAvailability()
            const saved = localStorage.getItem('biometric_enabled') === 'true'
            setEnabled(saved)
        }
    }, [isNative])

    const checkAvailability = async () => {
        try {
            const { NativeBiometric } = await import(/* webpackIgnore: true */ "capacitor-native-biometric")
            const result = await NativeBiometric.isAvailable()
            setAvailable(result.isAvailable)
        } catch (e) {
            console.log("Biometric check failed or not native", e)
            setAvailable(false)
        }
    }

    const toggleBiometric = async (checked: boolean) => {
        if (!available) {
            toast.error("Biometric hardware not available")
            return
        }

        if (checked) {
            try {
                const { NativeBiometric } = await import(/* webpackIgnore: true */ "capacitor-native-biometric")
                // Verify identity first
                await NativeBiometric.verifyIdentity({
                    reason: "Enable biometric authentication",
                    title: "Authenticate",
                    subtitle: "Scan your fingerprint or face",
                    description: "Verify your identity to enable biometric login"
                })
                setEnabled(true)
                localStorage.setItem('biometric_enabled', 'true')
                toast.success("Biometric authentication enabled")
            } catch (e) {
                console.error("Biometric auth failed", e)
                toast.error("Authentication failed. Try again.")
                setEnabled(false)
            }
        } else {
            setEnabled(false)
            localStorage.setItem('biometric_enabled', 'false')
            toast.success("Biometric authentication disabled")
        }
    }

    if (!isNative || !available) return null

    return (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mt-4">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Fingerprint className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="font-medium">Biometric Login</h3>
                    <p className="text-sm text-muted-foreground">Unlock app with fingerprint/face</p>
                </div>
            </div>
            <Switch
                checked={enabled}
                onCheckedChange={toggleBiometric}
            />
        </div>
    )
}
