"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Minus, Warehouse, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface InventoryManagerProps {
    initialInventory?: Record<string, number>
    kabadiwalaId: string
}

const MATERIALS = ["Iron", "Plastic", "Paper", "Cardboard", "Copper", "Brass", "Aluminium", "E-Waste"]

export function InventoryManager({ initialInventory, kabadiwalaId }: InventoryManagerProps) {
    const [inventory, setInventory] = useState<Record<string, number>>(initialInventory || {})
    const [loading, setLoading] = useState(false)

    const updateStock = (item: string, delta: number) => {
        setInventory(prev => {
            const current = prev[item] || 0
            const newAmount = Math.max(0, current + delta)
            return { ...prev, [item]: newAmount }
        })
    }

    const saveInventory = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/kabadiwala/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inventory })
            })

            if (res.ok) {
                toast.success("Inventory updated")
            } else {
                toast.error("Failed to update")
            }
        } catch {
            toast.error("Error saving inventory")
        } finally {
            setLoading(false)
        }
    }

    const totalWeight = Object.values(inventory).reduce((a, b) => a + b, 0)

    return (
        <Card className="h-full border-orange-100 dark:border-orange-900 shadow-sm">
            <CardHeader className="pb-3 border-b bg-orange-50/50 dark:bg-orange-950/20">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Warehouse className="h-5 w-5 text-orange-600" />
                            Inventory
                        </CardTitle>
                        <CardDescription>Track collected scrap</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200">
                        {totalWeight} kg Total
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-[300px] overflow-y-auto p-4 space-y-4">
                    {MATERIALS.map(item => (
                        <div key={item} className="flex items-center justify-between">
                            <span className="font-medium text-sm">{item}</span>
                            <div className="flex items-center gap-3">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={() => updateStock(item, -10)}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <div className="w-16 text-center font-mono text-sm">
                                    {inventory[item] || 0} <span className="text-xs text-muted-foreground">kg</span>
                                </div>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={() => updateStock(item, 10)}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t bg-muted/10">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={saveInventory} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Update Stock
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
