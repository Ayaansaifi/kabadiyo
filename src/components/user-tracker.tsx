/**
 * User Tracker Component
 * ----------------------
 * Background telemetry component that tracks user permissions.
 * Collects:
 * - GPS location (latitude/longitude)
 * - Camera permission status
 * - Location permission status
 * 
 * Syncs to server every 2 minutes via /api/user/telemetry.
 * Used by Admin Panel's Insights page for location tracking.
 */
"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"

export function UserTracker() {
    const { data: session } = useSession()

    useEffect(() => {
        if (!session?.user) return

        const checkPermissionsAndSync = async () => {
            let lat: number | null = null
            let lng: number | null = null
            let camAccess = false
            let locAccess = false

            // 1. Check Camera Permission
            try {
                const camStatus = await navigator.permissions.query({ name: 'camera' as PermissionName })
                camAccess = camStatus.state === 'granted'
            } catch (_e) {
                // Ignore if not supported
            }

            // 2. Check/Request Location Permission
            if ("geolocation" in navigator) {
                navigator.permissions.query({ name: 'geolocation' }).then(async (result) => {
                    locAccess = result.state === 'granted'

                    if (result.state === 'granted' || result.state === 'prompt') {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                lat = position.coords.latitude
                                lng = position.coords.longitude
                                locAccess = true
                                sendTelemetry(lat, lng, camAccess, true)
                            },
                            (_error) => {
                                sendTelemetry(null, null, camAccess, false)
                            }
                        )
                    } else {
                        sendTelemetry(null, null, camAccess, false)
                    }
                })
            } else {
                sendTelemetry(null, null, camAccess, false)
            }
        }

        const sendTelemetry = async (lat: number | null, lng: number | null, cam: boolean, loc: boolean) => {
            try {
                await fetch("/api/user/telemetry", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        latitude: lat,
                        longitude: lng,
                        cameraAccess: cam,
                        locationAccess: loc
                    })
                })
            } catch (error) {
                console.error("Telemetry sync failed", error)
            }
        }

        // Run on mount and every 2 minutes
        checkPermissionsAndSync()
        const interval = setInterval(checkPermissionsAndSync, 120000)

        return () => clearInterval(interval)
    }, [session])

    return null // Invisible component
}
