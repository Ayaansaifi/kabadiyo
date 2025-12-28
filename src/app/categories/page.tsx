"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, ChevronLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const categories = [
    // Paper
    { id: "p1", name: "Newspaper", category: "Paper", rate: "₹14/kg" },
    { id: "p2", name: "Books", category: "Paper", rate: "₹12/kg" },
    { id: "p3", name: "Carton", category: "Paper", rate: "₹15/kg" },
    { id: "p4", name: "Magazines", category: "Paper", rate: "₹15/kg" },
    { id: "p5", name: "White Paper", category: "Paper", rate: "₹18/kg" },

    // Plastic
    { id: "pl1", name: "Plastic Bottles", category: "Plastic", rate: "₹10/kg" },
    { id: "pl2", name: "Hard Plastic", category: "Plastic", rate: "₹5/kg" },
    { id: "pl3", name: "Soft Plastic", category: "Plastic", rate: "₹8/kg" },
    { id: "pl4", name: "Polythene", category: "Plastic", rate: "₹12/kg" },
    { id: "pl5", name: "Oil/Water Drums", category: "Plastic", rate: "₹25/kg" },

    // Metals - Iron
    { id: "m1", name: "Iron Scrap", category: "Metal", rate: "₹28/kg" },
    { id: "m2", name: "Tin Shade", category: "Metal", rate: "₹22/kg" },
    { id: "m3", name: "Heavy Iron", category: "Metal", rate: "₹30/kg" },

    // Metals - Non-ferrous
    { id: "nf1", name: "Copper", category: "Metal", rate: "₹650/kg" },
    { id: "nf2", name: "Brass", category: "Metal", rate: "₹450/kg" },
    { id: "nf3", name: "Aluminium", category: "Metal", rate: "₹130/kg" },
    { id: "nf4", name: "Steel Utensils", category: "Metal", rate: "₹45/kg" },
    { id: "nf5", name: "Lead", category: "Metal", rate: "₹140/kg" },

    // E-Waste
    { id: "e1", name: "Laptop", category: "E-Waste", rate: "₹300/pc" },
    { id: "e2", name: "CPU", category: "E-Waste", rate: "₹400/pc" },
    { id: "e3", name: "Monitor", category: "E-Waste", rate: "₹150/pc" },
    { id: "e4", name: "Battery", category: "E-Waste", rate: "₹80/kg" },
    { id: "e5", name: "Fridge", category: "E-Waste", rate: "₹800/pc" },
    { id: "e6", name: "AC Window", category: "E-Waste", rate: "2500/pc" },
    { id: "e7", name: "AC Split", category: "E-Waste", rate: "₹3500/pc" },
    { id: "e8", name: "Washing Machine", category: "E-Waste", rate: "₹600/pc" },
    { id: "e9", name: "Microwave", category: "E-Waste", rate: "₹300/pc" },
    { id: "e10", name: "Inverter", category: "E-Waste", rate: "₹1500/pc" },

    // Vehicles
    { id: "v1", name: "Cycle", category: "Vehicle", rate: "₹200/pc" },
    { id: "v2", name: "Bike", category: "Vehicle", rate: "₹2500/pc" },
    { id: "v3", name: "Scooty", category: "Vehicle", rate: "₹2000/pc" },
    { id: "v4", name: "Car Engine", category: "Vehicle", rate: "₹15000/pc" },
    { id: "v5", name: "Car Body", category: "Vehicle", rate: "₹22000/pc" },

    // Others
    { id: "o1", name: "Old Tyres", category: "Others", rate: "₹5/kg" },
    { id: "o2", name: "Glass Bottles", category: "Others", rate: "₹2/pc" },
    { id: "o3", name: "Beer Bottles", category: "Others", rate: "₹3/pc" },
    { id: "o4", name: "Cable Wire", category: "Others", rate: "₹50/kg" },
    { id: "o5", name: "Mattress", category: "Others", rate: "₹100/pc" },
    { id: "o6", name: "Sofa Set", category: "Others", rate: "₹500/set" },
    { id: "o7", name: "Wooden Furniture", category: "Others", rate: "₹5/kg" },
    { id: "o8", name: "Mixer Grinder", category: "Others", rate: "₹100/pc" },
    { id: "o9", name: "Ceiling Fan", category: "Others", rate: "₹150/pc" },
    { id: "o10", name: "Exhaust Fan", category: "Others", rate: "₹100/pc" },
    { id: "o11", name: "Cooler (Plastic)", category: "Others", rate: "₹200/pc" },
    { id: "o12", name: "Cooler (Iron)", category: "Others", rate: "₹600/pc" },
    { id: "o13", name: "UPS", category: "Others", rate: "₹200/pc" },
    { id: "o14", name: "Printer", category: "Others", rate: "₹150/pc" },
    { id: "o15", name: "Stabilizer", category: "Others", rate: "₹400/pc" }
]

export default function CategoriesPage() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")

    const filteredCategories = categories.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Group items by category
    const groupedItems = filteredCategories.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)
        return acc
    }, {} as Record<string, typeof categories>)

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 mb-4">
                        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <h1 className="text-xl font-bold">Sell Anything</h1>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search for items to sell..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="container mx-auto px-4 py-6 space-y-8">
                {Object.entries(groupedItems).map(([category, items], groupIndex) => (
                    <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIndex * 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h2 className="text-lg font-bold text-foreground">{category}</h2>
                            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                {items.length} items
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-card rounded-xl p-4 border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-2 opacity-50 text-muted-foreground">
                                        <ArrowRight className="h-4 w-4 -rotate-45 group-hover:rotate-0 transition-transform" />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                                        <p className="text-sm font-bold text-green-600">{item.rate}</p>
                                    </div>

                                    <div className="mt-3 pt-3 border-t flex justify-end">
                                        <a
                                            href={`https://wa.me/918586040076?text=Hi, I want to sell ${encodeURIComponent(item.name)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-semibold text-primary hover:underline"
                                        >
                                            Sell Now
                                        </a>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>No items found for "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
    )
}
