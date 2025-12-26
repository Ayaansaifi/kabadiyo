import { NextRequest, NextResponse } from 'next/server'
import { sendEventToUser } from '../../realtime/route'

export async function POST(req: NextRequest) {
    try {
        const { chatId, userId } = await req.json()

        // In a real app, you'd look up the chat participants from DB
        // For now, we'll assuming we want to notify the "other" person in the chat

        // TODO: Fetch other participant ID from DB based on chatId
        // const chat = await prisma.chat.findUnique({ where: { id: chatId }, include: { users: true } })
        // const otherUser = chat.users.find(u => u.id !== userId)

        // Mock broadcasting to "other" user logic for demo
        // Ideally: sendEventToUser(otherUserId, 'typing', { chatId, userId })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send typing indicator' }, { status: 500 })
    }
}
