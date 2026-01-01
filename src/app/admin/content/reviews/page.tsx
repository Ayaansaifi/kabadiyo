import { db } from "@/lib/db"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ReviewActions } from "./review-actions" // Client component
import { Star } from "lucide-react"

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'

async function getReviews() {
    return await db.review.findMany({
        include: {
            reviewer: {
                select: { name: true, phone: true }
            },
            order: {
                include: {
                    seller: { // The Kabadiwala being reviewed
                        include: {
                            kabadiwalaProfile: { select: { businessName: true } }
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export default async function ReviewsPage() {
    const reviews = await getReviews()

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Review Moderation</h2>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Rating</TableHead>
                            <TableHead>Reviewer</TableHead>
                            <TableHead>Kabadiwala</TableHead>
                            <TableHead>Comment</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No reviews found
                                </TableCell>
                            </TableRow>
                        ) : (
                            reviews.map((review) => (
                                <TableRow key={review.id}>
                                    <TableCell>
                                        <div className="flex items-center text-yellow-500 font-medium">
                                            {review.rating} <Star className="h-3 w-3 ml-1 fill-current" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{review.reviewer.name}</div>
                                            <div className="text-xs text-muted-foreground">{review.reviewer.phone}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {review.order.seller.kabadiwalaProfile?.businessName || "Unknown"}
                                    </TableCell>
                                    <TableCell className="max-w-md truncate text-muted-foreground">
                                        &quot;{review.comment}&quot;
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ReviewActions reviewId={review.id} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
