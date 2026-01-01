"use client"

import { useIsNativePlatform } from "@/hooks/useNativePlatform"
import { Footer } from "./Footer"

export function WebFooter() {
    const { isNative, isLoading } = useIsNativePlatform()

    // Don't show footer on native app to keep it advanced/clean
    if (isNative || isLoading) return null

    return <Footer />
}
