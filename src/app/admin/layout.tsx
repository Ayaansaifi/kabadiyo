/**
 * Admin Panel Layout
 * ------------------
 * Premium dark theme with gradient sidebar and secure access.
 * Features:
 * - Session verification on mount
 * - Redirect to /admin/login if not authenticated
 * - Responsive sidebar (desktop) + sheet (mobile)
 * - Gradient backgrounds with glass morphism
 */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
    LayoutDashboard,
    Users,
    Recycle,
    Flag,
    Home,
    LogOut,
    ShoppingBag,
    Menu,
    Shield,
    Loader2,
    TrendingUp,
    Camera,
    Star,
    Activity,
    MapPin,
    Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Navigation menu items
const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-400" },
    { href: "/admin/analytics", label: "Analytics", icon: TrendingUp, color: "text-green-400" },
    { href: "/admin/content/stories", label: "Stories", icon: Camera, color: "text-pink-400" },
    { href: "/admin/content/reviews", label: "Reviews", icon: Star, color: "text-yellow-400" },
    { href: "/admin/system", label: "System", icon: Activity, color: "text-red-400" },
    { href: "/admin/insights", label: "Insights", icon: MapPin, color: "text-purple-400" },
    { href: "/admin/users", label: "Users", icon: Users, color: "text-cyan-400" },
    { href: "/admin/kabadiwalas", label: "Kabadiwalas", icon: Recycle, color: "text-emerald-400" },
    { href: "/admin/reports", label: "Reports", icon: Flag, color: "text-orange-400" },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag, color: "text-indigo-400" },
]

function NavItem({ href, label, icon: Icon, color, isActive, onClick }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    isActive: boolean;
    onClick?: () => void;
}) {
    return (
        <Link href={href} onClick={onClick}>
            <div
                className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                    isActive
                        ? "bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 shadow-lg shadow-primary/10"
                        : "hover:bg-white/5 hover:translate-x-1"
                )}
            >
                <div className={cn(
                    "p-2 rounded-lg transition-all",
                    isActive ? "bg-primary/20" : "bg-white/5 group-hover:bg-white/10"
                )}>
                    <Icon className={cn("h-4 w-4", isActive ? "text-primary" : color)} />
                </div>
                <span className={cn(
                    "font-medium transition-colors",
                    isActive ? "text-primary" : "text-slate-300 group-hover:text-white"
                )}>
                    {label}
                </span>
                {isActive && (
                    <Sparkles className="h-3 w-3 text-primary ml-auto animate-pulse" />
                )}
            </div>
        </Link>
    )
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
    const [loggingOut, setLoggingOut] = useState(false)

    const isLoginPage = pathname === "/admin/login"
    const isRecoverPage = pathname === "/admin/recover"

    useEffect(() => {
        if (isLoginPage || isRecoverPage) {
            setIsValidSession(true)
            return
        }

        async function checkSession() {
            try {
                const res = await fetch("/api/admin/security", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "CHECK" }),
                    credentials: "include"
                })
                const data = await res.json()

                if (!data.valid) {
                    setIsValidSession(false)
                    router.push("/admin/login")
                } else {
                    setIsValidSession(true)
                }
            } catch (error) {
                console.error("Session check failed:", error)
                setIsValidSession(false)
                router.push("/admin/login")
            }
        }

        checkSession()
    }, [pathname, isLoginPage, isRecoverPage, router])

    const handleLogout = async () => {
        setLoggingOut(true)
        try {
            await fetch("/api/admin/security", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "LOGOUT" })
            })
            await fetch("/api/auth/logout", { method: "POST" })

            toast.success("Logged out successfully")
            router.push("/admin/login")
            router.refresh()
        } catch (error) {
            console.error("Logout failed:", error)
            toast.error("Logout failed")
        } finally {
            setLoggingOut(false)
        }
    }

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === "/admin"
        }
        return pathname.startsWith(href)
    }

    // Loading state with premium animation
    if (isValidSession === null && !isLoginPage && !isRecoverPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <div className="text-center relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                    <Shield className="h-16 w-16 mx-auto mb-4 text-primary relative z-10 animate-bounce" />
                    <p className="text-slate-400 relative z-10">Verifying admin access...</p>
                </div>
            </div>
        )
    }

    if (isLoginPage || isRecoverPage) {
        return <>{children}</>
    }

    const SidebarContent = () => (
        <>
            {/* Header with gradient */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
                <h1 className="text-xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary to-primary/50 rounded-xl shadow-lg shadow-primary/20">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-white">Admin</span>
                    <span className="text-[10px] bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                        Pro
                    </span>
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavItem
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        color={item.color}
                        isActive={isActive(item.href)}
                        onClick={() => setMobileOpen(false)}
                    />
                ))}
            </nav>

            {/* Footer actions */}
            <div className="p-4 border-t border-white/10 space-y-2 bg-gradient-to-t from-black/20 to-transparent">
                <Link href="/" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-3 bg-white/5 border-white/10 hover:bg-white/10 text-slate-300">
                        <Home className="h-4 w-4" />
                        Public Home
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={handleLogout}
                    disabled={loggingOut}
                >
                    {loggingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <LogOut className="h-4 w-4" />
                    )}
                    Secure Logout
                </Button>
            </div>
        </>
    )

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Desktop Sidebar - Premium Glass Effect */}
            <aside className="w-72 bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-r border-white/10 hidden md:flex flex-col">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-br from-primary to-primary/50 rounded-lg">
                        <Shield className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-white">Admin Panel</span>
                </div>
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-0 flex flex-col bg-slate-900/95 backdrop-blur-xl border-white/10">
                        <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto md:pt-0 pt-14">
                <div className="p-4 md:p-8 min-h-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
