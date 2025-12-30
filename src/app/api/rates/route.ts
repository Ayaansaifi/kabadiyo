import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// Cache for rates (in-memory, refreshes every hour)
let cachedRates: any[] | null = null
let cacheTime: number = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

// GET: Get all active scrap rates
export async function GET() {
    try {
        const now = Date.now()

        // Return cached if valid
        if (cachedRates && (now - cacheTime) < CACHE_DURATION) {
            return NextResponse.json({
                rates: cachedRates,
                cached: true,
                lastUpdated: new Date(cacheTime).toISOString()
            })
        }

        // Fetch fresh rates from database
        const rates = await db.scrapRate.findMany({
            where: { isActive: true },
            orderBy: [{ category: "asc" }, { name: "asc" }]
        })

        // Update cache
        cachedRates = rates
        cacheTime = now

        return NextResponse.json({
            rates,
            cached: false,
            lastUpdated: new Date().toISOString()
        })
    } catch (error) {
        console.error("Get rates error:", error)

        // Fallback to hardcoded rates if DB fails
        const fallbackRates = [
            { name: "Newspaper", category: "Paper", rate: 14, unit: "kg", trend: "stable" },
            { name: "Carton", category: "Paper", rate: 15, unit: "kg", trend: "up" },
            { name: "Iron", category: "Metal", rate: 28, unit: "kg", trend: "stable" },
            { name: "Copper", category: "Metal", rate: 650, unit: "kg", trend: "up" },
            { name: "Aluminium", category: "Metal", rate: 130, unit: "kg", trend: "down" },
            { name: "Plastic Bottles", category: "Plastic", rate: 10, unit: "kg", trend: "stable" },
            { name: "Laptop", category: "E-Waste", rate: 300, unit: "piece", trend: "stable" },
        ]

        return NextResponse.json({
            rates: fallbackRates,
            cached: false,
            fallback: true,
            lastUpdated: new Date().toISOString()
        })
    }
}
