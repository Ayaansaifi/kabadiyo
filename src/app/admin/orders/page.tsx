import { db } from "@/lib/db"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { OrderAdminActions } from "./order-admin-actions"

async function getOrders() {
    return await db.order.findMany({
        include: {
            // Buyer
            buyer: { select: { name: true, phone: true } },
            // Seller (Kabadiwala)
            seller: {
                include: {
                    kabadiwalaProfile: { select: { businessName: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    })
}

export default async function OrdersPage() {
    const orders = await getOrders()

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Global Orders</h2>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Kabadiwala</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono text-xs">
                                    {order.id.slice(0, 8)}...
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <div>{order.buyer.name}</div>
                                        <div className="text-xs text-muted-foreground">{order.buyer.phone}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {order.seller.kabadiwalaProfile?.businessName || order.seller.name || "Unknown"}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                    {order.items}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={order.status === "COMPLETED" ? "default" : "secondary"}>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium flex items-center justify-end gap-2">
                                    <span>₹{order.totalAmount}</span>
                                    <OrderAdminActions orderId={order.id} currentStatus={order.status} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
