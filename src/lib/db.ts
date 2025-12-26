import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Helper to ensure valid DATABASE_URL for SQLite
const getDatabaseUrl = () => {
    const url = process.env.DATABASE_URL
    // If url exists and looks valid (starts with file:), use it
    if (url && url.startsWith("file:")) {
        return url
    }

    // If url exists but missing protocol (common user error), add it
    if (url && url.endsWith(".db")) {
        return `file:${url}`
    }

    // Fallback default for development/vercel if variable is missing
    // This assumes the db file is in the prisma folder relative to execution
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
