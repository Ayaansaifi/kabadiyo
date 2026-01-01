"use client"

import { useIsNativePlatform } from "@/hooks/useNativePlatform"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, MapPin, HelpCircle, LayoutDashboard, ScrollText, MessageCircle, Settings, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"

interface MobileWebMenuProps {
    userRole?: string | null
    isLoggedIn: boolean
}

export function MobileWebMenu({ userRole, isLoggedIn }: MobileWebMenuProps) {
    const { isNative, isLoading } = useIsNativePlatform()
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    // Don't show on Native App (it has bottom nav)
    // Don't show on Desktop (hidden by CSS parent usually, but safe check)
    if (isLoading || isNative) return null

    const close = () => setOpen(false)

    const isActive = (path: string) => pathname === path

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                <SheetHeader className="text-left mb-6">
                    <SheetTitle className="text-2xl font-bold text-green-600 flex items-center gap-2">
                        <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-lg">K</div>
                        Kabadiyo
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-1">
                    <NavItem href="/" icon={Home} label="Home" active={isActive("/")} onClick={close} />
                    <NavItem href="/market" icon={MapPin} label="Find Kabadiwala" active={isActive("/market")} onClick={close} />
                    <NavItem href="/rate-list" icon={ScrollText} label="Rate List" active={isActive("/rate-list")} onClick={close} />
                    <NavItem href="/help" icon={HelpCircle} label="Help & Support" active={isActive("/help")} onClick={close} />

                    {isLoggedIn && (
                        <>
                            <div className="h-px bg-border my-2" />
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">Account</h4>

                            {userRole === "KABADIWALA" && (
                                <>
                                    <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive("/dashboard")} onClick={close} />
                                    <NavItem href="/orders" icon={ScrollText} label="My Orders" active={isActive("/orders")} onClick={close} />
                                </>
                            )}

                            <NavItem href="/chat" icon={MessageCircle} label="Messages" active={isActive("/chat")} onClick={close} />
                            <NavItem href="/profile" icon={User} label="Profile" active={isActive("/profile")} onClick={close} />
                            <NavItem href="/settings" icon={Settings} label="Settings" active={isActive("/settings")} onClick={close} />
                        </>
                    )}

                    {!isLoggedIn && (
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <Link href="/login" onClick={close}>
                                <Button variant="outline" className="w-full">Login</Button>
                            </Link>
                            <Link href="/register" onClick={close}>
                                <Button className="w-full">Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

function NavItem({ href, icon: Icon, label, active, onClick }: any) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 font-medium"
                    : "hover:bg-muted text-foreground/80"
                }`}
        >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
        </Link>
    )
}
