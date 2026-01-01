import { db } from "@/lib/db"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserActions } from "./user-actions" // Client component for actions

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'

async function getUsers() {
    return await db.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            kabadiwalaProfile: {
                select: { businessName: true }
            }
        }
    })
}

export default async function UsersPage() {
    const users = await getUsers()

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Phone / Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.image || ""} />
                                        <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{user.name}</div>
                                        {user.kabadiwalaProfile && (
                                            <div className="text-xs text-muted-foreground">
                                                {user.kabadiwalaProfile.businessName}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        user.role === "ADMIN" ? "destructive" :
                                            user.role === "KABADIWALA" ? "default" :
                                                "secondary"
                                    }>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <div>{user.phone}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {user.phoneVerified ? (
                                        <Badge variant="outline" className="text-green-600 border-green-200">Verified</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-yellow-600 border-yellow-200">Pending</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <UserActions user={user} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
