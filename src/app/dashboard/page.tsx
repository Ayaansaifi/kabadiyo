import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { DashboardClient } from "./DashboardClient"

async function getUser() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!userId) return null
    return db.user.findUnique({
        where: { id: userId },
        include: {
            sellerProfile: true,
            favorites: true
        }
    })
}

export default async function DashboardPage() {
    const user = await getUser()
    if (!user) redirect("/login")

    // Redirect based on role
    if (user.role === "KABADIWALA") {
        redirect("/kabadiwala/dashboard")
    }
    if (user.role === "ADMIN") {
        redirect("/admin")
    }

    return (
        <DashboardClient
            initialUser={{
                id: user.id,
                name: user.name,
                role: user.role,
                favorites: user.favorites
            }}
        />
    )
}
