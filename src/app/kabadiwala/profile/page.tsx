"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Camera, Star, Clock, MapPin, Package, CheckCircle,
    TrendingUp, Users, Loader2, Save, ImagePlus
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface KabadiwalaProfile {
    id: string
    name: string
    phone: string
    image: string | null
    kabadiwalaProfile: {
        id: string
        businessName: string
        coverImage: string | null
        bio: string | null
        serviceArea: string | null
        rating: number
        totalReviews: number
        totalPickups: number
        isVerified: boolean
        serviceHours: string | null
        rates: string | null
        avgResponseTime: number
    } | null
}

interface ProfileUpdateBody {
    section: string
    businessName?: FormDataEntryValue | null
    bio?: FormDataEntryValue | null
    serviceArea?: FormDataEntryValue | null
    rates?: string
    serviceHours?: string
}

const defaultRates = {
    iron: 30,
    plastic: 15,
    paper: 10,
    copper: 450,
    brass: 320,
    aluminium: 100,
    newspaper: 12,
    bottles: 2
}

const defaultHours = {
    mon: "9:00 AM - 6:00 PM",
    tue: "9:00 AM - 6:00 PM",
    wed: "9:00 AM - 6:00 PM",
    thu: "9:00 AM - 6:00 PM",
    fri: "9:00 AM - 6:00 PM",
    sat: "9:00 AM - 2:00 PM",
    sun: "Closed"
}

export default function KabadiwalaProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<KabadiwalaProfile | null>(null)
    const [rates, setRates] = useState(defaultRates)
    const [hours, setHours] = useState(defaultHours)

    useEffect(() => {
        fetchProfile()
    }, [])

    async function fetchProfile() {
        try {
            const res = await fetch("/api/kabadiwala/profile")
            if (res.ok) {
                const data = await res.json()
                setProfile(data)
                if (data.kabadiwalaProfile?.rates) {
                    try { setRates(JSON.parse(data.kabadiwalaProfile.rates)) } catch { }
                }
                if (data.kabadiwalaProfile?.serviceHours) {
                    try { setHours(JSON.parse(data.kabadiwalaProfile.serviceHours)) } catch { }
                }
            } else {
                router.push("/login")
            }
        } catch {
            router.push("/login")
        } finally {
            setLoading(false)
        }
    }

    async function handleSave(section: string) {
        setSaving(true)
        try {
            const body: ProfileUpdateBody = { section }

            if (section === "basic") {
                const form = document.getElementById("basic-form") as HTMLFormElement
                const formData = new FormData(form)
                body.businessName = formData.get("businessName")
                body.bio = formData.get("bio")
                body.serviceArea = formData.get("serviceArea")
            } else if (section === "rates") {
                body.rates = JSON.stringify(rates)
            } else if (section === "hours") {
                body.serviceHours = JSON.stringify(hours)
            }

            await fetch("/api/kabadiwala/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            await fetchProfile()
            toast.success("Profile saved successfully")
        } catch {
            toast.error("Failed to save profile")
        } finally {
            setSaving(false)
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large (Max 5MB)")
            return
        }

        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", type)

        const loadingToast = toast.loading("Uploading image...")

        try {
            // Upload to storage
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                credentials: 'include'
            })

            if (!uploadRes.ok) throw new Error("Upload failed")

            const uploadData = await uploadRes.json()
            const imageUrl = uploadData.url

            // Update profile with new image URL
            const updateRes = await fetch("/api/kabadiwala/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    section: "images",
                    [type === 'profile' ? 'image' : 'coverImage']: imageUrl
                })
            })

            if (!updateRes.ok) throw new Error("Failed to update profile")

            await fetchProfile()
            toast.dismiss(loadingToast)
            toast.success("Image updated successfully")
        } catch (error) {
            console.error(error)
            toast.dismiss(loadingToast)
            toast.error("Failed to upload image")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!profile) return null

    const kp = profile.kabadiwalaProfile

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header with Cover Image */}
                <div className="relative mb-8">
                    <div className="h-40 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl overflow-hidden">
                        {kp?.coverImage && (
                            <img src={kp.coverImage} alt="Cover" className="w-full h-full object-cover" />
                        )}
                        <label className="absolute bottom-4 right-4 p-2 bg-background/80 rounded-lg cursor-pointer hover:bg-background transition-colors flex items-center gap-2">
                            <ImagePlus className="h-4 w-4" />
                            <span className="text-sm">Change Cover</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, 'cover')}
                            />
                        </label>
                    </div>

                    <div className="absolute -bottom-12 left-6 flex items-end gap-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-background">
                                <AvatarImage src={profile.image || undefined} />
                                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                    {kp?.businessName?.[0] || 'K'}
                                </AvatarFallback>
                            </Avatar>
                            <label className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full cursor-pointer">
                                <Camera className="h-4 w-4 text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e, 'profile')}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-16 mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {kp?.businessName || "Your Business"}
                            {kp?.isVerified && (
                                <Badge className="bg-blue-500">
                                    <CheckCircle className="h-3 w-3 mr-1" /> Verified
                                </Badge>
                            )}
                        </h1>
                        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                            <span className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                                {kp?.rating?.toFixed(1) || "0.0"} ({kp?.totalReviews || 0} reviews)
                            </span>
                            <span className="flex items-center">
                                <Package className="h-4 w-4 mr-1" />
                                {kp?.totalPickups || 0} pickups
                            </span>
                        </div>
                    </div>
                    <Link href="/kabadiwala/dashboard">
                        <Button variant="outline">Go to Dashboard</Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <p className="text-2xl font-bold">{kp?.rating?.toFixed(1) || "0.0"}</p>
                                    <p className="text-xs text-muted-foreground">Rating</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-2xl font-bold">{kp?.totalReviews || 0}</p>
                                    <p className="text-xs text-muted-foreground">Reviews</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-2xl font-bold">{kp?.totalPickups || 0}</p>
                                    <p className="text-xs text-muted-foreground">Pickups</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-500" />
                                <div>
                                    <p className="text-2xl font-bold">{kp?.avgResponseTime || 0}m</p>
                                    <p className="text-xs text-muted-foreground">Avg Response</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="basic" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="rates">Rates</TabsTrigger>
                        <TabsTrigger value="hours">Service Hours</TabsTrigger>
                    </TabsList>

                    {/* Basic Info */}
                    <TabsContent value="basic">
                        <Card>
                            <CardHeader>
                                <CardTitle>Business Information</CardTitle>
                                <CardDescription>This info will be visible to customers</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form id="basic-form" className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Business Name</Label>
                                        <Input name="businessName" defaultValue={kp?.businessName || ""} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>About Your Business</Label>
                                        <Textarea
                                            name="bio"
                                            defaultValue={kp?.bio || ""}
                                            placeholder="Tell customers about your service..."
                                            rows={4}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Service Area</Label>
                                        <Input
                                            name="serviceArea"
                                            defaultValue={kp?.serviceArea || ""}
                                            placeholder="e.g. South Delhi, Noida, Gurugram"
                                        />
                                    </div>
                                    <Button onClick={() => handleSave("basic")} disabled={saving}>
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Save className="h-4 w-4 mr-2" /> Save Changes
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Rates */}
                    <TabsContent value="rates">
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Rates (₹ per kg)</CardTitle>
                                <CardDescription>Set competitive prices to attract customers</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {Object.entries(rates).map(([material, price]) => (
                                        <div key={material} className="space-y-2">
                                            <Label className="capitalize">{material}</Label>
                                            <div className="flex items-center">
                                                <span className="px-3 py-2 bg-muted rounded-l-md border border-r-0">₹</span>
                                                <Input
                                                    type="number"
                                                    value={price}
                                                    onChange={(e) => setRates({ ...rates, [material]: Number(e.target.value) })}
                                                    className="rounded-l-none"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button onClick={() => handleSave("rates")} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="h-4 w-4 mr-2" /> Save Rates
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Service Hours */}
                    <TabsContent value="hours">
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Hours</CardTitle>
                                <CardDescription>When are you available for pickups?</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 mb-6">
                                    {Object.entries(hours).map(([day, time]) => (
                                        <div key={day} className="flex items-center gap-4">
                                            <Label className="capitalize w-20">{day}</Label>
                                            <Input
                                                value={time}
                                                onChange={(e) => setHours({ ...hours, [day]: e.target.value })}
                                                placeholder="e.g. 9:00 AM - 6:00 PM or Closed"
                                                className="flex-1"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <Button onClick={() => handleSave("hours")} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="h-4 w-4 mr-2" /> Save Hours
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    )
}
