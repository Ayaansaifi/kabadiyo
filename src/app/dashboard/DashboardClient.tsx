"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    MessageCircle, Package, Star, TrendingUp,
    ArrowRight, Heart, Clock, Loader2, RefreshCw, Plus, Leaf
} from "lucide-react"
import { OrderCard } from "@/components/orders"
import { StoriesBar } from "@/components/stories"
import { ScrapRatesTicker } from "@/components/dashboard/ScrapRatesTicker"
import { EcoDailyTips } from "@/components/dashboard/EcoDailyTips"
import { ReferralWidget } from "@/components/dashboard/ReferralWidget"
import { UserGamification } from "@/components/dashboard/UserGamification"
import { PullToRefresh } from "@/components/ui/PullToRefresh"
import { useIsNativePlatform } from "@/hooks/useNativePlatform"
import dynamic from "next/dynamic"

const EarningsChart = dynamic(() => import("@/components/dashboard/EarningsChart").then(mod => mod.EarningsChart), {
    loading: () => <div className="h-[250px] w-full bg-muted/20 animate-pulse rounded-xl" />,
    ssr: false
})

interface User {
    id: string
    name: string | null
    role: string
    favorites: { kabadiwalaId: string }[]
}

interface Order {
    id: string
    status: string
    address: string
    pickupDate: string | null
    totalAmount: number | null
    items: string | null
    createdAt: string
    buyer: {
        id: string
        name: string | null
        phone: string
        kabadiwalaProfile?: {
            businessName: string
            rating: number
            isVerified: boolean
        } | null
    }
    review?: {
        rating: number
        comment: string | null
    } | null
}

interface FavoriteKabadiwala {
    id: string
    name: string | null
    kabadiwalaProfile?: {
        businessName: string | null
        rating: number
    } | null
}



export function DashboardClient({ initialUser }: { initialUser: User }) {
    const { isNative, isLoading: platformLoading } = useIsNativePlatform()
    const [user] = useState(initialUser)
    const [orders, setOrders] = useState<Order[]>([])
    const [favorites, setFavorites] = useState<FavoriteKabadiwala[]>([])
    const [loading, setLoading] = useState(true)

    // Wait for platform check to avoid hydration flicker

    const fetchData = async () => {
        setLoading(true)
        try {
            const [ordersRes, favoritesRes] = await Promise.all([
                fetch("/api/orders"),
                fetch("/api/favorites")
            ])

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json()
                setOrders(Array.isArray(ordersData) ? ordersData : [])
            }

            if (favoritesRes.ok) {
                const favData = await favoritesRes.json()
                if (Array.isArray(favData)) {
                    setFavorites(
                        favData
                            .map((f: { kabadiwala: FavoriteKabadiwala | null }) => f.kabadiwala)
                            .filter((k: FavoriteKabadiwala | null): k is FavoriteKabadiwala => k !== null && k !== undefined)
                    )
                }
            }
        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (platformLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    }

    const totalOrders = orders.length
    const completedOrders = orders.filter(o => o.status === "COMPLETED").length
    const pendingOrders = orders.filter(o => o.status === "REQUESTED" || o.status === "ACCEPTED").length
    const pendingReviews = orders.filter(o => o.status === "COMPLETED" && !o.review).length

    const dashboardContent = (
        <div className="container mx-auto py-8 px-4">
            {/* Welcome Header - Glassmorphic */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-white/70 dark:bg-card/50 backdrop-blur-lg p-6 rounded-3xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                            {user.name?.[0] || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Hello, {user.name}!</h1>
                        <p className="text-muted-foreground font-medium">Ready to recycle and earn today?</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={fetchData} disabled={loading} className="rounded-full shadow-sm hover:bg-primary/5 border-primary/20">
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Link href="/market">
                        <Button className="rounded-full shadow-lg bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 border-0 text-white gap-2 px-6">
                            Book Pickup <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Daily Rates Ticker */}
            <div className="mb-8">
                <ScrapRatesTicker />
            </div>

            {/* Stories Section - Floating & Modern */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                        <Star className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h2 className="text-lg font-bold">Stories & Updates</h2>
                </div>
                <div className="bg-white/60 dark:bg-card/40 backdrop-blur-md rounded-2xl p-4 border shadow-sm overflow-hidden">
                    <StoriesBar currentUserId={user.id} />
                </div>
            </div>

            {/* Stats Grid - 3D Cards with Hover Effects */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <Link href="/orders">
                    <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-card overflow-hidden group">
                        <CardContent className="p-6 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Package className="h-24 w-24 -rotate-12 text-blue-600" />
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl w-fit mb-4 text-blue-600 dark:text-blue-400">
                                <Package className="h-6 w-6" />
                            </div>
                            <p className="text-4xl font-black text-blue-700 dark:text-blue-400 mb-1">{totalOrders}</p>
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Orders</p>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-card overflow-hidden group">
                    <CardContent className="p-6 relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock className="h-24 w-24 rotate-12 text-orange-600" />
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-2xl w-fit mb-4 text-orange-600 dark:text-orange-400">
                            <Clock className="h-6 w-6" />
                        </div>
                        <p className="text-4xl font-black text-orange-600 dark:text-orange-400 mb-1">{pendingOrders}</p>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pending</p>
                    </CardContent>
                </Card>

                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-card overflow-hidden group">
                    <CardContent className="p-6 relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="h-24 w-24 -rotate-6 text-green-600" />
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-2xl w-fit mb-4 text-green-600 dark:text-green-400">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <p className="text-4xl font-black text-green-600 dark:text-green-400 mb-1">{completedOrders}</p>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Completed</p>
                    </CardContent>
                </Card>

                <Link href="/favorites">
                    <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/20 dark:to-card overflow-hidden group">
                        <CardContent className="p-6 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Heart className="h-24 w-24 rotate-6 text-pink-600" />
                            </div>
                            <div className="p-3 bg-pink-100 dark:bg-pink-900/40 rounded-2xl w-fit mb-4 text-pink-600 dark:text-pink-400">
                                <Heart className="h-6 w-6" />
                            </div>
                            <p className="text-4xl font-black text-pink-600 dark:text-pink-400 mb-1">{favorites.length}</p>
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Favorites</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Main Content Area */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Gamification Module */}
                    <UserGamification totalWeight={42.5} />

                    {/* Recent Orders List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                Recent Activity
                            </h2>
                            <Link href="/orders">
                                <Button variant="ghost" size="sm" className="hover:text-primary hover:bg-primary/10 transition-colors">View All Orders</Button>
                            </Link>
                        </div>

                        {loading ? (
                            <Card className="border-none shadow-md">
                                <CardContent className="py-12 flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </CardContent>
                            </Card>
                        ) : orders.length === 0 ? (
                            <Card className="border-none shadow-md bg-white/50 backdrop-blur">
                                <CardContent className="py-12 text-center">
                                    <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                                    <p className="text-lg font-medium text-muted-foreground mb-4">No recent orders found</p>
                                    <Link href="/market">
                                        <Button className="rounded-full shadow-lg bg-primary text-white">Book Your First Pickup</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {orders.slice(0, 5).map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        userRole="SELLER"
                                        onStatusUpdate={fetchData}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Quick Actions Panel */}
                    <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-card dark:to-background">
                        <CardHeader className="border-b border-dashed">
                            <CardTitle className="text-lg flex items-center gap-2">
                                ⚡ Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <Link href="/market" className="block">
                                <Button variant="outline" className="w-full justify-start h-12 text-base font-normal hover:border-green-500 hover:text-green-600 transition-colors bg-white dark:bg-card shadow-sm">
                                    <Package className="h-5 w-5 mr-3 text-green-500" /> Book Pickup
                                </Button>
                            </Link>
                            <Link href="/orders" className="block">
                                <Button variant="outline" className="w-full justify-start h-12 text-base font-normal hover:border-blue-500 hover:text-blue-600 transition-colors bg-white dark:bg-card shadow-sm">
                                    <Clock className="h-5 w-5 mr-3 text-blue-500" /> View Orders
                                </Button>
                            </Link>
                            <Link href="/chat" className="block">
                                <Button variant="outline" className="w-full justify-start h-12 text-base font-normal hover:border-purple-500 hover:text-purple-600 transition-colors bg-white dark:bg-card shadow-sm">
                                    <MessageCircle className="h-5 w-5 mr-3 text-purple-500" /> My Chats
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Eco Tips Carousel */}
                    <EcoDailyTips />

                    {/* Referral Widget */}
                    <ReferralWidget />
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50/50 to-blue-50/30 dark:from-background dark:to-background pb-12">
            {isNative ? (
                <PullToRefresh onRefresh={fetchData}>
                    {dashboardContent}
                </PullToRefresh>
            ) : (
                dashboardContent
            )}
        </div>
    )
}
