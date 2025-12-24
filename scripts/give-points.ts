import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst()
    if (!user) {
        console.log("No user found")
        return
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { points: 25000 } // Enough to unlock the 20k reward
    })

    console.log(`Updated user ${user.name} with 25,000 points for testing!`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })

export { }
