"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Recycle, Truck, Banknote, Leaf } from "lucide-react"
import { useIsNativePlatform } from "@/hooks/useNativePlatform"

interface SlideItem {
    id: number
    title: string
    subtitle: string
    icon: React.ReactNode
    gradient: string
    image?: string
}

const slides: SlideItem[] = [
    {
        id: 1,
        title: "Sell Your Scrap",
        subtitle: "Get the best prices for your recyclables",
        icon: <Recycle className="h-16 w-16 text-white" />,
        gradient: "from-green-500 to-emerald-600"
    },
    {
        id: 2,
        title: "Free Doorstep Pickup",
        subtitle: "Our team comes to your home",
        icon: <Truck className="h-16 w-16 text-white" />,
        gradient: "from-blue-500 to-cyan-600"
    },
    {
        id: 3,
        title: "Instant Cash Payment",
        subtitle: "Direct cash handover at pickup",
        icon: <Banknote className="h-16 w-16 text-white" />,
        gradient: "from-purple-500 to-pink-600",
        image: "/images/slider/payment.png"
    },
    {
        id: 4,
        title: "Save The Planet",
        subtitle: "Every kg recycled makes a difference",
        icon: <Leaf className="h-16 w-16 text-white" />,
        gradient: "from-teal-500 to-green-600"
    }
]

/**
 * AppSlider - APP ONLY
 * Animated slider showing scrap collection benefits
 * Only visible in Capacitor app, hidden on website
 */
export function AppSlider() {
    const { isNative, isLoading } = useIsNativePlatform()
    const [currentSlide, setCurrentSlide] = useState(0)
    const [direction, setDirection] = useState(1)

    // Auto-advance slides every 4 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1)
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [])

    // Don't render on website or during loading
    if (isLoading || !isNative) {
        return null
    }

    const goToSlide = (index: number) => {
        setDirection(index > currentSlide ? 1 : -1)
        setCurrentSlide(index)
    }

    const nextSlide = () => {
        setDirection(1)
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setDirection(-1)
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    const slide = slides[currentSlide]

    return (
        <div className="relative w-full overflow-hidden rounded-2xl mb-6 shadow-xl">
            {/* Slider Container */}
            <div className={`relative h-48 bg-gradient-to-r ${slide.gradient} transition-all duration-500`}>

                {/* Background Image if available */}
                <AnimatePresence mode="wait">
                    {slide.image && (
                        <motion.div
                            key={`bg-${slide.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-0"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={slide.image} alt="Slide Background" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={slide.id}
                        initial={{ opacity: 0, x: direction * 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -direction * 30 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex items-center justify-between px-6 z-10"
                    >
                        {/* Content */}
                        <div className="flex-1 max-w-[65%]">
                            <h3 className="text-white text-2xl font-bold mb-1 leading-tight drop-shadow-md">{slide.title}</h3>
                            <p className="text-white/90 text-sm font-medium drop-shadow-sm">{slide.subtitle}</p>
                        </div>

                        {/* Icon (Only show if no image, or make small if image is there?) 
                            User wanted "Show Men", so Image is main. I'll keep Icon as subtle or hide it if image exists 
                        */}
                        {!slide.image && (
                            <div className="opacity-90">
                                {slide.icon}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? "bg-white w-4" : "bg-white/50"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
