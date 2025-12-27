"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

interface AppShellProps {
    children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
    const router = useRouter()
    const pathname = usePathname()
    const lastBackPress = useRef(0)

    useEffect(() => {
        // Only run on mobile/Capacitor environment
        const setupBackHandler = async () => {
            try {
                const { App } = await import("@capacitor/app")

                // Listen for hardware back button
                App.addListener("backButton", ({ canGoBack }) => {
                    // If on home page, show exit confirmation
                    if (pathname === "/" || pathname === "/dashboard") {
                        const now = Date.now()
                        if (now - lastBackPress.current < 2000) {
                            // Double tap within 2 seconds - exit app
                            App.exitApp()
                        } else {
                            lastBackPress.current = now
                            toast.info("Press back again to exit", {
                                duration: 2000,
                                position: "bottom-center"
                            })
                        }
                    } else if (canGoBack) {
                        // Navigate to previous page
                        router.back()
                    } else {
                        // Go to home
                        router.push("/")
                    }
                })
            } catch {
                // Not running in Capacitor environment, ignore
                console.log("Back button handler: Not in Capacitor environment")
            }
        }

        setupBackHandler()

        return () => {
            // Cleanup listener on unmount
            import("@capacitor/app").then(({ App }) => {
                App.removeAllListeners()
            }).catch(() => { })
        }
    }, [pathname, router])

    return <>{children}</>
}
