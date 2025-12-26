"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedInput, PasswordStrengthMeter, OTPInput } from "@/components/ui/enhanced-input"
import {
    Loader2, Smartphone, KeyRound, Shield, Fingerprint,
    ArrowRight, Sparkles, Eye, EyeOff, RefreshCw,
    Lock, Mail, Phone, Check
} from "lucide-react"
import { toast } from "sonner"
import { checkBruteForce, recordFailedAttempt, clearFailedAttempts } from "@/lib/security"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [mounted, setMounted] = useState(false)

    // Password login state
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)

    // OTP login state
    const [otpEmail, setOtpEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [otpSent, setOtpSent] = useState(false)
    const [countdown, setCountdown] = useState(0)

    // Security state
    const [attempts, setAttempts] = useState(5)
    const [isLocked, setIsLocked] = useState(false)
    const [lockTime, setLockTime] = useState(0)

    useEffect(() => {
        setMounted(true)
        // Check saved phone number
        const savedPhone = localStorage.getItem('kabadiwala_phone')
        if (savedPhone) {
            setPhone(savedPhone)
            setRememberMe(true)
        }
    }, [])

    // Countdown timer for lockout
    useEffect(() => {
        if (lockTime > 0) {
            const timer = setInterval(() => {
                setLockTime(prev => {
                    if (prev <= 1) {
                        setIsLocked(false)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [lockTime])

    async function handlePasswordLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        // Check brute force protection
        const bruteCheck = checkBruteForce(phone)
        if (!bruteCheck.allowed) {
            setIsLocked(true)
            setLockTime(bruteCheck.lockoutRemaining)
            setError(bruteCheck.messageHi)
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, password }),
            })

            let data
            try {
                const text = await res.text()
                try {
                    data = JSON.parse(text)
                } catch {
                    console.error("Failed to parse JSON response:", text)
                    throw new Error("Server Error: " + (res.statusText || "Unknown Error"))
                }
            } catch (e) {
                console.error("Network or Parse Error:", e)
                setError("सर्वर एरर / Server Error (Check Console)")
                return
            }

            if (res.ok) {
                // Clear failed attempts on success
                clearFailedAttempts(phone)

                // Save phone if remember me is checked
                if (rememberMe) {
                    localStorage.setItem('kabadiwala_phone', phone)
                } else {
                    localStorage.removeItem('kabadiwala_phone')
                }

                toast.success("लॉगिन सफल!", { description: "Login successful!" })
                router.push("/dashboard")
                router.refresh()
            } else {
                // Record failed attempt
                const result = recordFailedAttempt(phone)
                setAttempts(result.remainingAttempts)

                if (!result.allowed) {
                    setIsLocked(true)
                    setLockTime(result.lockoutRemaining)
                    setError(result.messageHi)
                } else {
                    setError(data.error || "गलत लॉगिन जानकारी / Invalid credentials")
                }
            }
        } catch (e) {
            console.error("Login Error:", e)
            setError("कुछ गलत हो गया / Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    async function handleRequestOTP() {
        if (!otpEmail || !otpEmail.includes("@")) {
            toast.error("कृपया सही ईमेल दर्ज करें", { description: "Enter a valid email address" })
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/otp-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "REQUEST", email: otpEmail }),
            })

            const data = await res.json()

            if (res.ok) {
                setOtpSent(true)
                toast.success("OTP भेजा गया!", { description: "OTP sent to your email!" })

                // Start countdown for resend
                setCountdown(60)
                const timer = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer)
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)
            } else {
                setError(data.error || "OTP भेजने में विफल / Failed to send OTP")
            }
        } catch {
            setError("कुछ गलत हो गया / Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    async function handleVerifyOTP(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!otp || otp.length !== 6) {
            toast.error("कृपया 6 अंकों का OTP दर्ज करें", { description: "Enter a 6-digit OTP" })
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/otp-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "VERIFY", email: otpEmail, otp }),
            })

            const data = await res.json()

            if (res.ok) {
                toast.success("लॉगिन सफल!", { description: "Login successful!" })

                // Redirection Logic based on Role
                if (data.user && data.user.role === "KABADIWALA") {
                    router.push("/dashboard")
                } else {
                    router.push("/") // Sellers/Users go to Home
                }

                router.refresh()
            } else {
                setError(data.error || "गलत OTP / Invalid OTP")
            }
        } catch {
            setError("कुछ गलत हो गया / Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 
                        bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 
                        dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Glassmorphism Card */}
                <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-white/50 dark:border-gray-700/50 shadow-2xl">
                    <CardHeader className="text-center space-y-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
                        >
                            <Shield className="h-8 w-8 text-white" />
                        </motion.div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-base">
                            Welcome back! Choose your login method
                        </CardDescription>
                    </CardHeader>

                    <Tabs defaultValue="password" className="w-full">
                        <div className="px-6">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 dark:bg-gray-800/50">
                                <TabsTrigger value="password" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                                    <KeyRound className="h-4 w-4" />
                                    Password
                                </TabsTrigger>
                                <TabsTrigger value="otp" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                                    <Smartphone className="h-4 w-4" />
                                    OTP
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Password Login Tab */}
                        <TabsContent value="password">
                            <form onSubmit={handlePasswordLogin}>
                                <CardContent className="space-y-5 pt-6">
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                                            >
                                                {error}
                                            </motion.div>
                                        )}

                                        {isLocked && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                                            >
                                                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                                    <Lock className="h-5 w-5" />
                                                    <span className="font-medium">Account Temporarily Locked</span>
                                                </div>
                                                <p className="text-sm text-orange-600/80 mt-1">
                                                    Try again in {lockTime} seconds
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="space-y-4">
                                        <AnimatedInput
                                            label="Phone Number"
                                            type="tel"
                                            icon={<Phone className="h-4 w-4" />}
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="9876543210"
                                            required
                                            minLength={10}
                                            disabled={isLocked}
                                        />

                                        <div className="space-y-2">
                                            <AnimatedInput
                                                label="Password"
                                                type="password"
                                                icon={<Lock className="h-4 w-4" />}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                                disabled={isLocked}
                                            />
                                        </div>
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm text-muted-foreground">Remember me</span>
                                        </label>
                                        <Link
                                            href="/reset-password"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>

                                    {/* Remaining attempts warning */}
                                    {attempts < 5 && attempts > 0 && (
                                        <p className="text-xs text-orange-500 text-center">
                                            ⚠️ {attempts} attempts remaining
                                        </p>
                                    )}
                                </CardContent>

                                <CardFooter className="flex flex-col gap-4">
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-medium gap-2 
                                                   bg-gradient-to-r from-green-600 to-emerald-600 
                                                   hover:from-green-700 hover:to-emerald-700
                                                   shadow-lg shadow-green-500/25"
                                        disabled={loading || isLocked}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                Login
                                                <ArrowRight className="h-5 w-5" />
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-sm text-muted-foreground text-center">
                                        Don't have an account?{" "}
                                        <Link href="/register" className="text-primary font-medium hover:underline">
                                            Register
                                        </Link>
                                    </p>
                                </CardFooter>
                            </form>
                        </TabsContent>

                        {/* OTP Login Tab */}
                        <TabsContent value="otp">
                            {!otpSent ? (
                                <CardContent className="space-y-5 pt-6">
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg"
                                            >
                                                {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <AnimatedInput
                                        label="Email Address"
                                        type="email"
                                        icon={<Mail className="h-4 w-4" />}
                                        value={otpEmail}
                                        onChange={(e) => setOtpEmail(e.target.value)}
                                        placeholder="hello@example.com"
                                    />

                                    <Button
                                        type="button"
                                        className="w-full h-12 text-base font-medium gap-2
                                                   bg-gradient-to-r from-green-600 to-emerald-600 
                                                   hover:from-green-700 hover:to-emerald-700
                                                   shadow-lg shadow-green-500/25"
                                        disabled={loading}
                                        onClick={handleRequestOTP}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Sparkles className="h-5 w-5" />
                                                Send OTP
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-sm text-muted-foreground text-center">
                                        We will send a 6-digit code to your email
                                    </p>
                                </CardContent>
                            ) : (
                                <form onSubmit={handleVerifyOTP}>
                                    <CardContent className="space-y-5 pt-6">
                                        <AnimatePresence>
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg"
                                                >
                                                    {error}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="text-center mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                OTP sent to: <span className="font-medium text-foreground">{otpEmail}</span>
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-center block">
                                                Enter OTP
                                            </label>
                                            <OTPInput
                                                value={otp}
                                                onChange={setOtp}
                                                length={6}
                                                error={!!error}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-12 text-base font-medium gap-2
                                                       bg-gradient-to-r from-green-600 to-emerald-600"
                                            disabled={loading || otp.length !== 6}
                                        >
                                            {loading ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Shield className="h-5 w-5" />
                                                    Verify
                                                </>
                                            )}
                                        </Button>

                                        <div className="text-center space-y-2">
                                            {countdown > 0 ? (
                                                <p className="text-sm text-muted-foreground">
                                                    Resend in {countdown} seconds
                                                </p>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleRequestOTP}
                                                    disabled={loading}
                                                    className="gap-2"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                    Resend OTP
                                                </Button>
                                            )}

                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => {
                                                    setOtpSent(false)
                                                    setOtp("")
                                                    setError("")
                                                }}
                                            >
                                                Change Email
                                            </Button>
                                        </div>
                                    </CardContent>
                                </form>
                            )}

                            <CardFooter className="flex flex-col gap-4">
                                <p className="text-sm text-muted-foreground text-center">
                                    Don't have an account?{" "}
                                    <Link href="/register" className="text-primary font-medium hover:underline">
                                        Register
                                    </Link>
                                </p>
                            </CardFooter>
                        </TabsContent>
                    </Tabs>

                    {/* Security Badge */}
                    <div className="px-6 pb-6">
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Shield className="h-3 w-3 text-green-500" />
                            <span>Secured with AES-256 Encryption</span>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
