"use client"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Clock, Mail, Phone, ExternalLink } from "lucide-react"

interface UserDetailSheetProps {
    user: any // Ideally typed with your User type
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UserDetailSheet({ user, open, onOpenChange }: UserDetailSheetProps) {
    if (!user) return null

    const googleMapsUrl = user.latitude && user.longitude
        ? `https://www.google.com/maps?q=${user.latitude},${user.longitude}`
        : null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>User Details</SheetTitle>
                    <SheetDescription>
                        Complete profile information and location.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Header Profile */}
                    <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback className="text-2xl">{user.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-xl font-bold">{user.name || "Unknown User"}</h3>
                            <p className="text-muted-foreground">{user.role}</p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant={user.phoneVerified ? "default" : "secondary"}>
                                {user.phoneVerified ? "Verified" : "Unverified"}
                            </Badge>
                            <Badge variant={user.email ? "outline" : "secondary"}>
                                {user.email ? "Email Added" : "No Email"}
                            </Badge>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Contact Info</h4>
                        <div className="grid gap-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Phone</p>
                                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">{user.email || "Not provided"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Info */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Location & Address</h4>
                        <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-primary mt-1" />
                                <div>
                                    <p className="text-sm font-medium">Recorded Address</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {user.address || "No address provided"}
                                    </p>
                                </div>
                            </div>

                            {/* Lat/Long Map Link */}
                            {(user.latitude || user.longitude) && (
                                <div className="pt-3 border-t border-border/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs font-medium text-muted-foreground">GPS Coordinates</p>
                                        <span className="text-xs font-mono bg-background px-2 py-1 rounded border">
                                            {user.latitude?.toFixed(6)}, {user.longitude?.toFixed(6)}
                                        </span>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                                        <a href={googleMapsUrl!} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-3 w-3" />
                                            View on Google Maps
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Metadata</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Joined</p>
                                    <p className="text-sm font-medium">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Last Active</p>
                                    <p className="text-sm font-medium">
                                        {new Date(user.lastActive).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
