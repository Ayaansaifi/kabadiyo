"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Laptop, Smartphone, Globe, Trash2, Shield, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Session {
    id: string
    device: string
    location: string
    lastActive: string
    isCurrent: boolean
    ip: string | null
}

export function ActiveSessions() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [revoking, setRevoking] = useState<string | null>(null)

    const fetchSessions = async () => {
        try {
            const res = await fetch("/api/sessions")
            const data = await res.json()
            if (data.sessions) setSessions(data.sessions)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSessions()
        // Poll for "Real-time" effect every 30 seconds
        const interval = setInterval(fetchSessions, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleRevoke = async (sessionId: string, isAll: boolean = false) => {
        setRevoking(sessionId)
        try {
            const res = await fetch("/api/sessions", {
                method: "DELETE",
                body: JSON.stringify({ sessionId, revokeAllOthers: isAll })
            })
            if (res.ok) {
                toast.success(isAll ? "All other sessions revoked" : "Session revoked")
                fetchSessions()
            } else {
                toast.error("Failed to revoke session")
            }
        } catch (error) {
            toast.error("Error revoking session")
        } finally {
            setRevoking(null)
        }
    }

    if (loading) return <div className="h-40 animate-pulse bg-muted/20 rounded-xl" />

    return (
        <Card className="border-0 shadow-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Active Sessions
                        </CardTitle>
                        <CardDescription>Devices currently logged into your account</CardDescription>
                    </div>
                    {sessions.length > 1 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevoke("all", true)}
                            disabled={!!revoking}
                        >
                            {revoking === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Revoke All Others"}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 rounded-xl bg-card border hover:border-blue-500/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-full ${session.isCurrent ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                                    {session.device.toLowerCase().includes("mobile") || session.device.toLowerCase().includes("phone") ? (
                                        <Smartphone className="h-5 w-5" />
                                    ) : (
                                        <Laptop className="h-5 w-5" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium flex items-center gap-2">
                                        {session.device}
                                        {session.isCurrent && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full border border-green-200">
                                                CURRENT
                                            </span>
                                        )}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                        <span className="flex items-center gap-1">
                                            <Globe className="h-3 w-3" /> {session.location}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {session.isCurrent ? "Active now" : new Date(session.lastActive).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {!session.isCurrent && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleRevoke(session.id)}
                                    disabled={!!revoking}
                                >
                                    {revoking === session.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                        </div>
                    ))}

                    {sessions.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No active sessions found.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
