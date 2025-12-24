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

    // Create multiple Kabadiwalas
    const kabadiwala1 = await prisma.user.upsert({
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

    const kabadiwala2 = await prisma.user.upsert({
        where: { phone: '9888888888' },
        update: {},
        create: {
            phone: '9888888888',
            name: 'Shyam Kabadiwala',
            password,
            role: 'KABADIWALA',
            address: 'Shop 10, Gandhi Nagar, Delhi',
            kabadiwalaProfile: {
                create: {
                    businessName: 'Shyam Scrap Center',
                    serviceArea: 'East Delhi',
                    rating: 4.8,
                    totalReviews: 25,
                    isVerified: true,
                    rates: JSON.stringify({ iron: 32, plastic: 18, paper: 14, copper: 450 })
                }
            }
        },
    })

    const kabadiwala3 = await prisma.user.upsert({
        where: { phone: '9777777777' },
        update: {},
        create: {
            phone: '9777777777',
            name: 'Mohan Metals',
            password,
            role: 'KABADIWALA',
            address: 'Shop 22, Karol Bagh, Delhi',
            kabadiwalaProfile: {
                create: {
                    businessName: 'Mohan Metals & Scrap',
                    serviceArea: 'Central Delhi',
                    rating: 4.2,
                    totalReviews: 8,
                    isVerified: true,
                    rates: JSON.stringify({ iron: 28, plastic: 14, paper: 10, brass: 320 })
                }
            }
        },
    })

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { phone: '9000000000' },
        update: {},
        create: {
            phone: '9000000000',
            name: 'Admin User',
            password,
            role: 'ADMIN',
        },
    })

    console.log({ seller, kabadiwala1, kabadiwala2, kabadiwala3, admin })
    console.log('Database seeded successfully!')
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
