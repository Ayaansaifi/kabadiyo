/**
 * File Upload API
 * ---------------
 * POST: Upload images for stories, profiles, and covers.
 * 
 * Supported types: JPEG, PNG, GIF, WebP
 * Max size: 5MB per file
 * Storage: /public/uploads/{type}/
 * 
 * Uses legacy cookie auth for compatibility with current login system.
 */
import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// Get current user from cookies (legacy auth)
async function getCurrentUser() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!userId) return null
    return { id: userId }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get("file") as File
        const type = formData.get("type") as string || "story" // story, profile, cover

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, GIF, WebP allowed." }, { status: 400 })
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Max 5MB allowed." }, { status: 400 })
        }

        // Create upload directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), "public", "uploads", type)
        await mkdir(uploadDir, { recursive: true })

        // Generate unique filename
        const ext = file.name.split(".").pop() || "jpg"
        const filename = `${user.id}-${Date.now()}.${ext}`

        // Save file
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filepath = path.join(uploadDir, filename)
        await writeFile(filepath, buffer)

        // Return public URL
        const url = `/uploads/${type}/${filename}`

        return NextResponse.json({
            success: true,
            url,
            filename,
            size: file.size,
            type: file.type
        })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }
}
