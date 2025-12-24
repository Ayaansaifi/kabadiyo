import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const userRole = auth?.user?.role
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
            const isOnAdmin = nextUrl.pathname.startsWith('/admin')
            const isOnChat = nextUrl.pathname.startsWith('/chat')
            const isOnBooking = nextUrl.pathname.startsWith('/book')

            // Allow public access to rewards page
            if (nextUrl.pathname.startsWith("/rewards")) {
                return true;
            }

            if (isOnAdmin) {
                // Allow access to Admin Recovery Page
                if (nextUrl.pathname === '/admin/recover') return true

                if (isLoggedIn && userRole === 'ADMIN') return true
                // If logged in but not admin, redirect to dashboard
                if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl))
                // If not logged in, returning false will trigger redirect to login page by NextAuth
                return false
            }

            if (isOnDashboard || isOnChat || isOnBooking) {
                if (isLoggedIn) return true
                return false // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // Optional: Redirect logged-in users away from auth pages if needed
                // return Response.redirect(new URL('/dashboard', nextUrl))
            }
            return true
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }
            if (token.role && session.user) {
                session.user.role = token.role as "USER" | "AGENT" | "KABADIWALA" | "ADMIN"
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
            }
            return token
        }
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
