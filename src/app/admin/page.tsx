import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingBag, Flag, Coins, Recycle } from "lucide-react"

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'

async function getStats() {
    try {
        const [
            totalUsers,
            totalKabadiwalas,
            totalOrders,
            pendingOrders,
            totalReports
        ] = await Promise.all([
            db.user.count(),
            db.kabadiwalaProfile.count(),
            db.order.count(),
            db.order.count({ where: { status: "REQUESTED" } }),
            db.messageReport.count({ where: { isResolved: false } })
        ])

        return {
            totalUsers,
            totalKabadiwalas,
            totalOrders,
            pendingOrders,
            totalReports
        }
    } catch {
        return {
            totalUsers: 0,
            totalKabadiwalas: 0,
            totalOrders: 0,
            pendingOrders: 0,
            totalReports: 0
        }
    }
}

export default async function AdminDashboard() {
    const stats = await getStats()

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kabadiwalas</CardTitle>
                        <Recycle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalKabadiwalas}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
                        <Flag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{stats.totalReports}</div>
                        <p className="text-xs text-muted-foreground">Unresolved content reports</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                        <p className="text-xs text-muted-foreground">of {stats.totalOrders} total orders</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
