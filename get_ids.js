const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const seller = await prisma.user.findUnique({ where: { phone: '9876543210' }, select: { id: true } })
    const kabadiwala = await prisma.user.findUnique({ where: { phone: '9999999999' }, select: { id: true } })
    console.log('SELLER_ID:', seller?.id)
    console.log('KABADIWALA_ID:', kabadiwala?.id)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
