import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function seed() {
    const reward = await prisma.reward.create({
        data: {
            title: "₹5,000 Home Service",
            description: "Get ₹5,000 worth of free home services including Cleaning, Repairs, or Painting.",
            cost: 20000,
            isActive: true
        }
    })
    console.log("Created reward:", reward)
}

seed()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })

export { }
