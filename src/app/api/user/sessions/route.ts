import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db as prisma } from '@/lib/db'

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const sessions = await prisma.session.findMany({
            where: { userId: session.user.id },
            orderBy: { lastActive: 'desc' },
            select: {
                id: true,
                userAgent: true,
                ipAddress: true,
                lastActive: true,
                isMobile: true,
                city: true,
            }
        })

        // Transform for UI
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedSessions = sessions.map((s: any) => ({
            id: s.id,
            device: s.userAgent || 'Unknown Device',
            location: s.city || 'Unknown Location',
            current: false, // In real app, match with current session token
            time: s.lastActive.toISOString()
        }))

        return NextResponse.json({ sessions: formattedSessions })

    } catch (error) {
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const sessionId = searchParams.get('id')

        if (sessionId) {
            // Delete specific session
            await prisma.session.deleteMany({
                where: {
                    id: sessionId,
                    userId: session.user.id
                }
            })
        } else {
            // Delete all OTHER sessions
            // await prisma.session.deleteMany({
            //     where: { 
            //         userId: session.user.id,
            //         NOT: { id: currentSessionId }
            //     }
            // })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return new NextResponse('Internal Error', { status: 500 })
    }
}
