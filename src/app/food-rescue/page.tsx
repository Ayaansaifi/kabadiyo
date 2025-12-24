"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Heart, Utensils, Truck, Phone } from "lucide-react"

export default function FoodRescuePage() {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        toast.success("Thank you! Our team will contact you shortly.")
        setLoading(false)
            ; (e.target as HTMLFormElement).reset()
    }

    return (
        <div className="min-h-screen bg-orange-50 dark:bg-orange-950/20">
            {/* Hero Section */}
            <section className="relative py-20 px-4 text-center overflow-hidden bg-gradient-to-b from-orange-100 to-transparent dark:from-orange-900/30">
                <div className="container mx-auto max-w-4xl relative z-10">
                    <div className="inline-flex items-center gap-2 bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-100 px-4 py-1.5 rounded-full mb-6 font-medium text-sm">
                        <Heart className="h-4 w-4 fill-current" />
                        <span>Annadaan: Share Food, Share Love</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-6 text-orange-900 dark:text-orange-100">
                        Don&apos;t Waste Food,<br />
                        <span className="text-orange-600">Feed the Needy</span>
                    </h1>

                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Leftover food from your wedding, party, or event can save lives.
                        Request a pickup, and we will distribute it to the poor.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 pb-20 max-w-5xl">
                <div className="grid md:grid-cols-2 gap-12 items-start">

                    {/* Request Form */}
                    <Card className="border-orange-200 shadow-xl dark:border-orange-800">
                        <CardHeader>
                            <CardTitle className="text-2xl text-orange-700 dark:text-orange-400">Request Food Pickup</CardTitle>
                            <CardDescription>Fill this form, and we&apos;ll arrange a vehicle.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Your Name / Event Name</Label>
                                    <Input id="name" required placeholder="Ex: Sharma Wedding" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" required type="tel" placeholder="9876543210" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">Quantity (Approx people)</Label>
                                        <Input id="quantity" required placeholder="Ex: For 50 people" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Pickup Address</Label>
                                    <Textarea id="address" required placeholder="Complete address with landmark" />
                                </div>

                                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg h-12" disabled={loading}>
                                    {loading ? "Sending..." : "Request Pickup Now"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Info Section */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">How it Works?</h3>
                            <div className="space-y-6">
                                <Step
                                    icon={<Phone className="h-6 w-6 text-orange-600" />}
                                    title="1. You Request"
                                    desc="Fill the form or call our helpline when you have excess food."
                                />
                                <Step
                                    icon={<div className="h-6 w-6 text-orange-600">🚚</div>}
                                    title="2. We Pickup"
                                    desc="Our volunteers will reach your location with containers."
                                />
                                <Step
                                    icon={<div className="h-6 w-6 text-orange-600">🍲</div>}
                                    title="3. We Distribute"
                                    desc="Food is checked for hygiene and distributed to slums/shelters immediately."
                                />
                            </div>
                        </div>

                        <Card className="bg-orange-600 text-white border-none">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-bold mb-2">Urgent Pickup?</h3>
                                <p className="mb-4 text-orange-100">Call our 24/7 Food Rescue Helpline</p>
                                <a href="tel:9876543210" className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors">
                                    <Phone className="h-5 w-5" />
                                    Call 98765-43210
                                </a>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Step({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex gap-4">
            <div className="h-12 w-12 shrink-0 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                {icon}
            </div>
            <div>
                <h4 className="font-semibold text-lg">{title}</h4>
                <p className="text-muted-foreground">{desc}</p>
            </div>
        </div>
    )
}
