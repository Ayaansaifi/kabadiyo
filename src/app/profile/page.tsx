"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
    User, MapPin, Phone, Mail, Camera, Edit2,
    Award, Star, Shield, TrendingUp, Calendar,
    Share2, Leaf, Recycle, Medal, Zap, CheckCircle, XCircle, Clock, LogOut, Coins, Settings, Copy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { AnimatedInput } from "@/components/ui/enhanced-input"
import { EcoImpactVisualizer } from "@/components/profile/EcoImpactVisualizer"
import { BadgeGrid } from "@/components/profile/BadgeGrid"
import { ActivityFeed } from "@/components/profile/ActivityFeed"
import Link from "next/link"

export default function ProfilePage() {
    const { data: session, update } = useSession()
    const [mounted, setMounted] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form Stats
    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [profileImage, setProfileImage] = useState("")
    const [coverImage, setCoverImage] = useState("")

    // File Inputs
    const [uploading, setUploading] = useState(false)

    // Data State
    const [userPoints, setUserPoints] = useState(0)
    const [referralCode, setReferralCode] = useState("")
    const [isCopied, setIsCopied] = useState(false)
    const [orders, setOrders] = useState<any[]>([])
    const [stats, setStats] = useState({
        pendingOrders: 0,
        completedOrders: 0,
        totalWeight: 0
    })

    useEffect(() => {
        setMounted(true)
        fetchProfile()
    }, [session])

    const fetchProfile = async () => {
        try {
            // Parallel Fetch: Profile + Orders + Referral
            const [profileRes, ordersRes, referralRes] = await Promise.all([
                fetch("/api/profile"),
                fetch("/api/orders"),
                fetch("/api/referral")
            ])

            if (profileRes.ok) {
                const data = await profileRes.json()
                setName(data.name || session?.user?.name || "")
                setAddress(data.address || "")
                setProfileImage(data.image || session?.user?.image || "")
                setCoverImage(data.coverImage || "")
                setUserPoints(data.points || 0)
            }

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json()
                setOrders(ordersData)
                calculateStats(ordersData)
            }

            if (referralRes.ok) {
                const refData = await referralRes.json()
                setReferralCode(refData.referralCode || "")
            }
        } catch (e) {
            console.error("Data fetch failed", e)
        }
    }

    const calculateStats = (ordersData: any[]) => {
        const completed = ordersData.filter(o => o.status === "COMPLETED")

        setStats({
            pendingOrders: ordersData.filter(o => o.status === "REQUESTED" || o.status === "ACCEPTED").length,
            completedOrders: completed.length,
            totalWeight: completed.reduce((acc, curr) => acc + (curr.totalWeight || 0), 0)
        })
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "cover") => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", type)

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })

            const data = await res.json()
            if (res.ok) {
                if (type === "profile") setProfileImage(data.url)
                if (type === "cover") setCoverImage(data.url)
                toast.success("Image uploaded, click Save to apply")
            } else {
                toast.error(data.error || "Upload failed")
            }
        } catch {
            toast.error("Upload failed")
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    address,
                    image: profileImage,
                    coverImage
                })
            })

            if (!res.ok) throw new Error("Failed to update")

            // Update session if possible (client side)
            await update({ name, image: profileImage })

            setIsEditing(false)
            toast.success("Profile updated successfully!")
        } catch {
            toast.error("Failed to update profile")
        } finally {
            setLoading(false)
        }
    }

    const handleCopyCode = () => {
        if (!referralCode) return
        navigator.clipboard.writeText(referralCode)
        setIsCopied(true)
        toast.success("Referral code copied!")
        setTimeout(() => setIsCopied(false), 2000)
    }

    if (!mounted) return null

    // Mock badges for now - connect to real data later
    const achievements = [
        { id: 1, name: "Eco Warrior", description: "Recycled 100kg waste", icon: <Leaf className="h-5 w-5 text-green-500" />, unlocked: stats.totalWeight >= 100 },
        { id: 2, name: "First Step", description: "Completed 1st Pickup", icon: <CheckCircle className="h-5 w-5 text-blue-500" />, unlocked: stats.completedOrders >= 1 },
        { id: 3, name: "Super Seller", description: "Completed 10 orders", icon: <Star className="h-5 w-5 text-yellow-500" />, unlocked: stats.completedOrders >= 10 },
        { id: 4, name: "Community Hero", description: "Referred 5 friends", icon: <Share2 className="h-5 w-5 text-purple-500" />, unlocked: false },
    ]

    // Generate activity feed from orders
    const activities = orders.map(order => ({
        id: order.id,
        type: order.status === 'COMPLETED' ? 'points' as const : 'pickup' as const,
        title: order.status === 'COMPLETED' ? 'Points Earned' : 'Pickup Scheduled',
        description: `${order.items} (${order.estimatedWeight || 0}kg)`,
        date: new Date(order.createdAt),
        points: order.status === 'COMPLETED' ? (order.pointsEarned || 100) : undefined // Use real points logic
    })).slice(0, 5)

    return (
        <div className="container max-w-4xl mx-auto pb-24 md:py-8 space-y-8">
            {/* 1. Hero Banner Component */}
            <div className="relative group">
                <div className="h-48 md:h-64 rounded-b-3xl md:rounded-3xl overflow-hidden bg-gradient-to-r from-green-400 to-emerald-600 shadow-xl relative">
                    {coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 bg-black/10" />
                    )}

                    {/* Dark Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {isEditing && (
                        <label className="absolute bottom-4 right-4 cursor-pointer">
                            <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, "cover")} />
                            <div className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm">
                                <Camera className="h-5 w-5" />
                            </div>
                        </label>
                    )}
                </div>

                {/* Profile Avatar & Info Overlay */}
                <div className="absolute -bottom-12 left-6 md:left-10 flex items-end gap-4">
                    <div className="relative">
                        <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-background shadow-2xl">
                            <AvatarImage src={profileImage} className="object-cover" />
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                {name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                            <label className="absolute bottom-0 right-0 cursor-pointer">
                                <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, "profile")} />
                                <div className="bg-primary text-white p-1.5 rounded-full hover:bg-primary/90 shadow-md ring-2 ring-background">
                                    <Camera className="h-4 w-4" />
                                </div>
                            </label>
                        )}
                    </div>
                </div>

                {/* Action Buttons (Desktop) */}
                <div className="absolute -bottom-12 right-6 hidden md:flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                        </Button>
                    )}
                    <Link href="/settings">
                        <Button variant="ghost" size="icon"><Settings className="h-5 w-5" /></Button>
                    </Link>
                </div>
            </div>

            {/* Mobile Name & Actions Spacer */}
            <div className="mt-14 px-6 md:hidden flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">{name || "User"}</h1>
                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {address || "No address set"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? "Cancel" : "Edit"}
                    </Button>
                    {isEditing && <Button size="sm" onClick={handleSave}>Save</Button>}
                </div>
            </div>

            {/* Edit Form (Collapsible) */}
            {isEditing && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-4 md:px-0"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Profile Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <AnimatedInput label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                            <AnimatedInput label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* 2. Stats & Points Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-0 mt-8">
                {/* Points Card */}
                <Card className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white border-0 shadow-lg relative overflow-hidden md:col-span-1">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Coins className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-yellow-100">Green Points</CardDescription>
                        <CardTitle className="text-4xl font-bold flex items-center gap-2">
                            {userPoints.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Link href="/rewards" className="w-full">
                                <Button size="sm" variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                    Redeem Rewards
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Referral Code Card (Replaces Earnings) */}
                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Share2 className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-100">Your Referral Code</CardDescription>
                        <CardTitle className="text-2xl font-mono tracking-wider">
                            {referralCode || "LOADING..."}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                className="w-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                                onClick={handleCopyCode}
                            >
                                {isCopied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                {isCopied ? "Copied" : "Copy Code"}
                            </Button>
                        </div>
                        <p className="text-[10px] text-blue-100 mt-2">Share & get 500 points!</p>
                    </CardContent>
                </Card>

                {/* Impact Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Environmental Impact</CardDescription>
                        <CardTitle className="text-2xl">{stats.totalWeight} kg</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <Leaf className="h-4 w-4" /> Recycled
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Saved {stats.totalWeight * 2.5}kg CO2</p>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Main Content Tab Grid */}
            <div className="px-4 md:px-0">
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                        <TabsTrigger value="impact">Impact</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Badges Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Medal className="h-5 w-5 text-yellow-500" /> Achievements
                                </h3>
                                <span className="text-sm text-muted-foreground">{achievements.filter(a => a.unlocked).length}/{achievements.length} Unlocked</span>
                            </div>
                            <BadgeGrid badges={achievements} />
                        </div>

                        {/* Recent Activity Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ActivityFeed activities={activities.slice(0, 3)} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="activity">
                        <Card>
                            <CardHeader>
                                <CardTitle>Full History</CardTitle>
                                <CardDescription>Your interactions and transactions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ActivityFeed activities={activities} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="impact">
                        <EcoImpactVisualizer totalWeight={stats.totalWeight} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
