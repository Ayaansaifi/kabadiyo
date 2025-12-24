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
import { KabadiwalaActions } from "./kabadiwala-actions" // Client component
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

async function getKabadiwalas() {
    return await db.kabadiwalaProfile.findMany({
        include: {
            user: true
        },
        orderBy: {
            isVerified: 'asc' // Show unverified first
        }
    })
}

export default async function KabadiwalasPage() {
    const profiles = await getKabadiwalas()

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Kabadiwala Approvals</h2>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Business Name</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Service Area</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {profiles.map((profile) => (
                            <TableRow key={profile.id}>
                                <TableCell className="font-medium flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={profile.user.image || undefined} />
                                        <AvatarFallback>{profile.businessName[0]}</AvatarFallback>
                                    </Avatar>
                                    {profile.businessName}
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <div>{profile.user.name}</div>
                                        <div className="text-xs text-muted-foreground">{profile.user.phone}</div>
                                    </div>
                                </TableCell>
                                <TableCell>{profile.serviceArea}</TableCell>
                                <TableCell>{profile.totalPickups} pickups</TableCell>
                                <TableCell>
                                    {profile.isVerified ? (
                                        <Badge className="bg-green-600 hover:bg-green-700">Verified</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-yellow-600 bg-yellow-100 hover:bg-yellow-200">Pending</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <KabadiwalaActions profileId={profile.id} isVerified={profile.isVerified} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
