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
import { ReportActions } from "./report-actions" // Client component

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'

async function getReports() {
    return await db.messageReport.findMany({
        where: { isResolved: false }, // Only show unresolved
        include: {
            reporter: {
                select: { name: true, email: true }
            },
            message: {
                include: {
                    sender: { select: { name: true, email: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export default async function ReportsPage() {
    const reports = await getReports()

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Content Reports</h2>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Reason</TableHead>
                            <TableHead>Reporter</TableHead>
                            <TableHead>Offender</TableHead>
                            <TableHead>Message Content</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No active reports
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">
                                        <Badge variant="destructive">{report.reason}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{report.reporter.name}</div>
                                            <div className="text-xs text-muted-foreground">{report.reporter.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{report.message.sender.name}</div>
                                            <div className="text-xs text-muted-foreground">{report.message.sender.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-md truncate">
                                        &quot;{report.message.content}&quot;
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ReportActions reportId={report.id} />
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
