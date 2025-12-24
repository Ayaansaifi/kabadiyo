"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Lock, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

export default function AdminLoginPage() {
    const router = useRouter()
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/admin/security", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "LOGIN", password })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Login failed")
            }

            toast.success("Admin Access Granted")
            router.push("/admin")
            router.refresh()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Login failed"
            toast.error(message)
            setPassword("")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="mb-8 text-center animate-fade-in">
                <div className="bg-primary/20 p-4 rounded-full inline-block mb-4">
                    <Shield className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Kabadiwala Admin</h1>
                <p className="text-slate-400 mt-2">Secure Restricted Access</p>
            </div>

            <Card className="w-full max-w-md bg-white/5 border-white/10 text-white backdrop-blur">
                <CardHeader>
                    <CardTitle>Authenticate</CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter your secure admin password to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    type="password"
                                    placeholder="Admin Password"
                                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-slate-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full font-semibold"
                            disabled={loading || !password}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    Unlock Panel <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <p className="mt-8 text-xs text-slate-600">
                Unauthorized access is monitored and logged to system audits.
            </p>
        </div>
    )
}
