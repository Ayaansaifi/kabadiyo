"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

export default function AdminRecoveryPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [recoveryCode, setRecoveryCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleRecover(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/admin/recover", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, recoveryCode, newPassword }),
            })
            const data = await res.json()

            if (res.ok) {
                toast.success("Admin Password Reset Successfully!")
                router.push("/login")
            } else {
                toast.error(data.error || "Recovery failed")
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/95 text-white px-4">
            <Card className="w-full max-w-md border-red-900 bg-red-950/10 text-red-50">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-red-900/20 p-3 rounded-full w-fit mb-4">
                        <ShieldAlert className="h-8 w-8 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl text-red-500">Admin Recovery</CardTitle>
                    <CardDescription className="text-red-300">
                        Secure Developer Access Only
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRecover} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Admin Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@kabadiwala.com"
                                className="bg-black/50 border-red-900 focus:border-red-500"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Recovery Master Key</Label>
                            <Input
                                id="code"
                                type="password"
                                placeholder="SECRET_ENV_CODE"
                                className="bg-black/50 border-red-900 focus:border-red-500 font-mono"
                                required
                                value={recoveryCode}
                                onChange={(e) => setRecoveryCode(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="New Strong Password"
                                className="bg-black/50 border-red-900 focus:border-red-500"
                                required
                                minLength={6}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="destructive" className="w-full mt-6" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reset via Master Key
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
