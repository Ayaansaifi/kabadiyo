import { db } from "@/lib/db"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'

async function getSystemData() {
    const [accessLogs, rateLimits] = await Promise.all([
        db.adminAccessLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        }),
        db.rateLimit.findMany({
            orderBy: { count: 'desc' },
            take: 50
        })
    ])
    return { accessLogs, rateLimits }
}

export default async function SystemPage() {
    const { accessLogs, rateLimits } = await getSystemData()

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">System Health</h2>

            <Tabs defaultValue="logs">
                <TabsList>
                    <TabsTrigger value="logs">Access Logs</TabsTrigger>
                    <TabsTrigger value="ratelimits">Rate Limits</TabsTrigger>
                </TabsList>

                <TabsContent value="logs" className="space-y-4">
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accessLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No logs found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    accessLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {formatDistanceToNow(log.createdAt)} ago
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={log.action.includes("FAIL") ? "destructive" : "outline"}>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{log.details || "-"}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="ratelimits" className="space-y-4">
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Endpoint</TableHead>
                                    <TableHead>Hits</TableHead>
                                    <TableHead>Last Hit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rateLimits.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No active rate limits
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rateLimits.map((limit) => (
                                        <TableRow key={limit.id}>
                                            <TableCell className="font-mono">{limit.ip}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{limit.endpoint}</TableCell>
                                            <TableCell>
                                                <Badge variant={limit.count > 100 ? "destructive" : "secondary"}>
                                                    {limit.count}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDistanceToNow(limit.windowStart)} ago</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
