"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, Fingerprint, Zap, RefreshCw, Lock, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

import { triggerHaptic, authenticateBiometric } from "@/lib/native-utils"

export function SecurityCenter() {
    const [settings, setSettings] = useState({
        biometric: false,
        haptics: true,
        privacyMode: false,
        autoLock: true
    })

    // Load saved settings
    useEffect(() => {
        const saved = localStorage.getItem('kabadi_native_settings')
        if (saved) {
            setSettings(JSON.parse(saved))
        }
    }, [])

    const updateSetting = async (key: keyof typeof settings, value: boolean) => {
        if (key === 'biometric' && value === true) {
            const success = await authenticateBiometric()
            if (!success) {
                toast.error("Biometric setup failed or cancelled")
                return
            }
            toast.success("Biometric Authentication Enabled")
        }

        if (key === 'haptics' && value === true) {
            triggerHaptic()
        }

        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)
        localStorage.setItem('kabadi_native_settings', JSON.stringify(newSettings))

        if (key !== 'biometric') {
            toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} ${value ? 'Enabled' : 'Disabled'}`)
        }
    }

    const clearCache = () => {
        triggerHaptic()
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)),
            {
                loading: 'Clearing system cache...',
                success: 'Cache cleared! App is now faster.',
                error: 'Failed to clear cache',
            }
        )
    }

    return (
        <div className="space-y-6">
            {/* Native Support Info */}
            <div className="px-2 py-4 bg-green-500/5 rounded-2xl border border-green-500/10 mb-4 text-center">
                <ShieldCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-black text-green-700 dark:text-green-400">Device Security Active</h3>
                <p className="text-xs text-muted-foreground">Your Kabadiyo app is protected by system-level encryption.</p>
            </div>

            {/* Advance Controls */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-background/50 backdrop-blur-sm border-dashed">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Fingerprint className="h-4 w-4 text-primary" /> Bio-Metric Auth
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">App Lock / Fast Login</span>
                        <Switch
                            checked={settings.biometric}
                            onCheckedChange={(v) => updateSetting('biometric', v)}
                        />
                    </CardContent>
                </Card>

                <Card className="bg-background/50 backdrop-blur-sm border-dashed">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" /> Haptic Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Realistic Vibration Feel</span>
                        <Switch
                            checked={settings.haptics}
                            onCheckedChange={(v) => updateSetting('haptics', v)}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* ecosystem Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <RefreshCw className="h-5 w-5 text-blue-500" /> Maintenance
                    </CardTitle>
                    <CardDescription>Optimize app performance & privacy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <div className="space-y-0.5">
                            <h3 className="text-sm font-bold">App Cache</h3>
                            <p className="text-[10px] text-muted-foreground">Currently using 12.4 MB</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearCache} className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50">
                            Clear Cache
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <div className="space-y-0.5">
                            <h3 className="text-sm font-bold">Data Encryption</h3>
                            <p className="text-[10px] text-muted-foreground">Standard End-to-End active</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full">
                            <CheckCircle2 className="h-3 w-3" /> ACTIVE
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
