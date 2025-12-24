"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Leaf, Wind, Zap, Droplets, TreePine } from "lucide-react"

interface EcoImpactProps {
    totalWeight: number // in kg
}

export function EcoImpactVisualizer({ totalWeight }: EcoImpactProps) {
    // Impact multipliers (approximate values)
    // 1kg mixed scrap savings:
    const CO2_SAVED = 1.5 // kg of CO2
    const ENERGY_SAVED = 4 // kWh
    const WATER_SAVED = 20 // Liters
    const TREES_SAVED = 0.02 // Trees per kg (50kg = 1 tree)

    const co2 = (totalWeight * CO2_SAVED).toFixed(1)
    const energy = (totalWeight * ENERGY_SAVED).toFixed(0)
    const water = (totalWeight * WATER_SAVED).toFixed(0)
    const trees = (totalWeight * TREES_SAVED).toFixed(1)

    return (
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-card overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-green-600" />
                    Your Eco Impact
                </CardTitle>
                <CardDescription>
                    See the difference you&apos;ve made by recycling {totalWeight}kg of waste!
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/60 dark:bg-card/50 p-4 rounded-xl flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600">
                        <Wind className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{co2} kg</p>
                        <p className="text-sm text-muted-foreground">CO2 Avoided</p>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-card/50 p-4 rounded-xl flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600">
                        <Zap className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{energy} kWh</p>
                        <p className="text-sm text-muted-foreground">Energy Saved</p>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-card/50 p-4 rounded-xl flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-full text-cyan-600">
                        <Droplets className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{water} L</p>
                        <p className="text-sm text-muted-foreground">Water Saved</p>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-card/50 p-4 rounded-xl flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600">
                        <TreePine className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{trees}</p>
                        <p className="text-sm text-muted-foreground">Trees Planted</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
