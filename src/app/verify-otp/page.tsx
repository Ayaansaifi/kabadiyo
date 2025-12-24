
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

// UI Components (Using standard HTML/Tailwind for simplicity as requested, avoiding complex imports if possible, but consistent with existing app)
// Actually, let's use standard Tailwind classes.

const step1Schema = z.object({
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
})

const step2Schema = z.object({
    otp: z.string().length(6, "OTP must be 6 digits"),
})

export default function VerifyOtpPage() {
    const [step, setStep] = useState<1 | 2>(1)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")

    const form1 = useForm<z.infer<typeof step1Schema>>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            email: "",
            phone: "",
        },
    })

    const form2 = useForm<z.infer<typeof step2Schema>>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            otp: "",
        },
    })

    async function onStep1Submit(data: z.infer<typeof step1Schema>) {
        setLoading(true)
        try {
            const response = await fetch("/api/otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "SEND",
                    email: data.email,
                    phone: data.phone,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to send OTP")
            }

            toast.success("OTP sent successfully to your email!")
            setEmail(data.email)
            setStep(2)
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message)
            } else {
                toast.error("An unknown error occurred")
            }
        } finally {
            setLoading(false)
        }
    }

    async function onStep2Submit(data: z.infer<typeof step2Schema>) {
        setLoading(true)
        try {
            const response = await fetch("/api/otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "VERIFY",
                    email: email,
                    otp: data.otp,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to verify OTP")
            }

            toast.success("OTP Verified Successfully!")
            // Reset or redirect
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message)
            } else {
                toast.error("An unknown error occurred")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        {step === 1 ? "Verification Required" : "Enter Verification Code"}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 1
                            ? "Enter your details to receive a One-Time Password."
                            : `We sent a code to ${email}. Please enter it below.`}
                    </p>
                </div>

                {step === 1 && (
                    <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                {...form1.register("email")}
                                type="email"
                                id="email"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                                placeholder="you@example.com"
                            />
                            {form1.formState.errors.email && (
                                <p className="mt-1 text-xs text-red-500">{form1.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone Number <span className="text-gray-400">(Optional)</span>
                            </label>
                            <input
                                {...form1.register("phone")}
                                type="tel"
                                id="phone"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                                placeholder="1234567890"
                            />
                            {form1.formState.errors.phone && (
                                <p className="mt-1 text-xs text-red-500">{form1.formState.errors.phone.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-6">
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                One-Time Password
                            </label>
                            <input
                                {...form2.register("otp")}
                                type="text"
                                id="otp"
                                maxLength={6}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-center text-2xl tracking-widest shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                                placeholder="000000"
                            />
                            {form2.formState.errors.otp && (
                                <p className="mt-1 text-xs text-red-500">{form2.formState.errors.otp.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-green-600 hover:text-green-500"
                            >
                                Change Email / Resend
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
