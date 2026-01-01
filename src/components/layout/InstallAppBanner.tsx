"use client"

import { useIsNativePlatform } from "@/hooks/useNativePlatform"
import { Button } from "@/components/ui/button"
import { X, Smartphone, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function InstallAppBanner() {
    const { isNative, isLoading } = useIsNativePlatform()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Show banner after 2 seconds if on mobile web
        if (!isLoading && !isNative) {
            // Check if user dismissed it previously
            const dismissed = localStorage.getItem("install_banner_dismissed")
            if (!dismissed) {
                const timer = setTimeout(() => setIsVisible(true), 2000)
                return () => clearTimeout(timer)
            }
        }
    }, [isLoading, isNative])

    const dismiss = () => {
        setIsVisible(false)
        localStorage.setItem("install_banner_dismissed", "true")
    }

    if (!isVisible) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
            >
                <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                            <span className="font-bold text-xl">K</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Download Kabadiyo App</h4>
                            <p className="text-xs text-slate-400">Best experience & faster pickup</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-xs px-3" onClick={() => window.open("/download", "_blank")}>
                            Get App
                        </Button>
                        <button onClick={dismiss} className="p-1 text-slate-400 hover:text-white">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
