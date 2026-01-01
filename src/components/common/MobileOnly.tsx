"use client"

import { useIsNativePlatform } from "@/hooks/useNativePlatform"
import { useEffect, useState } from "react"

interface MobileOnlyProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function MobileOnly({ children, fallback = null }: MobileOnlyProps) {
    const { isNative, isLoading } = useIsNativePlatform()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || isLoading) {
        return null
    }

    if (!isNative) {
        return <>{fallback}</>
    }

    return <>{children}</>
}
