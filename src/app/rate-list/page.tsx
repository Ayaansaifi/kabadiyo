import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Mock Data (In real app, fetch from DB)
const RATES = {
    paper: [
        { name: "Newspaper", price: 15, unit: "kg" },
        { name: "Books", price: 12, unit: "kg" },
        { name: "Carton", price: 8, unit: "kg" },
        { name: "Magazine", price: 15, unit: "kg" },
    ],
    plastic: [
        { name: "Soft Plastic", price: 10, unit: "kg" },
        { name: "Hard Plastic", price: 5, unit: "kg" },
        { name: "Mixed Plastic", price: 6, unit: "kg" },
        { name: "Polythene", price: 2, unit: "kg" },
    ],
    metal: [
        { name: "Iron", price: 28, unit: "kg" },
        { name: "Steel", price: 35, unit: "kg" },
        { name: "Aluminium", price: 105, unit: "kg" },
        { name: "Copper", price: 420, unit: "kg" },
        { name: "Brass", price: 305, unit: "kg" },
    ],
    ewaste: [
        { name: "E-waste", price: 15, unit: "kg" },
        { name: "Laptop", price: 300, unit: "pcs" },
        { name: "CPU", price: 200, unit: "pcs" },
        { name: "Battery", price: 45, unit: "kg" },
    ]
}

export default function RateListPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Current Scrap Rates
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Check the latest market prices for your scrap. Prices may vary slightly based on location and quantity.
                </p>
            </div>

            <Card className="max-w-4xl mx-auto border-none shadow-2xl">
                <CardHeader className="bg-muted/50 border-b">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                            <CardTitle>Daily Price List</CardTitle>
                            <CardDescription>Updated today</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search item..."
                                    className="pl-8 w-[200px] bg-background"
                                />
                            </div>
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <Tabs defaultValue="paper" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-8">
                            <TabsTrigger value="paper">Paper</TabsTrigger>
                            <TabsTrigger value="plastic">Plastic</TabsTrigger>
                            <TabsTrigger value="metal">Metal</TabsTrigger>
                            <TabsTrigger value="ewaste">E-Waste</TabsTrigger>
                        </TabsList>

                        {Object.entries(RATES).map(([category, items]) => (
                            <TabsContent key={category} value={category} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {items.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                                                    {item.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">{category}</p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="text-lg px-3 py-1">
                                                ₹{item.price} <span className="text-xs text-muted-foreground ml-1">/{item.unit}</span>
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>

                    <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                            <span className="text-lg">💡</span>
                            <strong>Note:</strong> Prices are indicative and meant for reference. Final price will be decided by the Kabadiwala upon inspection.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
