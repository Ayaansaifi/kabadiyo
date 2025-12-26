"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutDashboard, ShoppingCart, MessageCircle, Settings } from "lucide-react"

export function MobileNav() {
    const pathname = usePathname()

    const isActive = (path: string) => {
        if (path === "/" && pathname === "/") return true
        if (path !== "/" && pathname.startsWith(path)) return true
        return false
    }

    const navItems = [
        {
            name: "Home",
            href: "/",
            icon: Home
        },
        {
            name: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "Book",
            href: "/market",
            icon: ShoppingCart
        },
        {
            name: "Chat",
            href: "/chat",
            icon: MessageCircle
        },
        {
            name: "Settings",
            href: "/settings",
            icon: Settings
        }
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe-area-bottom">
            {/* Glassmorphic Background with floating effect shadow */}
            <div className="bg-white/95 dark:bg-black/90 backdrop-blur-xl border-t border-white/20 dark:border-white/10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <div className="flex justify-around items-center h-16 px-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex flex-col items-center justify-center w-full h-full relative transition-colors duration-300 ${active
                                    ? "text-primary"
                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    }`}
                            >
                                {/* Active Indicator Dot */}
                                {active && (
                                    <span className="absolute top-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_currentColor]" />
                                )}

                                <div className={`p-1.5 rounded-2xl transition-all duration-300 active:scale-75 ${active ? "-translate-y-1" : "group-hover:-translate-y-0.5"
                                    }`}>
                                    <item.icon
                                        className={`h-[22px] w-[22px] transition-all duration-300 ${active ? "fill-primary/10 stroke-[2.5px]" : "stroke-2"}`}
                                    />
                                </div>
                                <span className={`text-[9px] font-medium tracking-wide transition-all duration-300 ${active ? "opacity-100 translate-y-0" : "opacity-70 group-hover:opacity-100"
                                    }`}>
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
