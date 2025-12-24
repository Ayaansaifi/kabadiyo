import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    MessageCircle, Package, Star, CheckCircle, XCircle,
    TrendingUp, Users, Clock, ArrowRight, Calendar, IndianRupee,
    Settings, Shield
} from "lucide-react"
import { revalidatePath } from "next/cache"
import { RateManager } from "@/components/dashboard/RateManager"
import { DealerEarningsChart } from "@/components/dashboard/DealerEarningsChart"
import { InventoryManager } from "@/components/dashboard/InventoryManager"
import { BusinessStatus } from "@/components/dashboard/BusinessStatus"

async function getUser() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!userId) return null
    return db.user.findUnique({
        where: { id: userId },
        include: { kabadiwalaProfile: true }
    })
}

async function updateOrderStatus(formData: FormData) {
    "use server"
    const orderId = formData.get("orderId") as string
    const status = formData.get("status") as string

    await db.order.update({
        where: { id: orderId },
        data: { status }
    })

    revalidatePath("/kabadiwala/dashboard")
}

export default async function KabadiwalaDashboard() {
    const user = await getUser()
    if (!user) redirect("/login")
    if (user.role !== "KABADIWALA") redirect("/dashboard")

    interface ExtendedProfile {
        id: string
        businessName: string
        rating: number
        totalReviews: number
        totalPickups: number
        isVerified: boolean
        isAvailable: boolean
        inventory: string | null
        rates: string | null
        avgResponseTime: number
        serviceArea: string
        coverImage?: string | null
        // Add other properties that match your prisma schema
        userId: string
    }

    const profile = user.kabadiwalaProfile as unknown as ExtendedProfile

    // Get all orders
    const orders = await db.order.findMany({
        where: { buyerId: user.id },
        include: { seller: true, review: true },
        orderBy: { createdAt: "desc" }
    })

    const pendingOrders = orders.filter(o => o.status === "REQUESTED")
    const acceptedOrders = orders.filter(o => o.status === "ACCEPTED")
    const completedOrders = orders.filter(o => o.status === "COMPLETED")
    const cancelledOrders = orders.filter(o => o.status === "CANCELLED")

    // Calculate earnings (from completed orders)
    const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

    // Get recent reviews
    const recentReviews = await db.review.findMany({
        where: {
            order: { buyerId: user.id }
        },
        include: { reviewer: true, order: true },
        orderBy: { createdAt: "desc" },
        take: 5
    })

    // Get unread messages count
    const chats = await db.chat.findMany({
        where: { buyerId: user.id },
        include: {
            messages: { where: { isRead: false, senderId: { not: user.id } } }
        }
    })
    const unreadCount = chats.reduce((sum, c) => sum + c.messages.length, 0)

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        {profile?.businessName || user.name}
                        {profile?.isVerified && (
                            <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200">
                                <CheckCircle className="h-3 w-3 mr-1" /> Verified
                            </Badge>
                        )}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
                        <span className="flex items-center px-2 py-1 bg-muted rounded-md text-xs">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                            {profile?.rating?.toFixed(1) || "0.0"} ({profile?.totalReviews || 0} reviews)
                        </span>
                        <span className="flex items-center px-2 py-1 bg-muted rounded-md text-xs">
                            <Package className="h-3 w-3 mr-1" />
                            {profile?.totalPickups || 0} pickups
                        </span>
                    </div>
                </div>
                <div className="flex w-full md:w-auto items-center gap-3">
                    <div className="flex-1 md:flex-none">
                        <BusinessStatus isAvailable={profile?.isAvailable ?? true} />
                    </div>
                    <Link href="/kabadiwala/profile" className="flex-1 md:flex-none">
                        <Button variant="outline" className="w-full">Edit Profile</Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 hover:scale-105 transition-transform duration-200 border-none shadow-sm">
                    <CardContent className="p-4 pt-6">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-2 bg-white dark:bg-black/20 rounded-full shadow-sm">
                                <Package className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{pendingOrders.length}</p>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:scale-105 transition-transform duration-200 border-none shadow-sm">
                    <CardContent className="p-4 pt-6">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-2 bg-white dark:bg-black/20 rounded-full shadow-sm">
                                <Clock className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{acceptedOrders.length}</p>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scheduled</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 hover:scale-105 transition-transform duration-200 border-none shadow-sm">
                    <CardContent className="p-4 pt-6">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-2 bg-white dark:bg-black/20 rounded-full shadow-sm">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{completedOrders.length}</p>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Done</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 hover:scale-105 transition-transform duration-200 border-none shadow-sm">
                    <CardContent className="p-4 pt-6">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-2 bg-white dark:bg-black/20 rounded-full shadow-sm">
                                <IndianRupee className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-purple-700 dark:text-purple-400 truncate w-full">₹{totalEarnings.toLocaleString()}</p>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Earned</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 hover:scale-105 transition-transform duration-200 border-none shadow-sm col-span-2 md:col-span-1">
                    <CardContent className="p-4">
                        <Link href="/chat" className="flex md:flex-col items-center justify-center gap-3 h-full">
                            <div className="p-2 bg-white dark:bg-black/20 rounded-full shadow-sm relative">
                                <MessageCircle className="h-5 w-5 text-pink-500" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="text-left md:text-center">
                                <p className="text-2xl font-bold text-pink-700 dark:text-pink-400">{chats.length}</p>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chats</p>
                            </div>
                            <ArrowRight className="h-4 w-4 ml-auto md:hidden text-pink-400" />
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Business Tools Section */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-2">
                    <DealerEarningsChart />
                </div>
                <div>
                    <RateManager
                        kabadiwalaId={profile?.id || ""}
                        initialRates={profile?.rates ? JSON.parse(profile.rates) : undefined}
                    />
                </div>
                <div>
                    <InventoryManager
                        kabadiwalaId={profile?.id || ""}
                        initialInventory={profile?.inventory ? JSON.parse(profile.inventory) : undefined}
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Pending Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-orange-500" />
                                New Pickup Requests
                                {pendingOrders.length > 0 && (
                                    <Badge variant="secondary">{pendingOrders.length}</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pendingOrders.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No pending requests</p>
                            ) : (
                                <div className="space-y-4">
                                    {pendingOrders.slice(0, 5).map((order) => (
                                        <div key={order.id} className="flex items-start justify-between p-4 border rounded-lg">
                                            <div className="flex gap-4">
                                                <Avatar>
                                                    <AvatarFallback>{order.seller.name?.[0] || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{order.seller.name}</p>
                                                    <p className="text-sm text-muted-foreground">{order.address}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {order.pickupDate
                                                            ? new Date(order.pickupDate).toLocaleDateString()
                                                            : "Date TBD"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <form action={updateOrderStatus}>
                                                    <input type="hidden" name="orderId" value={order.id} />
                                                    <input type="hidden" name="status" value="ACCEPTED" />
                                                    <Button type="submit" size="sm" className="w-full">Accept</Button>
                                                </form>
                                                <form action={updateOrderStatus}>
                                                    <input type="hidden" name="orderId" value={order.id} />
                                                    <input type="hidden" name="status" value="CANCELLED" />
                                                    <Button type="submit" size="sm" variant="destructive" className="w-full">
                                                        Decline
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Pickups */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                                Upcoming Pickups
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {acceptedOrders.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No upcoming pickups</p>
                            ) : (
                                <div className="space-y-3">
                                    {acceptedOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarFallback>{order.seller.name?.[0] || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{order.seller.name}</p>
                                                    <p className="text-sm text-muted-foreground">{order.address.substring(0, 40)}...</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-sm text-muted-foreground">
                                                    {order.pickupDate && new Date(order.pickupDate).toLocaleDateString()}
                                                </p>
                                                <form action={updateOrderStatus}>
                                                    <input type="hidden" name="orderId" value={order.id} />
                                                    <input type="hidden" name="status" value="COMPLETED" />
                                                    <Button type="submit" size="sm" variant="outline">
                                                        Complete
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Recent Reviews */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                Recent Reviews
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentReviews.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No reviews yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {recentReviews.map((review) => (
                                        <div key={review.id} className="border-b pb-4 last:border-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-xs">{review.reviewer.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium">{review.reviewer.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-3 w-3 ${i < review.rating
                                                            ? "fill-yellow-500 text-yellow-500"
                                                            : "text-gray-300"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            {review.comment && (
                                                <p className="text-sm text-muted-foreground">{review.comment}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Acceptance Rate</span>
                                <span className="font-semibold">
                                    {orders.length > 0
                                        ? Math.round(((acceptedOrders.length + completedOrders.length) / orders.length) * 100)
                                        : 0}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Completion Rate</span>
                                <span className="font-semibold">
                                    {(acceptedOrders.length + completedOrders.length) > 0
                                        ? Math.round((completedOrders.length / (acceptedOrders.length + completedOrders.length)) * 100)
                                        : 0}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Avg Response</span>
                                <span className="font-semibold">{profile?.avgResponseTime || 0} min</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
