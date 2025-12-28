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

export function PromoCard({ title, subtitle, cta, href, gradient, delay = 0 }: PromoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            viewport={{ once: true }}
            className="w-full mb-6"
        >
            <Link href={href}>
                <div className={`relative h-40 rounded-2xl overflow-hidden shadow-lg ${gradient} group`}>
                    {/* Placeholder for Image - User can replace this div with an <img> tag later */}
                    <div className="absolute inset-0 bg-white/5 opacity-50 group-hover:scale-105 transition-transform duration-500" />

                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />

                    <div className="absolute inset-0 p-6 flex flex-col justify-center">
                        <h3 className="text-white text-2xl font-black mb-1 drop-shadow-md max-w-[70%]">{title}</h3>
                        <p className="text-white/90 text-sm font-medium mb-4 max-w-[70%]">{subtitle}</p>

                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold border border-white/30 self-start group-hover:bg-white/30 transition-all">
                            {cta} <ArrowRight className="h-3 w-3" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
