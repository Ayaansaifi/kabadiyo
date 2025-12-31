"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Gift, Copy, Share2, Check } from "lucide-react"
import { toast } from "sonner"

export function ReferralWidget() {
    const [copied, setCopied] = useState(false)
    const [referralCode] = useState(() => "KABADI-" + Math.random().toString(36).substring(2, 7).toUpperCase())

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode)
        setCopied(true)
        toast.success("Referral code copied!")
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join Kabadiwala!',
                    text: `Use my code ${referralCode} to get extra rewards on your first scrap pickup!`,
                    url: window.location.origin
                })
            } catch (err) {
                console.log("Share failed", err)
            }
        } else {
            handleCopy()
        }
    }

    return (
        <Card className="border-none shadow-xl bg-gradient-to-br from-violet-600/10 via-fuchsia-500/5 to-transparent dark:from-violet-500/10 dark:via-transparent overflow-hidden border border-white/10 relative group">
            {/* Background Glow */}
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700" />
            <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />

            <CardHeader className="pb-2 relative z-10">
                <CardTitle className="flex items-center gap-3 text-xl font-black text-violet-700 dark:text-violet-400">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                        <Gift className="h-6 w-6 animate-bounce" />
                    </div>
                    Refer & Earn
                </CardTitle>
                <CardDescription className="text-sm font-medium">
                    Invite friends and unlock <span className="text-violet-600 font-bold">50 Eco-Coins</span> together!
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
                <div className="bg-white/40 dark:bg-card/40 backdrop-blur-md p-5 rounded-3xl border border-white/20 shadow-inner text-center space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-auto">Your Invite Code</p>
                    <div className="flex items-center gap-3">
                        <code className="flex-1 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 py-3 px-4 rounded-2xl border border-violet-100 dark:border-violet-800 font-mono text-xl font-black tracking-[0.2em] text-violet-700 dark:text-violet-300 shadow-sm">
                            {referralCode}
                        </code>
                        <Button
                            size="icon"
                            variant="secondary"
                            onClick={handleCopy}
                            className="h-12 w-12 rounded-2xl bg-white dark:bg-violet-900/50 hover:scale-110 transition-transform shadow-sm"
                        >
                            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-violet-500" />}
                        </Button>
                    </div>
                </div>
                <Button
                    className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg shadow-violet-500/25 border-0 font-bold text-lg gap-2 group-hover:scale-[1.02] transition-all"
                    onClick={handleShare}
                >
                    <Share2 className="h-5 w-5" /> Let&apos;s Share
                    <div className="ml-auto bg-white/20 p-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    </div>
                </Button>
            </CardContent>
        </Card>
    )
}
