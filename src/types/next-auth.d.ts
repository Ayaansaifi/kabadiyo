import { DefaultSession, DefaultUser } from "next-auth"
import { JWT as DefaultJWT } from "next-auth/jwt"

type UserRole = "USER" | "AGENT" | "KABADIWALA" | "ADMIN"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: UserRole
            phone?: string
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        role: UserRole
        phone?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        role?: UserRole
        phone?: string
    }
}
