"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, Fingerprint, Zap, RefreshCw, Lock, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export function SecurityCenter() {
    const [score, setScore] = useState(0)
    const [isScanning, setIsScanning] = useState(false)
    const [settings, setSettings] = useState({
        biometric: false,
        haptics: true,
        privacyMode: false,
        autoLock: true
    })

    useEffect(() => {
        // Initial score calculation simulation
        let s = 65
        if (settings.biometric) s += 15
        if (settings.autoLock) s += 10
        if (settings.privacyMode) s += 10
        setScore(s)
    }, [settings])

    const runSecurityScan = () => {
        setIsScanning(true)
        setScore(0)
        let current = 0
        const interval = setInterval(() => {
            current += 5
            setScore(current)
            if (current >= 92) {
                clearInterval(interval)
                setIsScanning(false)
                toast.success("Security Scan Complete: Your app is 92% Secure!")
            }
        }, 50)
    }

    const clearCache = () => {
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
            {/* Security Pulse Header */}
            <Card className="overflow-hidden border-none bg-gradient-to-br from-green-600/10 to-emerald-600/5 shadow-inner">
                <CardContent className="p-8 flex flex-col items-center text-center">
                    <motion.div
                        animate={isScanning ? { scale: [1, 1.1, 1], rotate: [0, 180, 360] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${score > 80 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}
                    >
                        {score > 80 ? <ShieldCheck className="h-10 w-10" /> : <AlertTriangle className="h-10 w-10" />}
                    </motion.div>

                    <h2 className="text-3xl font-black mb-2">{score}% Secure</h2>
                    <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                        {isScanning ? "Scanning ecosystem for threats..." : "Overall security status of your Kabadiyo account."}
                    </p>

                    <Button
                        onClick={runSecurityScan}
                        disabled={isScanning}
                        className="rounded-full px-8 bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition-transform"
                    >
                        {isScanning ? "Scanning..." : "Run Security Audit"}
                    </Button>
                </CardContent>
            </Card>

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
                            onCheckedChange={(v) => setSettings(s => ({ ...s, biometric: v }))}
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
                            onCheckedChange={(v) => setSettings(s => ({ ...s, haptics: v }))}
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
