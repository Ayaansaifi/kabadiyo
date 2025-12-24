"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    MapPin, Calendar, Clock, Star, CheckCircle, XCircle,
    Phone, MessageCircle, Loader2, Package, Ban
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { OrderTimeline } from "./OrderTimeline"

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

interface OrderCardProps {
    order: Order
    userRole: "SELLER" | "KABADIWALA"
    onStatusUpdate?: () => void
}

export function OrderCard({ order, userRole, onStatusUpdate }: OrderCardProps) {
    const [loading, setLoading] = useState(false)
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const [cancelReason, setCancelReason] = useState("")
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
    const [totalAmount, setTotalAmount] = useState("")

    const updateStatus = async (status: string, extra?: Record<string, unknown>) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, ...extra })
            })
            if (res.ok) {
                toast.success(`Order ${status.toLowerCase()}!`)
                onStatusUpdate?.()
            } else {
                toast.error("Failed to update order")
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        updateStatus("CANCELLED", { cancelReason })
        setCancelDialogOpen(false)
    }

    const handleComplete = () => {
        updateStatus("COMPLETED", { totalAmount: parseFloat(totalAmount) || 0 })
        setCompleteDialogOpen(false)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "REQUESTED": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
            case "ACCEPTED": return "bg-blue-500/10 text-blue-600 border-blue-500/20"
            case "COMPLETED": return "bg-green-500/10 text-green-600 border-green-500/20"
            case "CANCELLED": return "bg-red-500/10 text-red-600 border-red-500/20"
            default: return ""
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "REQUESTED": return <Clock className="h-3 w-3" />
            case "ACCEPTED": return <Package className="h-3 w-3" />
            case "COMPLETED": return <CheckCircle className="h-3 w-3" />
            case "CANCELLED": return <Ban className="h-3 w-3" />
            default: return null
        }
    }

    const businessName = order.buyer.kabadiwalaProfile?.businessName || order.buyer.name
    const isVerified = order.buyer.kabadiwalaProfile?.isVerified

    return (
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4" style={{
            borderLeftColor: order.status === "COMPLETED" ? "#22c55e" :
                order.status === "CANCELLED" ? "#ef4444" :
                    order.status === "ACCEPTED" ? "#3b82f6" : "#eab308"
        }}>
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex gap-4 flex-1">
                        <Avatar className="h-12 w-12 border-2 border-primary/10">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold">
                                {businessName?.[0] || 'K'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-lg">{businessName}</p>
                                {isVerified && (
                                    <Badge variant="secondary" className="gap-1 text-xs">
                                        <CheckCircle className="h-3 w-3 text-blue-500" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{order.address}</span>
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {order.pickupDate
                                        ? new Date(order.pickupDate).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })
                                        : "Date TBD"}
                                </span>
                                {order.totalAmount && order.totalAmount > 0 && (
                                    <span className="font-semibold text-green-600">
                                        ₹{order.totalAmount.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline (Hidden on small screens if needed, or always shown) */}
                    <div className="hidden md:block w-1/3 px-4">
                        <OrderTimeline
                            status={order.status}
                            createdAt={order.createdAt}
                            pickupDate={order.pickupDate}
                        />
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-3">
                        <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                        </Badge>

                        {/* Action Buttons based on role and status */}
                        <div className="flex flex-wrap gap-2">
                            {/* Kabadiwala Actions */}
                            {userRole === "KABADIWALA" && order.status === "REQUESTED" && (
                                <>
                                    <Button
                                        size="sm"
                                        onClick={() => updateStatus("ACCEPTED")}
                                        disabled={loading}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                        Accept
                                    </Button>
                                    <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="destructive">
                                                <XCircle className="h-4 w-4 mr-1" /> Decline
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Decline Order</DialogTitle>
                                                <DialogDescription>
                                                    Please provide a reason for declining this order.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <Textarea
                                                placeholder="Reason (optional)..."
                                                value={cancelReason}
                                                onChange={(e) => setCancelReason(e.target.value)}
                                            />
                                            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
                                                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                Confirm Decline
                                            </Button>
                                        </DialogContent>
                                    </Dialog>
                                </>
                            )}

                            {userRole === "KABADIWALA" && order.status === "ACCEPTED" && (
                                <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                            <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Complete Pickup</DialogTitle>
                                            <DialogDescription>
                                                Enter the total amount paid to the customer.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Total Amount Paid (₹)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 500"
                                                    value={totalAmount}
                                                    onChange={(e) => setTotalAmount(e.target.value)}
                                                />
                                            </div>
                                            <Button onClick={handleComplete} disabled={loading} className="w-full">
                                                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                Complete Order
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}

                            {/* Seller Actions */}
                            {userRole === "SELLER" && order.status === "REQUESTED" && (
                                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                                            <XCircle className="h-4 w-4 mr-1" /> Cancel
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Cancel Order</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to cancel this pickup request?
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Textarea
                                            placeholder="Reason (optional)..."
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                        />
                                        <Button variant="destructive" onClick={handleCancel} disabled={loading}>
                                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            Confirm Cancel
                                        </Button>
                                    </DialogContent>
                                </Dialog>
                            )}

                            {/* Common Actions */}
                            <Link href={`/chat/${order.buyer.id}`}>
                                <Button size="sm" variant="outline">
                                    <MessageCircle className="h-4 w-4 mr-1" /> Chat
                                </Button>
                            </Link>

                            <a href={`tel:${order.buyer.phone}`}>
                                <Button size="sm" variant="outline">
                                    <Phone className="h-4 w-4 mr-1" /> Call
                                </Button>
                            </a>

                            {/* Review Button for Completed Orders */}
                            {order.status === "COMPLETED" && !order.review && userRole === "SELLER" && (
                                <Link href={`/reviews/${order.id}`}>
                                    <Button size="sm" variant="secondary">
                                        <Star className="h-4 w-4 mr-1" /> Rate
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Show Review Stars if exists */}
                        {order.review && (
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < order.review!.rating
                                            ? "fill-yellow-500 text-yellow-500"
                                            : "text-gray-300"
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Timeline */}
                <div className="md:hidden mt-4 pt-4 border-t">
                    <OrderTimeline
                        status={order.status}
                        createdAt={order.createdAt}
                        pickupDate={order.pickupDate}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
