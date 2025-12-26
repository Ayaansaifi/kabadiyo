import { PrismaClient } from "@prisma/client"
import path from "path"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Helper to ensure valid DATABASE_URL for SQLite
const getDatabaseUrl = () => {
    const url = process.env.DATABASE_URL

    // If explicitly set and valid protocol, use it
    if (url && url.startsWith("file:")) {
        return url
    }

    // If url exists but missing protocol, fix it
    if (url && url.endsWith(".db")) {
        return `file:${url}`
    }

    // CRITICAL FIX FOR VERCEL:
    // Vercel serverless functions need absolute path to find the bundled file
    if (process.env.NODE_ENV === "production") {
        const dbPath = path.join(process.cwd(), "prisma", "dev.db")
        return `file:${dbPath}`
    }

    // Local development fallback
    return "file:./dev.db"
}

export const db = globalForPrisma.prisma || new PrismaClient({
    datasources: {
        db: {
            url: getDatabaseUrl(),
        },
    },
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
