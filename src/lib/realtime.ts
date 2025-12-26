/**
 * Real-Time Server-Sent Events (SSE) Service
 * For real-time chat, notifications, and status updates
 */

type EventType = 'message' | 'notification' | 'typing' | 'online' | 'order' | 'error'

interface SSEMessage {
    type: EventType
    data: unknown
    timestamp: number
}

type MessageHandler = (message: SSEMessage) => void

class RealtimeService {
    private eventSource: EventSource | null = null
    private handlers: Map<EventType, Set<MessageHandler>> = new Map()
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectDelay = 1000
    private isConnecting = false
    private userId: string | null = null

    /**
     * Connect to SSE endpoint
     */
    connect(userId: string): void {
        if (this.eventSource || this.isConnecting) {
            return
        }

        this.userId = userId
        this.isConnecting = true

        try {
            this.eventSource = new EventSource(`/api/realtime?userId=${userId}`)

            this.eventSource.onopen = () => {
                console.log('[SSE] Connected')
                this.reconnectAttempts = 0
                this.isConnecting = false
            }

            this.eventSource.onmessage = (event) => {
                try {
                    const message: SSEMessage = JSON.parse(event.data)
                    this.dispatch(message)
                } catch (error) {
                    console.error('[SSE] Failed to parse message:', error)
                }
            }

            this.eventSource.onerror = (error) => {
                console.error('[SSE] Connection error:', error)
                this.eventSource?.close()
                this.eventSource = null
                this.isConnecting = false
                this.attemptReconnect()
            }

            // Custom event types
            this.eventSource.addEventListener('message', (event) => {
                this.handleEvent('message', event)
            })

            this.eventSource.addEventListener('typing', (event) => {
                this.handleEvent('typing', event)
            })

            this.eventSource.addEventListener('notification', (event) => {
                this.handleEvent('notification', event)
            })

            this.eventSource.addEventListener('online', (event) => {
                this.handleEvent('online', event)
            })

            this.eventSource.addEventListener('order', (event) => {
                this.handleEvent('order', event)
            })

        } catch (error) {
            console.error('[SSE] Failed to connect:', error)
            this.isConnecting = false
            this.attemptReconnect()
        }
    }

    private handleEvent(type: EventType, event: MessageEvent): void {
        try {
            const data = JSON.parse(event.data)
            this.dispatch({
                type,
                data,
                timestamp: Date.now()
            })
        } catch (error) {
            console.error(`[SSE] Failed to parse ${type} event:`, error)
        }
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[SSE] Max reconnection attempts reached')
            this.dispatch({
                type: 'error',
                data: { message: 'Connection lost. Please refresh the page.' },
                timestamp: Date.now()
            })
            return
        }

        this.reconnectAttempts++
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

        console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

        setTimeout(() => {
            if (this.userId) {
                this.connect(this.userId)
            }
        }, delay)
    }

    /**
     * Disconnect from SSE
     */
    disconnect(): void {
        if (this.eventSource) {
            this.eventSource.close()
            this.eventSource = null
        }
        this.handlers.clear()
        this.reconnectAttempts = 0
        this.userId = null
    }

    /**
     * Subscribe to events
     */
    on(type: EventType, handler: MessageHandler): () => void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set())
        }
        this.handlers.get(type)!.add(handler)

        // Return unsubscribe function
        return () => {
            this.handlers.get(type)?.delete(handler)
        }
    }

    /**
     * Dispatch event to handlers
     */
    private dispatch(message: SSEMessage): void {
        const handlers = this.handlers.get(message.type)
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(message)
                } catch (error) {
                    console.error('[SSE] Handler error:', error)
                }
            })
        }
    }

    /**
     * Check connection status
     */
    isConnected(): boolean {
        return this.eventSource?.readyState === EventSource.OPEN
    }
}

// Singleton instance
export const realtimeService = new RealtimeService()

/**
 * React hook for real-time events
 */
export function useRealtime(userId: string | null | undefined) {
    if (typeof window === 'undefined') return

    // Connect on mount
    if (userId) {
        realtimeService.connect(userId)
    }

    return realtimeService
}

/**
 * Send typing indicator
 */
export async function sendTypingIndicator(chatId: string, userId: string): Promise<void> {
    try {
        await fetch('/api/chat/typing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId, userId })
        })
    } catch (error) {
        console.error('Failed to send typing indicator:', error)
    }
}

/**
 * Update online status
 */
export async function updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
        await fetch('/api/user/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, isOnline })
        })
    } catch (error) {
        console.error('Failed to update online status:', error)
    }
}
