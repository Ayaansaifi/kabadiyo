
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Connecting to DB...")
        const count = await prisma.user.count()
        console.log("User count:", count)
        const featured = await prisma.kabadiwalaProfile.findMany({
            take: 1
        })
        console.log("Featured query success:", featured.length)
    } catch (e) {
        console.error("DB Error:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
