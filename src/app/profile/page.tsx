"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
    User, MapPin, Phone, Mail, Camera, Edit2,
    Award, Star, Shield, TrendingUp, Calendar,
    Share2, Leaf, Recycle, Medal, Zap, CheckCircle, XCircle, Clock, LogOut
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
    const [orders, setOrders] = useState<any[]>([])
    const [stats, setStats] = useState({
        totalEarnings: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalWeight: 0
    })

    // Gamification Stats
    const points = 1250 // Dynamic later
    const level = 3
    const impact = {
        treesSaved: 5,
        co2Avoided: 120, // kg
        energySaved: 450 // kWh
    }

    useEffect(() => {
        setMounted(true)
        fetchProfile()
    }, [session])

    const fetchProfile = async () => {
        try {
            // Parallel Fetch: Profile + Orders
            const [profileRes, ordersRes] = await Promise.all([
                fetch("/api/profile"),
                fetch("/api/orders")
            ])

            if (profileRes.ok) {
                const data = await profileRes.json()
                setName(data.name || session?.user?.name || "")
                setAddress(data.address || "")
                setProfileImage(data.image || session?.user?.image || "")
                setCoverImage(data.coverImage || "")
            }

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json()
                setOrders(ordersData)
                calculateStats(ordersData)
            }
        } catch (e) {
            console.error("Data fetch failed", e)
        }
    }

    const calculateStats = (ordersData: any[]) => {
        const completed = ordersData.filter(o => o.status === "COMPLETED")
        const earnings = completed.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)

        setStats({
            totalEarnings: earnings,
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

    if (!mounted) return null

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

    const calculateLevelProgress = () => {
        // Simple level calculation: 500 points per level
        return ((points % 500) / 500) * 100
    }

    const achievements = [
        { id: 1, name: "Eco Warrior", description: "Recycled 100kg waste", icon: <Leaf className="h-5 w-5 text-green-500" />, unlocked: true },
        { id: 2, name: "Super Seller", description: "Completed 10 orders", icon: <Star className="h-5 w-5 text-yellow-500" />, unlocked: true },
        { id: 3, name: "Early Adopter", description: "Joined in beta", icon: <Award className="h-5 w-5 text-blue-500" />, unlocked: true },
        { id: 4, name: "Community Hero", description: "Referred 5 friends", icon: <Share2 className="h-5 w-5 text-purple-500" />, unlocked: false },
    ]

    return (
        <div className="container max-w-4xl mx-auto p-4 space-y-8 pb-24">
            {/* Header / Cover */}
            <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-green-400 to-emerald-600">
                {coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 bg-black/10" />
                )}

                <div className="absolute bottom-4 right-4">
                    <label>
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "cover")}
                            disabled={uploading}
                        />
                        <Button size="sm" variant="secondary" className="gap-2 cursor-pointer" asChild>
                            <span>
                                <Camera className="h-4 w-4" />
                                {uploading ? "Uploading..." : "Change Cover"}
                            </span>
                        </Button>
                    </label>
                </div>
            </div>

            {/* Profile Info */}
            <div className="relative -mt-20 px-4">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                    <div className="relative">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                            <AvatarImage src={profileImage || session?.user?.image || ""} />
                            <AvatarFallback className="text-4xl">
                                {name[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <label className="absolute bottom-0 right-0">
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, "profile")}
                                disabled={uploading}
                            />
                            <Button
                                size="icon"
                                variant="secondary"
                                className="rounded-full shadow-lg cursor-pointer"
                                asChild
                            >
                                <span><Camera className="h-4 w-4" /></span>
                            </Button>
                        </label>
                    </div>

                    <div className="flex-1 space-y-2 mb-2">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                {name}
                                <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    <Shield className="h-3 w-3" />
                                    Verified
                                </Badge>
                            </h1>
                            <p className="text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {address || "Add your address"}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <Button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex-1 md:flex-none gap-2"
                        >
                            <Edit2 className="h-4 w-4" />
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </Button>
                        <Button variant="outline" size="icon" title="Share Profile">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            title="Log Out"
                            onClick={async () => {
                                try {
                                    await fetch("/api/auth/logout", { method: "POST" })
                                    window.location.href = "/"
                                } catch (e) {
                                    toast.error("Logout failed")
                                }
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Gamification Stats - New Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-100 dark:border-green-900">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-green-700 dark:text-green-400">Level {level}</h3>
                            <Medal className="h-5 w-5 text-green-600" />
                        </div>
                        <Progress value={calculateLevelProgress()} className="h-2 mb-2" />
                        <p className="text-xs text-muted-foreground">
                            {500 - (points % 500)} points to next level
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                            <Star className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{points}</p>
                            <p className="text-sm text-muted-foreground">Total Points</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-100 dark:border-indigo-900">
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                            <TrendingUp className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">₹{stats.totalEarnings}</p>
                            <p className="text-sm text-muted-foreground">Total Earnings</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="impact">Eco Impact</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Personal Info Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <AnimatedInput
                                    label="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={!isEditing}
                                    icon={<User className="h-4 w-4" />}
                                />
                                <AnimatedInput
                                    label="Phone Number"
                                    value={session?.user?.phone || ""}
                                    disabled
                                    icon={<Phone className="h-4 w-4" />}
                                />
                                <AnimatedInput
                                    label="Email Address"
                                    value={session?.user?.email || ""}
                                    disabled
                                    icon={<Mail className="h-4 w-4" />}
                                />
                                <AnimatedInput
                                    label="Address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    disabled={!isEditing}
                                    icon={<MapPin className="h-4 w-4" />}
                                />
                            </div>

                            {isEditing && (
                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleSave} disabled={loading}>
                                        {loading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Achievements */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Achievements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {achievements.map((achievement) => (
                                    <div
                                        key={achievement.id}
                                        className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-colors ${achievement.unlocked
                                            ? "bg-muted/50 border-muted-foreground/20"
                                            : "opacity-50 grayscale"
                                            }`}
                                    >
                                        <div className="p-2 bg-background rounded-full shadow-sm">
                                            {achievement.icon}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{achievement.name}</p>
                                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="impact" className="space-y-6">
                    <EcoImpactVisualizer totalWeight={stats.totalWeight} />

                    {/* Additional Impact Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-100">
                            <CardHeader>
                                <CardTitle className="text-lg">Did You Know?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Recycling 1 ton of paper saves 17 trees, 7,000 gallons of water, and 4,000 kilowatts of electricity.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/10 dark:to-yellow-900/10 border-orange-100">
                            <CardHeader>
                                <CardTitle className="text-lg">Community Goal</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>City Target: 10,000kg</span>
                                        <span>75%</span>
                                    </div>
                                    <Progress value={75} className="h-2 bg-orange-200" indicatorClassName="bg-orange-500" />
                                    <p className="text-xs text-muted-foreground">Together we are making our city cleaner!</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="activity">
                    <Card className="border-none shadow-md bg-white/50 dark:bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Ordering History</CardTitle>
                            <CardDescription>Your recent sell requests and pickups</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {orders.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-muted">
                                        <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-1">No Orders Yet</h3>
                                        <p className="mb-4 max-w-xs mx-auto">Start your recycling journey today and earn rewards!</p>
                                        <Button asChild className="rounded-full px-8">
                                            <a href="/market">Find a Kabadiwala</a>
                                        </Button>
                                    </div>
                                ) : (
                                    orders.map((order: any, i) => (
                                        <div key={order.id} className="flex gap-4 items-start group">
                                            <div className="relative pt-1">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 relative shadow-sm transition-transform group-hover:scale-110 
                                                    ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                    {order.status === 'COMPLETED' ? <CheckCircle className="h-5 w-5" /> :
                                                        order.status === 'CANCELLED' ? <XCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                                </div>
                                                {i !== orders.length - 1 && (
                                                    <div className="absolute top-10 left-1/2 -translate-x-1/2 h-full w-0.5 bg-border group-hover:bg-muted-foreground/30 transition-colors" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-6 border-b last:border-0 border-muted/50">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                            {order.buyer?.kabadiwalaProfile?.businessName || "Kabadiwala Pickup"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {new Date(order.createdAt).toLocaleDateString()} • {order.items ? order.items.split(',').length : 0} Items
                                                        </p>
                                                    </div>
                                                    <Badge variant={order.status === 'COMPLETED' ? 'outline' : 'secondary'} className="text-xs font-mono">
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                                {order.totalAmount && (
                                                    <p className="text-sm font-bold text-green-600 mt-2 flex items-center gap-1">
                                                        <TrendingUp className="h-3 w-3" />
                                                        + ₹{order.totalAmount} Earned
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
