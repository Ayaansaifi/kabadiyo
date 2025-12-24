"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, Recycle } from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [role, setRole] = useState<"USER" | "KABADIWALA">("USER")
    const [showOtp, setShowOtp] = useState(false)
    const [registeredEmail, setRegisteredEmail] = useState("")
    const [otp, setOtp] = useState("")

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const phone = formData.get("phone") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const businessName = formData.get("businessName") as string
        const serviceArea = formData.get("serviceArea") as string

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, email, password, role, businessName, serviceArea }),
            })

            const data = await res.json()

            if (res.ok) {
                if (data.requireVerification) {
                    setRegisteredEmail(data.email)
                    setShowOtp(true)
                    toast.success("Account created! Please verify your email.")
                } else {
                    router.push("/login")
                }
            } else {
                setError(data.error || "Registration failed")
            }
        } catch {
            setError("Something went wrong")
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
                toast.success("Email Verified! You can now login.")
                router.push("/dashboard") // Redirecting to Dashboard/Home as requested
                // Note: Assuming /dashboard creates user context or user will be directed correctly.
            } else {
                setError(data.error || "Verification failed")
            }
        } catch {
            setError("Something went wrong during verification")
        } finally {
            setLoading(false)
        }
    }

    if (showOtp) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Verify Email</CardTitle>
                        <CardDescription>Enter the OTP sent to {registeredEmail}</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleVerifyOtp}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="otp">One-Time Password</Label>
                                <Input
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                    className="text-center text-2xl tracking-widest"
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify & Login
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create Account</CardTitle>
                    <CardDescription>Sign up to get started</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>
                        )}

                        <Tabs value={role} onValueChange={(v) => setRole(v as "USER" | "KABADIWALA")}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="USER" className="gap-2">
                                    <User className="h-4 w-4" /> I want to sell scrap
                                </TabsTrigger>
                                <TabsTrigger value="KABADIWALA" className="gap-2">
                                    <Recycle className="h-4 w-4" /> I am a Kabadiwala
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" placeholder="Your Name" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="9876543210"
                                required
                                minLength={10}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="hello@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Min 6 characters"
                                required
                                minLength={6}
                            />
                        </div>

                        {role === "KABADIWALA" && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Business Name</Label>
                                    <Input
                                        id="businessName"
                                        name="businessName"
                                        placeholder="Your shop name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="serviceArea">Service Area</Label>
                                    <Input
                                        id="serviceArea"
                                        name="serviceArea"
                                        placeholder="e.g. South Delhi"
                                        required
                                    />
                                </div>
                            </>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
                        </Button>
                        <p className="text-sm text-muted-foreground text-center">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary underline">
                                Login
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
