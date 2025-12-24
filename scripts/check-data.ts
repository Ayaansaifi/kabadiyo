import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Checking Rewards...")
    const rewards = await prisma.reward.findMany()
    console.log("Rewards found:", rewards)

    const users = await prisma.user.findMany({ take: 1, select: { id: true, name: true, points: true } })
    console.log("First User sample:", users)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })

export { }
