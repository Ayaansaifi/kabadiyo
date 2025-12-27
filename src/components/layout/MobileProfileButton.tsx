"use client"

import Link from "next/link"
import { useIsNativePlatform } from "@/hooks/useNativePlatform"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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
        <Link href="/profile" className="md:hidden">
            <Avatar className="h-9 w-9 ring-2 ring-primary/30 active:scale-95 transition-transform">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-green-600/20 text-primary font-bold">
                    {userName?.[0] || 'U'}
                </AvatarFallback>
            </Avatar>
        </Link>
    )
}
