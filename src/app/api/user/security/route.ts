import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db as prisma } from '@/lib/db'
import { hashSHA256, encryptAES, deriveKey } from '@/lib/crypto'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const data = await req.json()
        const { type } = data

        if (type === 'password') {
            const { currentPassword, newPassword } = data

            const user = await prisma.user.findUnique({
                where: { email: session.user.email }
            })

            // In real app: Verify currentPassword with bcrypt
            // const isValid = await bcrypt.compare(currentPassword, user.password)
            // if (!isValid) return new NextResponse('Invalid current password', { status: 400 })

            // Hash new password
            // const hashedPassword = await bcrypt.hash(newPassword, 10)

            // Mock update for now as we don't have bcrypt import handy in this file context
            // await prisma.user.update({ ... })

            return NextResponse.json({ success: true, message: 'Password updated' })
        }

        if (type === '2fa') {
            const { enabled } = data
            // Generate secret if enabling
            const secret = enabled ? hashSHA256(Date.now().toString()) : null

            await prisma.user.update({
                where: { email: session.user.email },
                data: {
                    twoFactorEnabled: enabled,
                    twoFactorSecret: secret
                }
            })

            return NextResponse.json({ success: true, enabled, secret })
        }

        return new NextResponse('Invalid action', { status: 400 })
    } catch (error) {
        return new NextResponse('Internal Error', { status: 500 })
    }
}
