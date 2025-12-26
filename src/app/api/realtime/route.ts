import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// In-memory store for connected clients (global scope to persist in dev)
// Note: In production serverless/edge, this needs Redis or similar
declare global {
    var clients: Map<string, ReadableStreamDefaultController>
}

if (!global.clients) {
    global.clients = new Map()
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
        return new NextResponse('Missing userId', { status: 400 })
    }

    const stream = new ReadableStream({
        start(controller) {
            console.log(`[SSE] Client connected: ${userId}`)
            global.clients.set(userId, controller)

            // Send initial connection success message
            const initialData = JSON.stringify({
                type: 'connection',
                data: { status: 'connected', timestamp: Date.now() }
            })
            controller.enqueue(new TextEncoder().encode(`data: ${initialData}\n\n`))
        },
        cancel() {
            console.log(`[SSE] Client disconnected: ${userId}`)
            global.clients.delete(userId)
        }
    })

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Content-Encoding': 'none'
        }
    })
}

/**
 * Helper to send event to specific user
 */
export function sendEventToUser(userId: string, type: string, data: any) {
    const controller = global.clients.get(userId)
    if (controller) {
        const payload = JSON.stringify({ type, data, timestamp: Date.now() })
        try {
            controller.enqueue(new TextEncoder().encode(`data: ${payload}\n\n`))
            return true
        } catch (e) {
            console.error(`[SSE] Failed to send to ${userId}`, e)
            global.clients.delete(userId) // Clean up dead connection
            return false
        }
    }
    return false
}

/**
 * Helper to broadcast event to all users
 */
export function broadcastEvent(type: string, data: any) {
    global.clients.forEach((controller, userId) => {
        sendEventToUser(userId, type, data)
    })
}
