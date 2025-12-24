"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, IndianRupee } from "lucide-react"

const DATA = [
    { name: "Mon", income: 1200 },
    { name: "Tue", income: 2100 },
    { name: "Wed", income: 800 },
    { name: "Thu", income: 1600 },
    { name: "Fri", income: 2400 },
    { name: "Sat", income: 3200 },
    { name: "Sun", income: 2800 },
]

export function DealerEarningsChart() {
    return (
        <Card className="h-full border-none shadow-sm bg-white dark:bg-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            Weekly Income
                        </CardTitle>
                        <CardDescription>Your collection revenue</CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold flex items-center justify-end text-green-600">
                            <IndianRupee className="h-5 w-5" /> 14,100
                        </p>
                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                            +12.5% vs last week
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pl-0">
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={DATA}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#888' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#888' }}
                                tickFormatter={(val) => `₹${val}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                cursor={{ stroke: '#16a34a', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                stroke="#16a34a"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorIncome)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

function Badge({ children, variant, className }: any) {
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${className}`}>{children}</span>
}
