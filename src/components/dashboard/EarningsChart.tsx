"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Leaf } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const CHART_DATA = [
    { name: "Mon", earnings: 420 },
    { name: "Tue", earnings: 650 },
    { name: "Wed", earnings: 230 },
    { name: "Thu", earnings: 890 },
    { name: "Fri", earnings: 560 },
    { name: "Sat", earnings: 1200 },
    { name: "Sun", earnings: 950 },
]

export function EarningsChart() {
    return (
        <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl">Spending & Earnings</CardTitle>
                        <CardDescription className="text-green-100">Your recycling activity over the last 7 days</CardDescription>
                    </div>
                    <Leaf className="h-8 w-8 text-green-200 opacity-50" />
                </div>
            </CardHeader>
            <CardContent className="p-6 bg-white dark:bg-card">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={CHART_DATA}>
                            <defs>
                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'gray', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'gray', fontSize: 12 }}
                                tickFormatter={(value) => `₹${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="earnings"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorEarnings)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
