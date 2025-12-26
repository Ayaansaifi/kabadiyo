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
import { LogOut, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { redirect } from "next/navigation"

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
                <Link href="/" className="mr-6 flex items-center space-x-2">
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

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link href="/profile" className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <span className="text-sm text-muted-foreground">
                                    Hi, {user.name}
                                </span>
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <form action={logout}>
                                <Button variant="ghost" size="icon" type="submit">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="hidden md:flex gap-2">
                            <Link href="/login"><Button variant="ghost">Login</Button></Link>
                            <Link href="/register"><Button>Sign Up</Button></Link>
                        </div>
                    )}

                    {/* Mobile Menu - Hidden on mobile as we now have Bottom Nav */}
                    <Sheet>
                        <SheetTrigger asChild className="hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px]">
                            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                            <nav className="flex flex-col gap-4 mt-8">
                                <Link href="/profile" className="flex items-center gap-2 mb-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user?.name || "User"}</span>
                                        <span className="text-xs text-muted-foreground">View Profile</span>
                                    </div>
                                </Link>
                                <Link href="/market" className="text-lg font-medium">Find Kabadiwala</Link>
                                {user ? (
                                    <>
                                        {user.role === "KABADIWALA" && (
                                            <>
                                                <Link href="/dashboard" className="text-lg font-medium">Dashboard</Link>
                                                <Link href="/orders" className="text-lg font-medium">Orders</Link>
                                                <Link href="/favorites" className="text-lg font-medium">Favorites</Link>
                                            </>
                                        )}
                                        <Link href="/chat" className="text-lg font-medium">Messages</Link>
                                        <form action={logout} className="mt-4">
                                            <Button variant="destructive" className="w-full">Logout</Button>
                                        </form>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login"><Button variant="outline" className="w-full">Login</Button></Link>
                                        <Link href="/register"><Button className="w-full">Sign Up</Button></Link>
                                    </>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
// Skipping Header update as it is a server component and user request was specific to Profile page.
