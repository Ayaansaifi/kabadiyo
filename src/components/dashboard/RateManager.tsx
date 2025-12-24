"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, IndianRupee, Edit2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface RateManagerProps {
    initialRates?: Record<string, number>
    kabadiwalaId: string
}

// Real-time market rates - Delhi, December 2025
const DEFAULT_RATES = {
    "Iron": 31,
    "Copper": 580,
    "Brass": 350,
    "Aluminium": 105,
    "Newspaper": 14,
    "Plastic": 12,
    "Cardboard": 9,
    "E-Waste": 45,
    "Steel": 28,
    "Books": 12,
    "Glass Bottles": 2,
    "PET Bottles": 8
}

export function RateManager({ initialRates, kabadiwalaId }: RateManagerProps) {
    const [rates, setRates] = useState<Record<string, number>>(
        initialRates && Object.keys(initialRates).length > 0 ? initialRates : DEFAULT_RATES
    )
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [newItemName, setNewItemName] = useState("")
    const [newItemPrice, setNewItemPrice] = useState("")

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/kabadiwala/rates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rates })
            })

            if (res.ok) {
                toast.success("Rates updated successfully!")
                setIsEditing(false)
            } else {
                toast.error("Failed to update rates")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setSaving(false)
        }
    }

    const updateRate = (item: string, price: number) => {
        setRates(prev => ({ ...prev, [item]: price }))
    }

    const removeRate = (item: string) => {
        const newRates = { ...rates }
        delete newRates[item]
        setRates(newRates)
    }

    const addNewItem = () => {
        if (!newItemName || !newItemPrice) return
        setRates(prev => ({ ...prev, [newItemName]: parseFloat(newItemPrice) }))
        setNewItemName("")
        setNewItemPrice("")
    }

    return (
        <Card className="h-full border-blue-100 dark:border-blue-900 shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <IndianRupee className="h-5 w-5 text-blue-600" />
                            Rate Card
                        </CardTitle>
                        <CardDescription>Manage your buying prices</CardDescription>
                    </div>
                    {!isEditing ? (
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit Rates
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleSave} disabled={saving}>
                                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Save
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y max-h-[400px] overflow-y-auto">
                    {Object.entries(rates).map(([item, price]) => (
                        <div key={item} className="flex justify-between items-center p-4 hover:bg-muted/50 transition-colors">
                            <span className="font-medium text-sm">{item}</span>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <div className="relative w-24">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                                        <Input
                                            type="number"
                                            value={price}
                                            onChange={(e) => updateRate(item, parseFloat(e.target.value))}
                                            className="h-8 pl-6 text-right"
                                        />
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-red-50" onClick={() => removeRate(item)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <Badge variant="secondary" className="font-mono text-base bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                    ₹{price}<span className="text-[10px] text-muted-foreground ml-1">/kg</span>
                                </Badge>
                            )}
                        </div>
                    ))}

                    {/* Add New Item Row */}
                    {isEditing && (
                        <div className="p-4 bg-muted/30">
                            <Label className="text-xs text-muted-foreground mb-2 block">Add New Item</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Item name"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    className="h-8 text-sm"
                                />
                                <div className="relative w-24">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={newItemPrice}
                                        onChange={(e) => setNewItemPrice(e.target.value)}
                                        className="h-8 pl-6 text-right"
                                    />
                                </div>
                                <Button size="icon" className="h-8 w-8 shrink-0" onClick={addNewItem} disabled={!newItemName || !newItemPrice}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            {!isEditing && (
                <CardFooter className="bg-muted/10 p-3 text-xs text-muted-foreground justify-center border-t">
                    Last updated: Just now
                </CardFooter>
            )}
        </Card>
    )
}
