"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Gift, Zap, Users } from "lucide-react"
import { useIsNativePlatform } from "@/hooks/useNativePlatform"

const salesSlides = [
    {
        id: 1,
        title: "Refer & Earn",
        subtitle: "Get ₹50 for every friend",
        icon: <Users className="h-12 w-12 text-white" />,
        gradient: "from-indigo-500 to-purple-600",
        image: null
    },
    {
        id: 2,
        title: "Bulk Pickup Deal",
        subtitle: "Extra 5% cash for >50kg",
        icon: <Zap className="h-12 w-12 text-white" />,
        gradient: "from-orange-500 to-red-600",
        image: null
    },
    {
        id: 3,
        title: "Special Rewards",
        subtitle: "Unlock Gold Tier benefits",
        icon: <Gift className="h-12 w-12 text-white" />,
        gradient: "from-yellow-500 to-amber-600",
        image: null
    }
]

export function PromoSlider() {
    const { isNative, isLoading } = useIsNativePlatform()
    const [currentSlide, setCurrentSlide] = useState(0)
    const [direction, setDirection] = useState(1)

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1)
            setCurrentSlide((prev) => (prev + 1) % salesSlides.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    if (isLoading) return <div className="h-40 w-full animate-pulse bg-muted rounded-2xl mb-8" />

    const nextSlide = () => {
        setDirection(1)
        setCurrentSlide((prev) => (prev + 1) % salesSlides.length)
    }

    const prevSlide = () => {
        setDirection(-1)
        setCurrentSlide((prev) => (prev - 1 + salesSlides.length) % salesSlides.length)
    }

    const slide = salesSlides[currentSlide]

    return (
        <div className="relative w-full overflow-hidden rounded-2xl mb-8 shadow-lg">
            <div className={`relative h-40 bg-gradient-to-r ${slide.gradient} transition-all duration-500`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slide.id}
                        initial={{ opacity: 0, x: direction * 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -direction * 50 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 flex items-center justify-between px-6"
                    >
                        <div className="text-white">
                            <h3 className="text-xl font-bold mb-1">{slide.title}</h3>
                            <p className="text-sm opacity-90 font-medium">{slide.subtitle}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                            {slide.icon}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {salesSlides.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
