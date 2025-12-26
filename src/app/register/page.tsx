"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedInput, PasswordStrengthMeter, OTPInput, StepProgress } from "@/components/ui/enhanced-input"
import {
    Loader2, User, Recycle, Phone, Mail, Lock,
    ArrowRight, ArrowLeft, Building2, MapPin,
    Shield, Check, Sparkles, UserPlus
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Role = "USER" | "KABADIWALA"

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [mounted, setMounted] = useState(false)

    // Multi-step state
    const [step, setStep] = useState(0)
    const totalSteps = 3

    // Form fields
    const [role, setRole] = useState<Role>("USER")
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [businessName, setBusinessName] = useState("")
    const [serviceArea, setServiceArea] = useState("")

    // OTP verification
    const [showOtp, setShowOtp] = useState(false)
    const [registeredEmail, setRegisteredEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [countdown, setCountdown] = useState(0)

    // Terms acceptance
    const [acceptTerms, setAcceptTerms] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // OTP countdown
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const stepLabels = role === "KABADIWALA"
        ? ["Role", "Info", "Business"]
        : ["Role", "Info", "Password"]

    const canProceedStep0 = role !== null
    const canProceedStep1 = name.length >= 2 && phone.length >= 10 && email.includes("@")
    const canProceedStep2 = password.length >= 6 && password === confirmPassword && acceptTerms &&
        (role === "USER" || (businessName.length >= 2 && serviceArea.length >= 2))

    const nextStep = () => {
        if (step < totalSteps - 1) {
            setStep(step + 1)
            setError("")
        }
    }

    const prevStep = () => {
        if (step > 0) {
            setStep(step - 1)
            setError("")
        }
    }

    async function handleSubmit() {
        // Validate password match
        if (password !== confirmPassword) {
            setError("पासवर्ड मेल नहीं खाते / Passwords don't match")
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    phone,
                    email,
                    password,
                    role,
                    businessName: role === "KABADIWALA" ? businessName : undefined,
                    serviceArea: role === "KABADIWALA" ? serviceArea : undefined
                }),
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
                if (data.requireVerification) {
                    setRegisteredEmail(data.email)
                    setShowOtp(true)
                    setCountdown(60)
                    toast.success("खाता बनाया गया!", { description: "Please verify your email." })
                } else {
                    toast.success("रजिस्ट्रेशन सफल!", { description: "Registration successful!" })
                    router.push("/login")
                }
            } else {
                setError(data.error || "रजिस्ट्रेशन विफल / Registration failed")
            }
        } catch (e) {
            console.error("Registration Error:", e)
            setError("कुछ गलत हो गया / Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    async function handleVerifyOtp(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "VERIFY",
                    email: registeredEmail,
                    otp: otp,
                }),
            })

            const data = await res.json()

            if (res.ok) {
                toast.success("ईमेल सत्यापित!", { description: "Email Verified! You can now login." })
                router.push("/dashboard")
            } else {
                setError(data.error || "सत्यापन विफल / Verification failed")
            }
        } catch {
            setError("कुछ गलत हो गया / Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    async function resendOtp() {
        setLoading(true)
        try {
            const res = await fetch("/api/otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "REQUEST",
                    email: registeredEmail,
                }),
            })

            if (res.ok) {
                setCountdown(60)
                toast.success("OTP पुनः भेजा गया!", { description: "OTP sent again!" })
            }
        } catch {
            toast.error("OTP भेजने में विफल")
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

    // OTP Verification Screen
    if (showOtp) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-8
                            bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 
                            dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-white/50 shadow-2xl">
                        <CardHeader className="text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4"
                            >
                                <Mail className="h-8 w-8 text-white" />
                            </motion.div>
                            <CardTitle className="text-2xl">ईमेल सत्यापित करें</CardTitle>
                            <CardDescription>Verify Email</CardDescription>
                            <p className="text-sm text-muted-foreground mt-2">
                                OTP भेजा गया: <span className="font-medium">{registeredEmail}</span>
                            </p>
                        </CardHeader>

                        <form onSubmit={handleVerifyOtp}>
                            <CardContent className="space-y-6">
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

                                <OTPInput
                                    value={otp}
                                    onChange={setOtp}
                                    length={6}
                                    error={!!error}
                                />

                                <div className="text-center">
                                    {countdown > 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            {countdown} सेकंड में पुनः भेजें
                                        </p>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={resendOtp}
                                            disabled={loading}
                                        >
                                            OTP पुनः भेजें
                                        </Button>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600"
                                    disabled={loading || otp.length !== 6}
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="h-5 w-5 mr-2" />
                                            सत्यापित करें / Verify
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </motion.div>
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
                className="w-full max-w-md relative z-10"
            >
                <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-white/50 shadow-2xl">
                    <CardHeader className="text-center space-y-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
                        >
                            <UserPlus className="h-8 w-8 text-white" />
                        </motion.div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            Create New Account
                        </CardTitle>
                        <CardDescription className="text-base">
                            Create your account
                        </CardDescription>
                    </CardHeader>

                    {/* Progress Indicator */}
                    <div className="px-6 mb-4">
                        <StepProgress
                            currentStep={step}
                            totalSteps={totalSteps}
                            labels={stepLabels}
                        />
                    </div>

                    <CardContent className="space-y-5">
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

                        {/* Step 0: Role Selection */}
                        <AnimatePresence mode="wait">
                            {step === 0 && (
                                <motion.div
                                    key="step0"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <p className="text-center text-muted-foreground mb-4">
                                        Who are you?
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setRole("USER")}
                                            className={cn(
                                                "p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3",
                                                role === "USER"
                                                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-14 h-14 rounded-full flex items-center justify-center",
                                                role === "USER"
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                            )}>
                                                <User className="h-7 w-7" />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-medium">Sell Scrap</p>
                                                <p className="text-xs text-muted-foreground">I want to sell scrap</p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setRole("KABADIWALA")}
                                            className={cn(
                                                "p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3",
                                                role === "KABADIWALA"
                                                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-14 h-14 rounded-full flex items-center justify-center",
                                                role === "KABADIWALA"
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                            )}>
                                                <Recycle className="h-7 w-7" />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-medium">I'm a Kabadiwala</p>
                                                <p className="text-xs text-muted-foreground">I collect and buy scrap</p>
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 1: Personal Information */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <AnimatedInput
                                        label="Full Name"
                                        icon={<User className="h-4 w-4" />}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your Name"
                                        required
                                    />

                                    <AnimatedInput
                                        label="Phone Number"
                                        type="tel"
                                        icon={<Phone className="h-4 w-4" />}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="9876543210"
                                        required
                                        minLength={10}
                                    />

                                    <AnimatedInput
                                        label="Email"
                                        type="email"
                                        icon={<Mail className="h-4 w-4" />}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="hello@example.com"
                                        required
                                    />
                                </motion.div>
                            )}

                            {/* Step 2: Password & Business (if Kabadiwala) */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {role === "KABADIWALA" && (
                                        <>
                                            <AnimatedInput
                                                label="Business Name"
                                                icon={<Building2 className="h-4 w-4" />}
                                                value={businessName}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                                placeholder="Your shop name"
                                                required
                                            />

                                            <AnimatedInput
                                                label="Service Area"
                                                icon={<MapPin className="h-4 w-4" />}
                                                value={serviceArea}
                                                onChange={(e) => setServiceArea(e.target.value)}
                                                placeholder="e.g. South Delhi"
                                                required
                                            />
                                        </>
                                    )}

                                    <div className="space-y-2">
                                        <AnimatedInput
                                            label="Password"
                                            type="password"
                                            icon={<Lock className="h-4 w-4" />}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min 6 characters"
                                            required
                                            minLength={6}
                                        />
                                        {password && (
                                            <PasswordStrengthMeter password={password} />
                                        )}
                                    </div>

                                    <AnimatedInput
                                        label="Confirm Password"
                                        type="password"
                                        icon={<Lock className="h-4 w-4" />}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm password"
                                        required
                                        error={confirmPassword && password !== confirmPassword ? "Passwords don't match" : undefined}
                                        success={!!(confirmPassword && password === confirmPassword && password.length >= 6)}
                                    />

                                    {/* Terms Acceptance */}
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            checked={acceptTerms}
                                            onChange={(e) => setAcceptTerms(e.target.checked)}
                                            className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="terms" className="text-sm text-muted-foreground">
                                            I accept the <Link href="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link> and{" "}
                                            <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
                                        </label>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        {/* Navigation Buttons */}
                        <div className="flex gap-3 w-full">
                            {step > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    className="flex-1"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            )}

                            {step < totalSteps - 1 ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={
                                        (step === 0 && !canProceedStep0) ||
                                        (step === 1 && !canProceedStep1)
                                    }
                                    className={cn(
                                        "flex-1 bg-gradient-to-r from-green-600 to-emerald-600",
                                        step === 0 && "w-full"
                                    )}
                                >
                                    Next
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading || !canProceedStep2}
                                    className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg"
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Sparkles className="h-5 w-5 mr-2" />
                                            Create Account
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground text-center">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary font-medium hover:underline">
                                Login
                            </Link>
                        </p>
                    </CardFooter>

                    {/* Security Badge */}
                    <div className="px-6 pb-6">
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Shield className="h-3 w-3 text-green-500" />
                            <span>Your information is secure</span>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
