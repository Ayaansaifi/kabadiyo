"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Smartphone, KeyRound } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Password login state
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")

    // OTP login state
    const [otpEmail, setOtpEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [otpSent, setOtpSent] = useState(false)
    const [countdown, setCountdown] = useState(0)

    async function handlePasswordLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, password }),
            })

            if (res.ok) {
                router.push("/dashboard")
                router.refresh()
            } else {
                const data = await res.json()
                setError(data.error || "Invalid credentials")
            }
        } catch {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    async function handleRequestOTP() {
        if (!otpEmail || !otpEmail.includes("@")) {
            toast.error("Enter a valid email address")
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
                toast.success("OTP sent to your email!")

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
                setError(data.error || "Failed to send OTP")
            }
        } catch {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    async function handleVerifyOTP(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!otp || otp.length !== 6) {
            toast.error("Enter a 6-digit OTP")
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
                toast.success("Login successful!")

                // Redirection Logic based on Role
                if (data.user && data.user.role === "KABADIWALA") {
                    router.push("/dashboard")
                } else {
                    router.push("/") // Sellers/Users go to Home
                }

                router.refresh()
            } else {
                setError(data.error || "Invalid OTP")
            }
        } catch {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Choose your preferred login method</CardDescription>
                </CardHeader>

                <Tabs defaultValue="password" className="w-full">
                    <div className="px-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="password" className="gap-2">
                                <KeyRound className="h-4 w-4" />
                                Password
                            </TabsTrigger>
                            <TabsTrigger value="otp" className="gap-2">
                                <Smartphone className="h-4 w-4" />
                                OTP
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Password Login Tab */}
                    <TabsContent value="password">
                        <form onSubmit={handlePasswordLogin}>
                            <CardContent className="space-y-4">
                                {error && (
                                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="9876543210"
                                        required
                                        minLength={10}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Login
                                </Button>
                                <p className="text-sm text-muted-foreground text-center">
                                    Don&apos;t have an account?{" "}
                                    <Link href="/register" className="text-primary underline">
                                        Register
                                    </Link>
                                </p>
                                <Link href="/reset-password" className="text-sm text-muted-foreground hover:text-primary text-center block">
                                    Forgot Password?
                                </Link>
                            </CardFooter>
                        </form>
                    </TabsContent>

                    {/* OTP Login Tab */}
                    <TabsContent value="otp">
                        {!otpSent ? (
                            <CardContent className="space-y-4">
                                {error && (
                                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="otpEmail">Email Address</Label>
                                    <Input
                                        id="otpEmail"
                                        type="email"
                                        placeholder="hello@example.com"
                                        value={otpEmail}
                                        onChange={(e) => setOtpEmail(e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    className="w-full"
                                    disabled={loading}
                                    onClick={handleRequestOTP}
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Send OTP
                                </Button>
                                <p className="text-sm text-muted-foreground text-center">
                                    We&apos;ll send a 6-digit code to your email
                                </p>
                            </CardContent>
                        ) : (
                            <form onSubmit={handleVerifyOTP}>
                                <CardContent className="space-y-4">
                                    {error && (
                                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>
                                    )}
                                    <div className="text-center mb-4">
                                        <p className="text-sm text-muted-foreground">
                                            OTP sent to <span className="font-medium text-foreground">{otpEmail}</span>
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="otp">Enter OTP</Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="Enter 6-digit OTP"
                                            maxLength={6}
                                            className="text-center text-lg tracking-widest"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Verify & Login
                                    </Button>
                                    <div className="text-center">
                                        {countdown > 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                Resend OTP in {countdown}s
                                            </p>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRequestOTP}
                                                disabled={loading}
                                            >
                                                Resend OTP
                                            </Button>
                                        )}
                                    </div>
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
                                </CardContent>
                            </form>
                        )}
                        <CardFooter className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground text-center">
                                Don&apos;t have an account?{" "}
                                <Link href="/register" className="text-primary underline">
                                    Register
                                </Link>
                            </p>
                        </CardFooter>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    )
}
