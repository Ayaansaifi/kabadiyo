"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Package, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { OrderCard } from "@/components/orders"

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

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("all")

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/orders")
            if (res.ok) {
                const data = await res.json()
                setOrders(data)
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const filteredOrders = orders.filter(order => {
        if (activeTab === "all") return true
        return order.status === activeTab.toUpperCase()
    })

    const stats = {
        all: orders.length,
        requested: orders.filter(o => o.status === "REQUESTED").length,
        accepted: orders.filter(o => o.status === "ACCEPTED").length,
        completed: orders.filter(o => o.status === "COMPLETED").length,
        cancelled: orders.filter(o => o.status === "CANCELLED").length,
    }

    if (loading) {
        return (
            <div className="container mx-auto py-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">My Orders</h1>
                    <p className="text-muted-foreground">Manage your pickup requests</p>
                </div>
                <Button variant="outline" onClick={fetchOrders} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <Card className={`cursor-pointer transition-all ${activeTab === "all" ? "ring-2 ring-primary" : ""}`} onClick={() => setActiveTab("all")}>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-2xl font-bold">{stats.all}</p>
                                <p className="text-xs text-muted-foreground">All Orders</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-all ${activeTab === "requested" ? "ring-2 ring-yellow-500" : ""}`} onClick={() => setActiveTab("requested")}>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-yellow-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.requested}</p>
                                <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-all ${activeTab === "accepted" ? "ring-2 ring-blue-500" : ""}`} onClick={() => setActiveTab("accepted")}>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.accepted}</p>
                                <p className="text-xs text-muted-foreground">Scheduled</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-all ${activeTab === "completed" ? "ring-2 ring-green-500" : ""}`} onClick={() => setActiveTab("completed")}>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.completed}</p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-all ${activeTab === "cancelled" ? "ring-2 ring-red-500" : ""}`} onClick={() => setActiveTab("cancelled")}>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.cancelled}</p>
                                <p className="text-xs text-muted-foreground">Cancelled</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">
                            {activeTab === "all" ? "No orders yet" : `No ${activeTab} orders`}
                        </p>
                        <Button asChild>
                            <a href="/market">Find Kabadiwala</a>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            userRole="SELLER"
                            onStatusUpdate={fetchOrders}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
