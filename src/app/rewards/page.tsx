"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Gift, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { getRewards, redeemReward } from "@/actions/gamification"
import { Progress } from "@/components/ui/progress"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Reward {
    id: string
    title: string
    description: string
    cost: number
    isActive: boolean
}

interface UserData {
    id: string
    name: string | null
    points: number
}

export default function RewardsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [points, setPoints] = useState(0)
    const [rewards, setRewards] = useState<Reward[]>([])
    const [redeeming, setRedeeming] = useState(false)
    const [user, setUser] = useState<UserData | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            // Fetch rewards for everyone
            const availableRewards = await getRewards()
            setRewards(availableRewards)

            // Fetch user data via API (cookie-based auth)
            const res = await fetch("/api/profile")
            if (res.ok) {
                const userData = await res.json()
                setUser(userData)
                setPoints(userData.points || 0)
            } else {
                setUser(null)
                setPoints(0)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load rewards")
        } finally {
            setLoading(false)
        }
    }

    const handleRedeem = async (rewardId: string) => {
        if (!user) {
            toast.error("Please login to redeem rewards")
            router.push("/login")
            return
        }

        setRedeeming(true)
        try {
            const result = await redeemReward(user.id, rewardId)
            if (result.success) {
                toast.success(result.message)
                fetchData() // Refresh points
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error("Redemption failed")
            console.error(error)
        } finally {
            setRedeeming(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Render content for both guests and users
    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-8 text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 rounded-2xl shadow-xl">
                <h1 className="text-3xl font-bold mb-2">My Green Wallet</h1>
                <div className="text-6xl font-black mb-2">{points.toLocaleString()}</div>
                <p className="text-green-100">Green Points Available</p>
                {!user && (
                    <div className="mt-4">
                        <Button variant="secondary" size="sm" onClick={() => router.push("/login")}>
                            Login to see your points
                        </Button>
                    </div>
                )}
                <div className="mt-6 flex justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
                        Keep cleaning the planet to earn more!
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Gift className="h-6 w-6 text-primary" />
                Available Rewards
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
                {rewards.map((reward) => {
                    const progress = Math.min((points / reward.cost) * 100, 100)
                    const isUnlockable = points >= reward.cost

                    return (
                        <Card key={reward.id} className={`relative overflow-hidden transition-all ${isUnlockable ? 'border-green-500 shadow-lg' : 'opacity-90'}`}>
                            {isUnlockable && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
                                    UNLOCKED
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="flex justify-between items-start">
                                    <span>{reward.title}</span>
                                </CardTitle>
                                <CardDescription className="text-base mt-2">
                                    {reward.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="text-2xl font-bold text-primary">
                                            {reward.cost.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">pts</span>
                                        </div>
                                        <div className="text-sm font-medium">
                                            {Math.round(progress)}%
                                        </div>
                                    </div>

                                    <Progress value={progress} className={`h-3 ${isUnlockable ? 'bg-green-100' : 'bg-gray-100'}`} />

                                    {isUnlockable ? (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={redeeming}>
                                                    {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4 mr-2" />}
                                                    Redeem Now
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Confirm Redemption</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to spend {reward.cost.toLocaleString()} points to redeem &quot;{reward.title}&quot;?
                                                        <br /><br />
                                                        <strong>Note:</strong> Our team will contact you within 24 hours to schedule your service.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <Button onClick={() => handleRedeem(reward.id)} className="bg-green-600 hover:bg-green-700">
                                                        Yes, Redeem It
                                                    </Button>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    ) : (
                                        <Button variant="secondary" className="w-full" disabled>
                                            <Lock className="h-4 w-4 mr-2" />
                                            {reward.cost - points} points needed
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {rewards.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No rewards configured yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
