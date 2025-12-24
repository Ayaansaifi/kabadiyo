"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, MapPin, Package, Plus, Trash2, Calculator, IndianRupee, Clock } from "lucide-react"
import { toast } from "sonner"
import { SCRAP_CATEGORIES } from "@/lib/scrap-categories"

interface Kabadiwala {
    id: string
    name: string
    kabadiwalaProfile?: {
        businessName: string
        rating: number
        serviceArea: string
        rates: string // JSON string
    }
}

interface ScrapItem {
    id: string
    type: string
    weight: number
    rate: number
    amount: number
}

export default function BookPickupPage({ params }: { params: Promise<{ kabadiwalaId: string }> }) {
    const router = useRouter()
    const resolvedParams = use(params)
    const kabadiwalaId = resolvedParams.kabadiwalaId

    const [kabadiwala, setKabadiwala] = useState<Kabadiwala | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [address, setAddress] = useState("")
    const [date, setDate] = useState("")
    const [timeSlot, setTimeSlot] = useState("Morning")

    // Calculator State
    const [scrapItems, setScrapItems] = useState<ScrapItem[]>([])
    const [selectedMaterial, setSelectedMaterial] = useState("")
    const [weight, setWeight] = useState("")
    const [parsedRates, setParsedRates] = useState<Record<string, number>>({})

    useEffect(() => {
        async function fetchKabadiwala() {
            try {
                const res = await fetch(`/api/kabadiwala/${kabadiwalaId}`)
                if (res.ok) {
                    const data = await res.json()
                    setKabadiwala(data)
                    if (data.kabadiwalaProfile?.rates) {
                        try {
                            setParsedRates(JSON.parse(data.kabadiwalaProfile.rates))
                        } catch (e) { }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch kabadiwala")
                toast.error("Could not load Kabadiwala details")
            } finally {
                setLoading(false)
            }
        }
        fetchKabadiwala()
    }, [kabadiwalaId])

    const handleAddItem = () => {
        if (!selectedMaterial || !weight) return

        const weightNum = parseFloat(weight)
        if (isNaN(weightNum) || weightNum <= 0) {
            toast.error("Please enter a valid weight")
            return
        }

        // Check if rate exists in kabadiwala profile, else use default
        const selectedCat = SCRAP_CATEGORIES.find(c => c.id === selectedMaterial)
        const rate = (parsedRates && parsedRates[selectedMaterial])
            ? parsedRates[selectedMaterial]
            : (selectedCat?.defaultRate || 0)

        const amount = rate * weightNum

        const newItem: ScrapItem = {
            id: Date.now().toString(),
            type: selectedCat?.label || selectedMaterial,
            weight: weightNum,
            rate,
            amount
        }

        setScrapItems([...scrapItems, newItem])
        setSelectedMaterial("")
        setWeight("")
    }

    const removeItem = (id: string) => {
        setScrapItems(scrapItems.filter(item => item.id !== id))
    }

    const totalEstimatedValue = scrapItems.reduce((sum, item) => sum + item.amount, 0)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!address || !date) {
            toast.error("Please fill in address and date")
            return
        }

        if (scrapItems.length === 0) {
            if (selectedMaterial && weight) {
                toast.error("Please click 'Add' to include your item first!", {
                    description: "You entered details but didn't add the item to the list."
                })
            } else {
                toast.error("Please add at least one item to pickup")
            }
            return
        }

        setSubmitting(true)
        try {
            // Convert structured items to string for backend compatibility
            // but keeps strict structure for potential future parsing
            const itemsString = JSON.stringify(scrapItems)

            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    kabadiwalaId,
                    address,
                    items: itemsString,
                    pickupDate: date
                }),
                credentials: 'include'
            })

            if (res.ok) {
                toast.success("Pickup booked successfully!")
                router.push("/orders") // Assume /orders exists, if not redirect to dashboard
            } else {
                toast.error("Failed to book pickup")
            }
        } catch (error) {
            toast.error("Network error")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <Card className="border-t-4 border-t-primary shadow-lg">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Package className="h-6 w-6 text-primary" />
                        Book Pickup
                    </CardTitle>
                    <CardDescription className="text-base">
                        Schedule a pickup with <span className="font-semibold text-foreground">{kabadiwala?.kabadiwalaProfile?.businessName || kabadiwala?.name}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. Scrap Calculator Section */}
                        <div className="space-y-4 rounded-lg border p-4 bg-card shadow-sm">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <Calculator className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold">Scrap Calculator</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-5">
                                    <Label>Material Type</Label>
                                    <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Search & Select Item..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {/* Group by Category */}
                                            {Array.from(new Set(SCRAP_CATEGORIES.map(c => c.category))).map(category => (
                                                <div key={category}>
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/30 sticky top-0 z-10">
                                                        {category}
                                                    </div>
                                                    {SCRAP_CATEGORIES.filter(c => c.category === category).map(item => {
                                                        const rate = parsedRates && parsedRates[item.id] ? parsedRates[item.id] : item.defaultRate
                                                        return (
                                                            <SelectItem key={item.id} value={item.id}>
                                                                <span className="font-medium">{item.label}</span>
                                                                <span className="text-muted-foreground ml-2 text-xs">(~₹{rate}/kg)</span>
                                                            </SelectItem>
                                                        )
                                                    })}
                                                </div>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-4">
                                    <Label>Est. Weight (kg)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="h-12"
                                    />
                                </div>
                                <div className="md:col-span-3 flex items-end">
                                    <Button type="button" onClick={handleAddItem} className="w-full h-12" disabled={!selectedMaterial}>
                                        <Plus className="h-4 w-4 mr-1" /> Add
                                    </Button>
                                </div>
                            </div>

                            {/* Item List */}
                            {scrapItems.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {scrapItems.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center bg-muted/50 p-2 rounded-md text-sm">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="capitalize">{item.type}</Badge>
                                                <span className="text-muted-foreground">{item.weight} kg</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium">₹{item.amount.toFixed(0)}</span>
                                                <button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-2 border-t font-bold">
                                        <span>Total Estimated Value:</span>
                                        <span className="text-green-600 text-lg flex items-center">
                                            <IndianRupee className="h-4 w-4" />
                                            {totalEstimatedValue.toFixed(0)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Pickup Details */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <Label htmlFor="date" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Recommended Pickup Date
                                </Label>
                                <Input
                                    type="date"
                                    id="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="cursor-pointer"
                                />

                                <Label className="flex items-center gap-2 pt-2">
                                    <Clock className="h-4 w-4" /> Preferred Time Slot
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Morning', 'Afternoon', 'Evening'].map((slot) => (
                                        <div
                                            key={slot}
                                            onClick={() => setTimeSlot(slot)}
                                            className={`cursor-pointer border rounded-lg p-2 text-center transition-all ${timeSlot === slot
                                                ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/20'
                                                : 'bg-background hover:bg-muted'
                                                }`}
                                        >
                                            <span className="text-sm font-medium">{slot}</span>
                                            <span className="block text-[10px] opacity-80">
                                                {slot === 'Morning' ? '9am - 12pm' : slot === 'Afternoon' ? '12pm - 4pm' : '4pm - 8pm'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Exact Pickup Address
                                </Label>
                                <Textarea
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="House No, Street, Landmark..."
                                    required
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <Button type="submit" className="w-full text-lg h-12" disabled={submitting}>
                            {submitting ? (
                                <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Processing Request...</>
                            ) : (
                                "Confirm Booking Request"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
