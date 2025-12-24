"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Lock, Moon, Sun, User, Shield, LogOut, ChevronRight, Globe, Maximize2, Trash2, Database } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

export default function SettingsPage() {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [emailNotifs, setEmailNotifs] = useState(true)
    const [pushNotifs, setPushNotifs] = useState(true)
    const [mounted, setMounted] = useState(false)

    // Ensure hydration match
    useEffect(() => {
        setMounted(true)
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [])

    const handleSave = () => {
        toast.success("Settings saved successfully")
    }

    const handleLogout = async () => {
        // Assuming there is a logout API or next-auth signOut
        // For now, redirecting to login which might handle cleanup or usage of signOut from next-auth/react
        // ideally use signOut() from next-auth/react
        window.location.href = "/api/auth/signout"
    }

    if (!mounted) {
        return <div className="p-8">Loading settings...</div>
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="general" className="gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">General</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Lock className="h-4 w-4" />
                        <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general">
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance & Language</CardTitle>
                                <CardDescription>Customize how the app looks and feels of your experience.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Sun className="h-4 w-4" />
                                        <Label htmlFor="dark-mode">Dark Mode</Label>
                                        <Moon className="h-4 w-4" />
                                    </div>
                                    <Switch
                                        id="dark-mode"
                                        checked={theme === 'dark'}
                                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                    />
                                </div>
                                <div className="flex items-center justify-between border-t pt-4">
                                    <div className="flex items-center space-x-2">
                                        <Globe className="h-4 w-4" />
                                        <Label>Language / भाषा</Label>
                                    </div>
                                    <Select defaultValue="en">
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Data Management</CardTitle>
                                <CardDescription>Manage your local app data and cache.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Database className="h-4 w-4" />
                                        <Label>Clear App Cache</Label>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => {
                                        localStorage.clear()
                                        sessionStorage.clear()
                                        toast.success("Cache cleared successfully")
                                        window.location.reload()
                                    }}>
                                        Clear Data
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Settings</CardTitle>
                                <CardDescription>Manage your public profile information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button variant="outline" className="w-full justify-between" onClick={() => router.push("/profile")}>
                                    <span className="flex items-center"><User className="mr-2 h-4 w-4" /> Edit Profile</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                {/* Only show if user might be Kabadiwala, or just show for upselling */}
                                <Button variant="outline" className="w-full justify-between" onClick={() => router.push("/kabadiwala/profile")}>
                                    <span className="flex items-center"><Shield className="mr-2 h-4 w-4" /> Kabadiwala Profile</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Choose what you want to be notified about.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="email-notifs">Email Notifications</Label>
                                <Switch id="email-notifs" checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="push-notifs">Push Notifications</Label>
                                <Switch id="push-notifs" checked={pushNotifs} onCheckedChange={setPushNotifs} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave}>Save Preferences</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Manage your password and account security.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Change Password</Label>
                                <Input type="password" placeholder="Current Password" />
                                <Input type="password" placeholder="New Password" />
                                <Input type="password" placeholder="Confirm New Password" />
                            </div>
                            <Button onClick={handleSave}>Update Password</Button>
                        </CardContent>
                    </Card>

                    <Card className="mt-6 border-red-200 dark:border-red-900">
                        <CardHeader>
                            <CardTitle className="text-red-600">Danger Zone</CardTitle>
                            <CardDescription>Irreversible account actions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="destructive" className="w-full">Delete Account</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-8">
                <Button variant="ghost" className="text-red-500 w-full" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Log Out
                </Button>
            </div>
        </div>
    )
}
