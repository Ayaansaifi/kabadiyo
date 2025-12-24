"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

function VerifyContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // Get identifier from URL (e.g. ?phone=987...)
    const phone = searchParams.get("phone")
    const email = searchParams.get("email")

    const [identifier, setIdentifier] = useState(phone || email || "")
    const [type, setType] = useState(phone ? "PHONE" : "EMAIL")
    const [otp, setOtp] = useState("")
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<"SEND" | "VERIFY">("SEND")

    async function handleSend() {
        setLoading(true)
        try {
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                body: JSON.stringify({ action: "SEND", identifier, type })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success("Verification code sent!")
                setStep("VERIFY")
            } else {
                toast.error(data.error)
            }
        } catch {
            toast.error("Failed to send code")
        } finally {
            setLoading(false)
        }
    }

    async function handleVerify() {
        setLoading(true)
        try {
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                body: JSON.stringify({ action: "VERIFY", identifier, type, token: otp })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success("Verified successfully!")
                router.push("/dashboard") // Redirect to dashboard
            } else {
                toast.error(data.error)
            }
        } catch {
            toast.error("Verification failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-md mx-auto py-20 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Verify your {type === "PHONE" ? "Phone" : "Email"}</CardTitle>
                    <CardDescription>
                        {step === "SEND"
                            ? `We need to verify your ${type.toLowerCase()} to activate your account.`
                            : `Enter the code sent to ${identifier}`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {step === "SEND" ? (
                        <>
                            <Input
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder={type === "PHONE" ? "Enter Phone" : "Enter Email"}
                                disabled={!!(phone || email)} // Disable if passed from URL
                            />
                            <Button onClick={handleSend} className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                Send Code
                            </Button>
                        </>
                    ) : (
                        <>
                            <Input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                className="text-center text-lg tracking-widest"
                            />
                            <Button onClick={handleVerify} className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                Verify
                            </Button>
                            <Button variant="ghost" className="w-full" onClick={() => setStep("SEND")}>
                                Resend or Change Number
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="container max-w-md mx-auto py-20 px-4">
                <Card>
                    <CardContent className="p-8 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </CardContent>
                </Card>
            </div>
        }>
            <VerifyContent />
        </Suspense>
    )
}
