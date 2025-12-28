"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface PromoCardProps {
    title: string
    subtitle: string
    cta: string
    href: string
    gradient: string
    delay?: number
}

import { useIsNativePlatform } from "@/hooks/useNativePlatform"

export function PromoCard({ title, subtitle, cta, href, gradient, image, delay = 0 }: {
    title: string
    subtitle: string
    cta: string
    href: string
    gradient: string
    image: string
    delay?: number
}) {
    const { isNative, isLoading } = useIsNativePlatform()

    if (isLoading || !isNative) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            viewport={{ once: true }}
            className="w-full mb-6"
        >
            <Link href={href}>
                <div className={`relative h-48 rounded-2xl overflow-hidden shadow-lg group`}>
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-80 group-hover:opacity-70 transition-opacity duration-300`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>

                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />

                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <h3 className="text-white text-2xl font-black mb-1 drop-shadow-md leading-tight">{title}</h3>
                        <p className="text-white/90 text-sm font-medium mb-3 line-clamp-2">{subtitle}</p>

                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold border border-white/30 self-start group-hover:bg-white/30 transition-all">
                            {cta} <ArrowRight className="h-3 w-3" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
