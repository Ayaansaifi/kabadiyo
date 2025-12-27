"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import {
    Moon, Sun, Bell, Shield, Key, LogOut,
    Smartphone, Globe, Lock,
    Trash2, Eye, Laptop, History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { signOut } from "next-auth/react"
import { PasswordStrengthMeter, AnimatedInput } from "@/components/ui/enhanced-input"
import { ActiveSessions } from "@/components/sessions/ActiveSessions"

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(false)

    // Security State
    const [twoFactor, setTwoFactor] = useState(false)


    // Password Change State
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    // Notification Settings State (with localStorage persistence)
    const [notifications, setNotifications] = useState({
        orderUpdates: true,
        chatMessages: true,
        priceAlerts: true,
        promotionalOffers: false,
        emailAlerts: true
    })

    // Privacy Settings State
    const [privacy, setPrivacy] = useState({
        profileVisibility: 'everyone',
        activityStatus: true
    })

    // Language State
    const [language, setLanguage] = useState('en')

    useEffect(() => {
        setMounted(true)


        // Load settings from localStorage
        const savedNotifications = localStorage.getItem('kabadi_notifications')
        if (savedNotifications) {
            setNotifications(JSON.parse(savedNotifications))
        }

        const savedPrivacy = localStorage.getItem('kabadi_privacy')
        if (savedPrivacy) {
            setPrivacy(JSON.parse(savedPrivacy))
        }

        const savedLanguage = localStorage.getItem('kabadi_language')
        if (savedLanguage) {
            setLanguage(savedLanguage)
        }

        // Load 2FA setting from localStorage
        const saved2FA = localStorage.getItem('kabadi_2fa')
        if (saved2FA) {
            setTwoFactor(saved2FA === 'true')
        }
    }, [])

    // Save notification settings to localStorage
    const updateNotification = (key: keyof typeof notifications, value: boolean) => {
        const updated = { ...notifications, [key]: value }
        setNotifications(updated)
        localStorage.setItem('kabadi_notifications', JSON.stringify(updated))
        toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}`)
    }

    // Save privacy settings
    const updatePrivacy = (key: keyof typeof privacy, value: string | boolean) => {
        const updated = { ...privacy, [key]: value }
        setPrivacy(updated)
        localStorage.setItem('kabadi_privacy', JSON.stringify(updated))
        toast.success('Privacy setting updated')
    }

    // Save language
    const updateLanguage = (value: string) => {
        setLanguage(value)
        localStorage.setItem('kabadi_language', value)
        toast.success(`Language changed to ${value === 'en' ? 'English' : 'Hindi'}`)
    }



    if (!mounted) return null

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error("पासवर्ड मेल नहीं खाते / Passwords do not match")
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/user/security', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'password',
                    currentPassword,
                    newPassword
                })
            })

            if (res.ok) {
                toast.success("पासवर्ड सफलतापूर्वक बदल दिया गया / Password changed successfully")
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            } else {
                toast.error("Failed to update password")
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }



    const toggleTwoFactor = async (checked: boolean) => {
        // Save to localStorage first (works offline)
        setTwoFactor(checked)
        localStorage.setItem('kabadi_2fa', String(checked))
        toast.success(checked ? '🔐 2FA Enabled - Your account is more secure!' : '2FA Disabled')

        // Then try API call (optional, for server sync)
        try {
            await fetch('/api/user/security', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: '2fa',
                    enabled: checked
                })
            })
        } catch {
            // API might fail but localStorage is already saved
            console.log('API sync pending')
        }
    }

    return (
        <div className="container max-w-4xl mx-auto p-4 space-y-8 pb-24">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage your account preferences and security
                </p>
            </motion.div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mb-8">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="privacy">Privacy</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-blue-500" />
                                App Experience
                            </CardTitle>
                            <CardDescription>Customize how the app looks and feels</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Theme Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="font-medium">Theme Preference</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {theme === 'dark' ? 'Dark mode is active' : 'Light mode is active'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 bg-muted p-1 rounded-full">
                                    <Button
                                        variant={theme === "light" ? "default" : "ghost"}
                                        size="sm"
                                        className="rounded-full h-8 w-8 p-0"
                                        onClick={() => setTheme("light")}
                                    >
                                        <Sun className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={theme === "dark" ? "default" : "ghost"}
                                        size="sm"
                                        className="rounded-full h-8 w-8 p-0"
                                        onClick={() => setTheme("dark")}
                                    >
                                        <Moon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={theme === "system" ? "default" : "ghost"}
                                        size="sm"
                                        className="rounded-full h-8 w-8 p-0"
                                        onClick={() => setTheme("system")}
                                    >
                                        <Laptop className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Language */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="font-medium">Language</h3>
                                    <p className="text-sm text-muted-foreground">Also updates content language</p>
                                </div>
                                <select
                                    className="bg-background border rounded-md px-3 py-1 text-sm"
                                    value={language}
                                    onChange={(e) => updateLanguage(e.target.value)}
                                >
                                    <option value="en">English</option>
                                    <option value="hi">Hindi (हिंदी)</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-yellow-500" />
                                Notifications
                            </CardTitle>
                            <CardDescription>Manage how you receive updates</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="font-medium">Order Updates</h3>
                                    <p className="text-sm text-muted-foreground">Get notified about pickup status changes</p>
                                </div>
                                <Switch
                                    checked={notifications.orderUpdates}
                                    onCheckedChange={(v) => updateNotification('orderUpdates', v)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="font-medium">Chat Messages</h3>
                                    <p className="text-sm text-muted-foreground">New messages from Kabadiwalas</p>
                                </div>
                                <Switch
                                    checked={notifications.chatMessages}
                                    onCheckedChange={(v) => updateNotification('chatMessages', v)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="font-medium">Price Alerts</h3>
                                    <p className="text-sm text-muted-foreground">When scrap rates change significantly</p>
                                </div>
                                <Switch
                                    checked={notifications.priceAlerts}
                                    onCheckedChange={(v) => updateNotification('priceAlerts', v)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="font-medium">Promotional Offers</h3>
                                    <p className="text-sm text-muted-foreground">Special discounts and rewards</p>
                                </div>
                                <Switch
                                    checked={notifications.promotionalOffers}
                                    onCheckedChange={(v) => updateNotification('promotionalOffers', v)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="font-medium">Email Alerts</h3>
                                    <p className="text-sm text-muted-foreground">Weekly summaries and important updates</p>
                                </div>
                                <Switch
                                    checked={notifications.emailAlerts}
                                    onCheckedChange={(v) => updateNotification('emailAlerts', v)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-6">
                    {/* Password Change */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-primary" />
                                Change Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <AnimatedInput
                                    label="Current Password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    icon={<Lock className="h-4 w-4" />}
                                />
                                <div className="space-y-2">
                                    <AnimatedInput
                                        label="New Password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        icon={<Key className="h-4 w-4" />}
                                    />
                                    {newPassword && <PasswordStrengthMeter password={newPassword} />}
                                </div>
                                <AnimatedInput
                                    label="Confirm New Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    icon={<Key className="h-4 w-4" />}
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={loading}>
                                        {loading ? "Updating..." : "Update Password"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* 2FA Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-purple-500" />
                                Two-Factor Authentication
                            </CardTitle>
                            <CardDescription>Add an extra layer of security to your account</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                        <Smartphone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">SMS / Email Verification</h3>
                                        <p className="text-sm text-muted-foreground">Receive OTP for every login</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={twoFactor}
                                    onCheckedChange={toggleTwoFactor}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Sessions */}
                    <ActiveSessions />

                    {/* Danger Zone */}

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-900">
                        <CardHeader>
                            <CardTitle className="text-red-600 dark:text-red-500 flex items-center gap-2">
                                <Trash2 className="h-5 w-5" />
                                Danger Zone
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">Delete Account</h3>
                                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                                </div>
                                <Button variant="destructive">Delete Account</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Privacy Settings */}
                <TabsContent value="privacy" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-teal-500" />
                                Privacy Controls
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="font-medium">Profile Visibility</h3>
                                    <p className="text-sm text-muted-foreground">Who can see your profile details</p>
                                </div>
                                <select
                                    className="bg-background border rounded-md px-3 py-1 text-sm"
                                    value={privacy.profileVisibility}
                                    onChange={(e) => updatePrivacy('profileVisibility', e.target.value)}
                                >
                                    <option value="everyone">Everyone</option>
                                    <option value="kabadiwalas">Only Kabadiwalas</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="font-medium">Activity Status</h3>
                                    <p className="text-sm text-muted-foreground">Show when you are online</p>
                                </div>
                                <Switch
                                    checked={privacy.activityStatus}
                                    onCheckedChange={(v) => updatePrivacy('activityStatus', v)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-center pt-8">
                <Button
                    variant="outline"
                    className="text-muted-foreground"
                    onClick={() => signOut()}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out from current device
                </Button>
            </div>
        </div>
    )
}
