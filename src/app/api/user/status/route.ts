import { NextRequest, NextResponse } from 'next/server'
import { broadcastEvent } from '../../realtime/route'

export async function POST(req: NextRequest) {
    try {
        const { userId, isOnline } = await req.json()

        // Broadcast online status to all connected clients
        // In production, you might want to scope this to friends/active chats only
        broadcastEvent('online', { userId, isOnline })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }
}
