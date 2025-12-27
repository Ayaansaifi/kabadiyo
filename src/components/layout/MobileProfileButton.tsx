"use client"

import Link from "next/link"
import { useIsNativePlatform } from "@/hooks/useNativePlatform"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import { toast } from "sonner"
// Re-aliasing for cleaner usage if needed, or using direct names
const DropdownLabel = DropdownMenuLabel
const DropdownSeparator = DropdownMenuSeparator

interface MobileProfileButtonProps {
    userName: string | null
}

/**
 * Mobile Profile Button - APP ONLY
 * Shows a profile avatar button on the LEFT side of header in app
 * Hidden on website
 */
export function MobileProfileButton({ userName }: MobileProfileButtonProps) {
    const { isNative, isLoading } = useIsNativePlatform()

    // Only show in app, hidden on website
    if (isLoading || !isNative) {
        return null
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 ring-2 ring-primary/30 active:scale-95 transition-transform cursor-pointer md:hidden">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-green-600/20 text-primary font-bold">
                        {userName?.[0] || 'U'}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 mt-2 ml-2">
                <DropdownLabel>My Account</DropdownLabel>
                <DropdownSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer space-x-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownSeparator />
                <DropdownMenuItem
                    className="text-red-500 hover:text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer space-x-2"
                    onClick={async () => {
                        try {
                            await fetch("/api/auth/logout", { method: "POST" })
                            window.location.href = "/"
                        } catch (e) {
                            toast.error("Logout failed")
                        }
                    }}
                >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
