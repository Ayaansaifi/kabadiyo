"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
    User, MapPin, Phone, Mail, Camera, Edit2,
    Award, Star, Shield, TrendingUp, Calendar,
    Share2, Leaf, Recycle, Medal, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { AnimatedInput } from "@/components/ui/enhanced-input"

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

    // Gamification Stats (Static for now - API integration pending)
    const points = 1250
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
            const res = await fetch("/api/profile")
            if (res.ok) {
                const data = await res.json()
                setName(data.name || session?.user?.name || "")
                setAddress(data.address || "")
                setProfileImage(data.image || session?.user?.image || "")
                setCoverImage(data.coverImage || "") // Now supported
            }
        } catch (e) {
            console.error("Profile fetch failed", e)
        }
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
                        <Button variant="outline" size="icon">
                            <Share2 className="h-4 w-4" />
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

                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">Top 5%</p>
                            <p className="text-sm text-muted-foreground">Local Ranking</p>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Environmental Impact</CardTitle>
                            <CardDescription>See how your recycling efforts help the planet</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col items-center p-6 bg-green-50 dark:bg-green-900/10 rounded-xl">
                                    <Leaf className="h-8 w-8 text-green-600 mb-3" />
                                    <h3 className="text-3xl font-bold text-green-700">{impact.treesSaved}</h3>
                                    <p className="text-sm text-muted-foreground">Trees Saved</p>
                                </div>
                                <div className="flex flex-col items-center p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                                    <Recycle className="h-8 w-8 text-blue-600 mb-3" />
                                    <h3 className="text-3xl font-bold text-blue-700">{impact.co2Avoided}kg</h3>
                                    <p className="text-sm text-muted-foreground">CO₂ Avoided</p>
                                </div>
                                <div className="flex flex-col items-center p-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl">
                                    <Zap className="h-8 w-8 text-yellow-600 mb-3" />
                                    <h3 className="text-3xl font-bold text-yellow-700">{impact.energySaved}kWh</h3>
                                    <p className="text-sm text-muted-foreground">Energy Conserved</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                                <Recycle className="h-5 w-5 text-green-600" />
                                            </div>
                                            {i !== 2 && (
                                                <div className="absolute top-10 left-1/2 -translate-x-1/2 h-full w-0.5 bg-border" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">Sold 15kg Newspaper</p>
                                            <p className="text-sm text-muted-foreground">Earned ₹250 • 2 days ago</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
