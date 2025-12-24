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
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <Gift className="h-5 w-5" />
                    Refer & Earn
                </CardTitle>
                <CardDescription>
                    Invite friends and get <span className="font-bold text-foreground">50 coins</span> each!
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-white/60 dark:bg-card/50 p-4 rounded-xl border border-dashed border-purple-200 dark:border-purple-800 text-center space-y-3">
                    <p className="text-sm text-muted-foreground">Your Unique Code</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 bg-background py-2 px-3 rounded-lg border font-mono text-lg font-bold tracking-wider text-center">
                            {referralCode}
                        </code>
                        <Button size="icon" variant="outline" onClick={handleCopy}>
                            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" /> Share with Friends
                </Button>
            </CardContent>
        </Card>
    )
}
