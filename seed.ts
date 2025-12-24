import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('password123', 10)

    // Create a Seller
    const seller = await prisma.user.upsert({
        where: { phone: '9876543210' },
        update: {},
        create: {
            phone: '9876543210',
            name: 'Rahul Seller',
            password,
            role: 'USER',
            address: '123, Green Park, Delhi'
        },
    })

    // Create a Kabadiwala
    const kabadiwala = await prisma.user.upsert({
        where: { phone: '9999999999' },
        update: {},
        create: {
            phone: '9999999999',
            name: 'Raju Scrap Dealer',
            password,
            role: 'KABADIWALA',
            address: 'Shop 4, Market Road, Delhi',
            kabadiwalaProfile: {
                create: {
                    businessName: 'Raju Kabadi',
                    serviceArea: 'South Delhi',
                    rating: 4.5,
                    totalReviews: 10,
                    isVerified: true,
                    rates: JSON.stringify({ iron: 30, plastic: 15, paper: 12 })
                }
            }
        },
    })

    console.log({ seller, kabadiwala })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
