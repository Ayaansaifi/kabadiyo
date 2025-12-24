"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, Loader2, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

interface Order {
    id: string
    buyer: {
        name: string
        kabadiwalaProfile: {
            businessName: string
        }
    }
    pickupDate: string
    totalAmount: number
}

export default function ReviewPage() {
    const router = useRouter()
    const params = useParams()
    const orderId = params.orderId as string

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [order, setOrder] = useState<Order | null>(null)
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        fetchOrder()
    }, [orderId])

    async function fetchOrder() {
        try {
            const res = await fetch(`/api/reviews/${orderId}`)
            if (res.ok) {
                const data = await res.json()
                if (data.existingReview) {
                    setSubmitted(true)
                    setRating(data.existingReview.rating)
                    setComment(data.existingReview.comment || "")
                }
                setOrder(data.order)
            } else if (res.status === 400) {
                setError("Order is not completed yet")
            } else {
                router.push("/dashboard")
            }
        } catch {
            router.push("/dashboard")
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit() {
        if (rating === 0) {
            setError("Please select a rating")
            return
        }

        setSubmitting(true)
        setError("")

        try {
            const res = await fetch(`/api/reviews/${orderId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, comment })
            })

            if (res.ok) {
                setSubmitted(true)
            } else {
                const data = await res.json()
                setError(data.error || "Failed to submit review")
            }
        } catch {
            setError("Something went wrong")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!order) return null

    return (
        <div className="container mx-auto py-8 px-4 max-w-lg">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {submitted ? (
                    <Card className="text-center">
                        <CardContent className="py-12">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                            >
                                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                            </motion.div>
                            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
                            <p className="text-muted-foreground mb-6">
                                Your review helps other users find great Kabadiwalas
                            </p>
                            <div className="flex justify-center gap-1 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-8 w-8 ${star <= rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                                            }`}
                                    />
                                ))}
                            </div>
                            <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>Rate Your Experience</CardTitle>
                            <CardDescription>How was your pickup with {order.buyer.kabadiwalaProfile.businessName}?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Kabadiwala Info */}
                            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>{order.buyer.kabadiwalaProfile.businessName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{order.buyer.kabadiwalaProfile.businessName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.pickupDate && new Date(order.pickupDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-3">Tap to rate</p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <motion.button
                                            key={star}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                            className="p-1"
                                        >
                                            <Star
                                                className={`h-10 w-10 transition-colors ${star <= (hoverRating || rating)
                                                        ? "fill-yellow-500 text-yellow-500"
                                                        : "text-gray-300"
                                                    }`}
                                            />
                                        </motion.button>
                                    ))}
                                </div>
                                <p className="text-sm mt-2">
                                    {rating === 1 && "Poor"}
                                    {rating === 2 && "Fair"}
                                    {rating === 3 && "Good"}
                                    {rating === 4 && "Very Good"}
                                    {rating === 5 && "Excellent!"}
                                </p>
                            </div>

                            {/* Comment */}
                            <div>
                                <Textarea
                                    placeholder="Share your experience (optional)..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 text-center">{error}</p>
                            )}

                            <Button
                                onClick={handleSubmit}
                                disabled={submitting || rating === 0}
                                className="w-full"
                                size="lg"
                            >
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Review
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </motion.div>
        </div>
    )
}
