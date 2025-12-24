"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
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
import { Loader2, User, Lock, Camera, Bell, Trash2, Save, Upload, CheckCircle, Settings, Leaf, Recycle, Sun, Moon } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { EcoImpactVisualizer } from "@/components/profile/EcoImpactVisualizer"
import { useTheme } from "next-themes"
import { GreenWalletCard } from "@/components/gamification/green-wallet-card"
import { getUserPoints } from "@/actions/gamification"

interface UserProfile {
    id: string
    name: string | null
    phone: string
    image: string | null
    address: string | null
    role: string
    createdAt: string
    kabadiwalaProfile?: {
        coverImage: string | null
    }
}

export default function ProfilePage() {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [user, setUser] = useState<UserProfile | null>(null)

    // Gamification Points
    const [points, setPoints] = useState(0)

    // Profile fields
    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [coverImageUrl, setCoverImageUrl] = useState("") // New state for cover image

    // Password change
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [changingPassword, setChangingPassword] = useState(false)

    // Notifications
    const [pushEnabled, setPushEnabled] = useState(false)
    const [orderNotifications, setOrderNotifications] = useState(true)
    const [messageNotifications, setMessageNotifications] = useState(true)
    const [promoNotifications, setPromoNotifications] = useState(false)

    // Delete account
    const [deletePassword, setDeletePassword] = useState("")
    const [deleteConfirm, setDeleteConfirm] = useState("")
    const [deleting, setDeleting] = useState(false)

    const coverInputRef = useRef<HTMLInputElement>(null) // Ref for cover input

    useEffect(() => {
        fetchProfile()
    }, [])

    useEffect(() => {
        if (user?.id) {
            getUserPoints(user.id).then(setPoints)
        }
    }, [user?.id])

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile")
            if (res.ok) {
                const data = await res.json()
                setUser(data)
                setName(data.name || "")
                setAddress(data.address || "")
                setImageUrl(data.image || "")
                // Set cover image if exists in kabadiwalaProfile
                if (data.kabadiwalaProfile?.coverImage) {
                    setCoverImageUrl(data.kabadiwalaProfile.coverImage)
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover' = 'profile') => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("type", type)

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })

            if (res.ok) {
                const data = await res.json()
                if (type === 'profile') {
                    setImageUrl(data.url)
                } else {
                    setCoverImageUrl(data.url)
                }
                toast.success(`${type === 'profile' ? 'Profile' : 'Cover'} photo uploaded!`)
            } else {
                const error = await res.text()
                console.error("Upload failed:", error)
                toast.error("Upload failed: " + (JSON.parse(error).error || "Server error"))
            }
        } catch (err) {
            console.error("Upload error:", err)
            toast.error("Something went wrong during upload")
        } finally {
            setUploading(false)
        }
    }

    const handleSaveProfile = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    address,
                    image: imageUrl,
                    coverImage: coverImageUrl
                })
            })

            if (res.ok) {
                toast.success("Profile updated!")
                fetchProfile()
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to update")
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match")
            return
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setChangingPassword(true)
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword })
            })

            const data = await res.json()
            if (res.ok) {
                toast.success("Password changed!")
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            } else {
                toast.error(data.error || "Failed to change password")
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setChangingPassword(false)
        }
    }

    const handleEnablePush = async () => {
        if (!("Notification" in window)) {
            toast.error("Notifications not supported in this browser")
            return
        }

        const permission = await Notification.requestPermission()
        if (permission === "granted") {
            try {
                if (!("serviceWorker" in navigator)) {
                    toast.error("Service Worker not supported")
                    return
                }

                const registration = await navigator.serviceWorker.ready

                // Get VAPID key
                const keyRes = await fetch("/api/notifications/vapid-key")
                const { publicKey } = await keyRes.json()

                const convertedVapidKey = urlBase64ToUint8Array(publicKey)

                // Subscribe
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                })

                // Send to server
                await fetch("/api/notifications/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(subscription)
                })

                setPushEnabled(true)
                toast.success("Notifications enabled!")
            } catch (error) {
                console.error("Subscription failed:", error)
                toast.error("Failed to enable notifications")
            }
        } else {
            toast.error("Notification permission denied")
        }
    }

    function urlBase64ToUint8Array(base64String: string) {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
        const base64 = (base64String + padding)
            .replace(/\-/g, "+")
            .replace(/_/g, "/")

        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length)

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i)
        }
        return outputArray
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== "DELETE MY ACCOUNT") {
            toast.error("Please type 'DELETE MY ACCOUNT' exactly")
            return
        }

        setDeleting(true)
        try {
            const res = await fetch("/api/profile", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    password: deletePassword,
                    confirmDelete: deleteConfirm
                })
            })

            if (res.ok) {
                toast.success("Account deleted")
                router.push("/")
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to delete account")
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            {/* Eco Impact Visualizer (Gamification) */}
            <div className="mb-8">
                <EcoImpactVisualizer totalWeight={128} />
                <div className="mt-6">
                    <GreenWalletCard points={points} />
                </div>
            </div>

            {/* Profile Header */}
            <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                        {imageUrl ? (
                            <img src={imageUrl} alt={name || ""} className="object-cover w-full h-full" />
                        ) : (
                            <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-3xl">
                                {name?.[0] || user.phone[0]}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white hover:bg-primary/90 transition-colors"
                    >
                        {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Camera className="h-4 w-4" />
                        )}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{name || "User"}</h1>
                    <p className="text-muted-foreground">{user.phone}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-primary/10 rounded-full text-sm text-primary capitalize">
                        {user.role.toLowerCase()}
                    </span>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile" className="gap-1 text-xs sm:text-sm">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-1 text-xs sm:text-sm">
                        <Lock className="h-4 w-4" />
                        <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-1 text-xs sm:text-sm">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Alerts</span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-1 text-xs sm:text-sm">
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">Settings</span>
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details and photo</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={user.phone}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">Phone number cannot be changed</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Default Pickup Address</Label>
                                <Textarea
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter your complete address for pickups"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Profile Photo</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="Or paste image URL..."
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload
                                    </Button>
                                </div>
                            </div>
                            <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                                {saving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Changes
                            </Button>
                        </CardContent>
                    </Card>

                    {user.role === 'KABADIWALA' && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Business Profile</CardTitle>
                                <CardDescription>Manage your business appearance</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Cover Photo</Label>
                                    <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 flex items-center justify-center group">
                                        {coverImageUrl ? (
                                            <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center text-muted-foreground p-4">
                                                <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <span className="text-sm">Upload Cover Photo</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button variant="secondary" size="sm" onClick={() => coverInputRef.current?.click()} disabled={uploading}>
                                                <Camera className="h-4 w-4 mr-2" />
                                                Change Cover
                                            </Button>
                                        </div>
                                        <input
                                            ref={coverInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'cover')}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your password to keep your account secure</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <Button
                                onClick={handleChangePassword}
                                disabled={changingPassword || !currentPassword || !newPassword}
                                className="w-full"
                            >
                                {changingPassword ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                Change Password
                            </Button>
                            <div className="pt-4 border-t">
                                <Link href="/reset-password" className="text-sm text-primary hover:underline">
                                    Forgot your password?
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>Manage how you receive notifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Push Notifications */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive notifications on your device
                                    </p>
                                </div>
                                {pushEnabled ? (
                                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                        <CheckCircle className="h-4 w-4" /> Enabled
                                    </span>
                                ) : (
                                    <Button size="sm" onClick={handleEnablePush}>
                                        Enable
                                    </Button>
                                )}
                            </div>

                            <div className="border-t pt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Order Updates</Label>
                                        <p className="text-sm text-muted-foreground">
                                            New orders, status changes, completions
                                        </p>
                                    </div>
                                    <Switch
                                        checked={orderNotifications}
                                        onCheckedChange={setOrderNotifications}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Messages</Label>
                                        <p className="text-sm text-muted-foreground">
                                            New chat messages from Kabadiwalas
                                        </p>
                                    </div>
                                    <Switch
                                        checked={messageNotifications}
                                        onCheckedChange={setMessageNotifications}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Promotions & Offers</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Special deals and rate updates
                                        </p>
                                    </div>
                                    <Switch
                                        checked={promoNotifications}
                                        onCheckedChange={setPromoNotifications}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>Customize your view</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Sun className="h-4 w-4" />
                                        <Label htmlFor="profile-dark-mode">Dark Mode</Label>
                                        <Moon className="h-4 w-4" />
                                    </div>
                                    <Switch
                                        id="profile-dark-mode"
                                        checked={theme === 'dark'}
                                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Account Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Member Since</span>
                                    <span>{new Date(user.createdAt).toLocaleDateString('en-IN', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Account Type</span>
                                    <span className="capitalize">{user.role.toLowerCase()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Links</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href="/privacy-policy" className="block">
                                    <Button variant="ghost" className="w-full justify-start">
                                        Privacy Policy
                                    </Button>
                                </Link>
                                <Link href="/terms-of-service" className="block">
                                    <Button variant="ghost" className="w-full justify-start">
                                        Terms of Service
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Delete Account */}
                        <Card className="border-red-200 dark:border-red-900">
                            <CardHeader>
                                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                                <CardDescription>
                                    Permanently delete your account and all data
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Account
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. All your data including orders,
                                                chats, favorites, and profile will be permanently deleted.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Enter your password</Label>
                                                <Input
                                                    type="password"
                                                    value={deletePassword}
                                                    onChange={(e) => setDeletePassword(e.target.value)}
                                                    placeholder="Current password"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Type &quot;DELETE MY ACCOUNT&quot; to confirm</Label>
                                                <Input
                                                    value={deleteConfirm}
                                                    onChange={(e) => setDeleteConfirm(e.target.value)}
                                                    placeholder="DELETE MY ACCOUNT"
                                                />
                                            </div>
                                        </div>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <Button
                                                variant="destructive"
                                                onClick={handleDeleteAccount}
                                                disabled={deleting || !deletePassword || deleteConfirm !== "DELETE MY ACCOUNT"}
                                            >
                                                {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                Delete Forever
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
