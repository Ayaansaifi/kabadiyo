const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const seller = await prisma.user.findUnique({ where: { phone: '9876543210' } })
        const kabadiwala = await prisma.user.findUnique({ where: { phone: '9999999999' } })

        console.log('---START_IDS---')
        console.log('SELLER_ID=' + (seller ? seller.id : 'NOT_FOUND'))
        console.log('KABADIWALA_ID=' + (kabadiwala ? kabadiwala.id : 'NOT_FOUND'))
        console.log('---END_IDS---')
    } catch (e) {
        console.error(e)
    }
}

main()
    .finally(async () => await prisma.$disconnect())
