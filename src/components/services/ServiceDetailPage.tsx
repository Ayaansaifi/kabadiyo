"use client"

import { ServiceData } from "@/lib/services-data"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle2, Phone, Mail, MessageCircle, Armchair, Sparkles, HelpingHand, Zap, DoorOpen, Cog, Wrench, Laptop, Factory } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const CONTACT_NUMBER = "8586040076"
const CONTACT_EMAIL = "contact@kabadiyo.com"

const iconMap: any = {
    "Armchair": Armchair,
    "Sparkles": Sparkles,
    "HelpingHand": HelpingHand,
    "Zap": Zap,
    "DoorOpen": DoorOpen,
    "Cog": Cog,
    "Wrench": Wrench,
    "Laptop": Laptop,
    "Factory": Factory
}

export default function ServiceDetailPage({ data }: { data: ServiceData }) {
    const router = useRouter()
    const IconComponent = iconMap[data.iconName] || Sparkles

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Extended Header / Hero */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background z-10" />

                {/* Placeholder Geometric Pattern for Background (since we don't have real images yet) */}
                <div className={`absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background animate-pulse`} />
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 z-20 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>

                <div className="absolute bottom-6 left-6 right-6 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary-foreground text-xs font-bold mb-3">
                            {data.type === 'buyer' ? 'WE BUY' : 'SERVICE'}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                            {data.title}
                        </h1>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-5 -mt-6 relative z-30">
                {/* Main Content Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card border shadow-xl rounded-2xl p-6 mb-6"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Details</h2>
                            <p className="text-sm text-muted-foreground">Expert Solutions</p>
                        </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed mb-6">
                        {data.description}
                    </p>

                    <div className="space-y-3">
                        {data.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                <span className="font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Contact Options */}
                <div className="grid gap-4">
                    <h3 className="font-bold text-lg px-1">Get in Touch</h3>

                    <a href={`tel:${CONTACT_NUMBER}`} className="flex items-center gap-4 p-4 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all active:scale-98">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Phone className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-foreground">Call Helpline</p>
                            <p className="text-xs text-muted-foreground">Available 9 AM - 8 PM</p>
                        </div>
                        <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">Call</div>
                    </a>

                    <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-4 p-4 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all active:scale-98">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-foreground">Email Inquiry</p>
                            <p className="text-xs text-muted-foreground">Get a quote via email</p>
                        </div>
                    </a>
                </div>
            </div>

            {/* Sticky Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t z-40">
                <div className="container mx-auto max-w-md">
                    <Button size="lg" className="w-full text-lg font-bold shadow-lg shadow-primary/20 gap-2" asChild>
                        <a href={`https://wa.me/91${CONTACT_NUMBER}?text=Hi, I am interested in ${data.title}`}>
                            <MessageCircle className="h-5 w-5" />
                            {data.ctaText}
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    )
}
