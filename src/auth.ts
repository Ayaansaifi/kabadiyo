import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

type UserRole = "USER" | "AGENT" | "KABADIWALA" | "ADMIN"

async function getUser(phone: string) {
    try {
        const user = await db.user.findUnique({ where: { phone } })
        return user
    } catch (error) {
        console.error('Failed to fetch user:', error)
        throw new Error('Failed to fetch user.')
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ phone: z.string().min(10), password: z.string().min(6) })
                    .safeParse(credentials)

                if (parsedCredentials.success) {
                    const { phone, password } = parsedCredentials.data
                    const user = await getUser(phone)
                    if (!user) return null

                    const passwordsMatch = await bcrypt.compare(password, user.password)
                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            phone: user.phone,
                            role: user.role as UserRole
                        }
                    }
                }

                console.log('Invalid credentials')
                return null
            },
        }),
    ],
})
