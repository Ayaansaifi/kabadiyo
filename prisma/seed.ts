/**
 * Seed Script for Rewards and Sample Data
 * ----------------------------------------
 * Run with: npx ts-node prisma/seed.ts
 * Or: npx prisma db seed (after configuring package.json)
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const rewards = [

    {
        title: "Free Pickup Priority",
        description: "Get priority pickup within 2 hours for your next order",
        cost: 150,
        isActive: true,
    },

    {
        title: "Plant a Tree",
        description: "We'll plant a tree in your name and send you the certificate",
        cost: 200,
        isActive: true,
    },
    {
        title: "Premium T-Shirt",
        description: "Get a limited edition Kabadiwala eco-warrior T-shirt",
        cost: 500,
        isActive: true,
    },

]

async function main() {
    console.log('🌱 Seeding database...')

    // Clear existing rewards
    await prisma.reward.deleteMany()
    console.log('✓ Cleared existing rewards')

    // Create rewards
    for (const reward of rewards) {
        await prisma.reward.create({
            data: reward,
        })
        console.log(`✓ Created reward: ${reward.title}`)
    }

    console.log('🎉 Seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
