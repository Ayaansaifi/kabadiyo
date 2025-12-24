
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
    console.log("Starting Admin Password Reset...")

    const NEW_PASSWORD = "Kabadiwala@2025"
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10)

    // 1. Reset Admin Config (The main panel lock)
    console.log("Step 1: Wiping old Admin Configs...")
    await db.adminConfig.deleteMany({})

    console.log("Step 2: Creating Fresh Admin Config...")
    await db.adminConfig.create({
        data: {
            adminPassword: hashedPassword,
            isSetup: true,
            failedAttempts: 0,
            lockedUntil: null
        }
    })

    // 2. Find Admin User (or create/promote)
    // We try to find a user with role ADMIN, or fallback to email 'admin@kabadiwala.com'
    console.log("Step 3: Updating User Role...")

    // First, try to find existing ADMIN
    let adminUser = await db.user.findFirst({
        where: { role: "ADMIN" }
    })

    if (adminUser) {
        console.log(`Found existing Admin: ${adminUser.email}`)
        await db.user.update({
            where: { id: adminUser.id },
            data: { password: hashedPassword }
        })
    } else {
        // Fallback: Look for 'admin@kabadiwala.com'
        const email = "admin@kabadiwala.com"
        adminUser = await db.user.findUnique({ where: { email } })

        if (adminUser) {
            console.log(`Found user ${email}, promoting to ADMIN...`)
            await db.user.update({
                where: { id: adminUser.id },
                data: { role: "ADMIN", password: hashedPassword }
            })
        } else {
            console.log("No Admin found. Please register a user first, or update a specific email via database.")
            // Ideally we could create one, but phone number requirement makes it tricky without valid data.
            // But we have reset the AdminConfig, which is the main Login Gate for /admin/login
        }
    }

    console.log("DONE! Password set to: " + NEW_PASSWORD)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
