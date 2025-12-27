/**
 * Header Component
 * ----------------
 * Main navigation bar for the application.
 * Features:
 * - Logo and brand name
 * - Desktop navigation links
 * - Mobile hamburger menu with sheet
 * - User profile avatar and logout
 * - Role-based menu items (Kabadiwala gets Dashboard/Orders)
 */
import Link from "next/link"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut } from "lucide-react"
import { redirect } from "next/navigation"
import { MobileProfileButton } from "@/components/layout/MobileProfileButton"

async function getUser() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!userId) return null
    return db.user.findUnique({ where: { id: userId } })
}

async function logout() {
    "use server"
    const cookieStore = await cookies()
    cookieStore.delete("userId")
    cookieStore.delete("userRole")
    redirect("/")
}

export async function Header() {
    const user = await getUser()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-4">
                {/* APP ONLY: Profile avatar on LEFT side (before logo on mobile) */}
                {user && <MobileProfileButton userName={user.name} />}

                <Link href="/" className="mr-6 flex items-center space-x-2 ml-2 md:ml-0">
                    <span className="font-bold text-xl text-primary">Kabadiwala</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 flex-1">
                    <Link href="/market" className="text-sm font-medium hover:text-primary transition-colors">
                        Find Kabadiwala
                    </Link>
                    <Link href="/help" className="text-sm font-medium hover:text-primary transition-colors">
                        Help
                    </Link>
                    {user && user.role === "KABADIWALA" && (
                        <>
                            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                                Dashboard
                            </Link>
                            <Link href="/orders" className="text-sm font-medium hover:text-primary transition-colors">
                                Orders
                            </Link>
                        </>
                    )}
                    {user && (
                        <>
                            <Link href="/chat" className="text-sm font-medium hover:text-primary transition-colors">
                                Messages
                            </Link>
                            <Link href="/settings" className="text-sm font-medium hover:text-primary transition-colors">
                                Settings
                            </Link>
                        </>
                    )}
                </nav>

                <div className="flex items-center gap-2 ml-auto">
                    {user ? (
                        <>
                            {/* Desktop: Full Name + Avatar */}
                            <Link href="/profile" className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <span className="text-sm text-muted-foreground">
                                    Hi, {user.name}
                                </span>
                                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                        {user.name?.[0] || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>

                            {/* Desktop Only: Logout Button */}
                            <form action={logout} className="hidden md:block">
                                <Button variant="ghost" size="icon" type="submit">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            {/* Desktop: Login/Signup */}
                            <div className="hidden md:flex gap-2">
                                <Link href="/login"><Button variant="ghost">Login</Button></Link>
                                <Link href="/register"><Button>Sign Up</Button></Link>
                            </div>

                            {/* Mobile: Login & Signup Buttons */}
                            <div className="flex gap-2 md:hidden">
                                <Link href="/login">
                                    <Button size="sm" variant="outline">Login</Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">Sign Up</Button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}

