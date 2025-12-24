/**
 * Story Creator Component
 * -----------------------
 * Create text-based or image-based stories.
 * Features:
 * - Text stories with color backgrounds
 * - Image stories (upload or paste URL)
 * - Multiple images (up to 5) for batch story creation
 * - Optional captions
 * - Preview before posting
 */
"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Image as ImageIcon, Type, Send, Loader2, Upload, Camera, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface StoryCreatorProps {
    onClose: () => void
    onCreated: () => void
}

const bgColors = [
    "#10b981", // Green
    "#3b82f6", // Blue
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#06b6d4", // Cyan
    "#84cc16", // Lime
    "#6366f1", // Indigo
    "#000000", // Black
]

const MAX_IMAGES = 5

interface UploadedImage {
    url: string
    caption: string
}

export function StoryCreator({ onClose, onCreated }: StoryCreatorProps) {
    const [mode, setMode] = useState<"TEXT" | "IMAGE">("TEXT")
    const [text, setText] = useState("")
    const [bgColor, setBgColor] = useState(bgColors[0])
    const [caption, setCaption] = useState("")
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Multi-image state
    const [images, setImages] = useState<UploadedImage[]>([])
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        // Check max limit
        if (images.length + files.length > MAX_IMAGES) {
            toast.error(`Maximum ${MAX_IMAGES} images allowed`)
            return
        }

        // Validate all files
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                toast.error(`${file.name}: Only JPEG, PNG, GIF, WebP allowed`)
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name}: File too large. Max 5MB allowed.`)
                return
            }
        }

        setUploading(true)
        setError("")

        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData()
                formData.append("file", file)
                formData.append("type", "story")

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                    credentials: 'include'
                })

                if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.error || "Upload failed")
                }

                const data = await res.json()
                return { url: data.url, caption: "" }
            })

            const uploadedImages = await Promise.all(uploadPromises)
            setImages(prev => [...prev, ...uploadedImages])
            toast.success(`${uploadedImages.length} image(s) uploaded!`)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed")
            toast.error("Failed to upload images")
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
        if (currentImageIndex >= images.length - 1) {
            setCurrentImageIndex(Math.max(0, images.length - 2))
        }
    }

    const updateImageCaption = (index: number, newCaption: string) => {
        setImages(prev => prev.map((img, i) =>
            i === index ? { ...img, caption: newCaption } : img
        ))
    }

    const handleSubmit = async () => {
        setError("")
        setLoading(true)

        try {
            if (mode === "TEXT") {
                // Single text story
                const body = { mediaType: "TEXT", text, bgColor, caption: caption || undefined }
                const res = await fetch("/api/stories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                    credentials: 'include'
                })

                if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.error || "Failed to create story")
                }

                toast.success("Story created!")
            } else {
                // Multiple image stories
                let successCount = 0
                for (const img of images) {
                    const body = {
                        mediaType: "IMAGE",
                        mediaUrl: img.url,
                        caption: img.caption || undefined
                    }

                    const res = await fetch("/api/stories", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                        credentials: 'include'
                    })

                    if (res.ok) {
                        successCount++
                    }
                }

                if (successCount === images.length) {
                    toast.success(`${successCount} stories created!`)
                } else if (successCount > 0) {
                    toast.warning(`${successCount}/${images.length} stories created`)
                } else {
                    throw new Error("Failed to create stories")
                }
            }

            onCreated()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const isValid = mode === "TEXT" ? text.trim().length > 0 : images.length > 0

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-background rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="font-semibold text-lg">Create Story</h2>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex gap-2 p-4 border-b">
                        <Button
                            variant={mode === "TEXT" ? "default" : "outline"}
                            onClick={() => setMode("TEXT")}
                            className="flex-1"
                        >
                            <Type className="h-4 w-4 mr-2" />
                            Text
                        </Button>
                        <Button
                            variant={mode === "IMAGE" ? "default" : "outline"}
                            onClick={() => setMode("IMAGE")}
                            className="flex-1"
                        >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Images {images.length > 0 && `(${images.length})`}
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4 overflow-y-auto flex-1">
                        {mode === "TEXT" ? (
                            <>
                                {/* Text Preview */}
                                <div
                                    className="aspect-[9/16] max-h-[300px] rounded-xl flex items-center justify-center p-6 transition-colors"
                                    style={{ backgroundColor: bgColor }}
                                >
                                    <p className="text-white text-xl font-bold text-center leading-relaxed">
                                        {text || "Your story text will appear here..."}
                                    </p>
                                </div>

                                {/* Text Input */}
                                <Textarea
                                    placeholder="Type your story text..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="resize-none"
                                    rows={3}
                                    maxLength={200}
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                    {text.length}/200
                                </p>

                                {/* Color Picker */}
                                <div>
                                    <p className="text-sm font-medium mb-2">Background Color</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {bgColors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setBgColor(color)}
                                                className={cn(
                                                    "w-8 h-8 rounded-full transition-transform hover:scale-110",
                                                    bgColor === color && "ring-2 ring-offset-2 ring-primary"
                                                )}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Caption for text */}
                                <Input
                                    placeholder="Add a caption (optional)..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    maxLength={100}
                                />
                            </>
                        ) : (
                            <>
                                {/* Image Grid Preview */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {images.map((img, index) => (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all",
                                                    currentImageIndex === index
                                                        ? "border-primary ring-2 ring-primary/30"
                                                        : "border-transparent hover:border-muted-foreground/30"
                                                )}
                                                onClick={() => setCurrentImageIndex(index)}
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={`Story ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        removeImage(index)
                                                    }}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add More Button */}
                                        {images.length < MAX_IMAGES && (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                                            >
                                                {uploading ? (
                                                    <Loader2 className="h-6 w-6 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Plus className="h-6 w-6" />
                                                        <span className="text-[10px]">Add More</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Caption for current image */}
                                {images.length > 0 && (
                                    <Input
                                        placeholder={`Caption for image ${currentImageIndex + 1} (optional)...`}
                                        value={images[currentImageIndex]?.caption || ""}
                                        onChange={(e) => updateImageCaption(currentImageIndex, e.target.value)}
                                        maxLength={100}
                                    />
                                )}

                                {/* Empty State / Upload Area */}
                                {images.length === 0 && (
                                    <div
                                        className="aspect-[9/16] max-h-[300px] rounded-xl overflow-hidden relative border-2 border-dashed border-gray-300 dark:border-gray-600"
                                    >
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="h-12 w-12 animate-spin" />
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-12 w-12" />
                                                    <span className="font-medium">Click to upload images</span>
                                                    <span className="text-xs">Up to {MAX_IMAGES} images at once</span>
                                                    <span className="text-xs text-muted-foreground">JPEG, PNG, GIF, WebP (Max 5MB each)</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    multiple
                                />

                                {/* Story count info */}
                                {images.length > 0 && (
                                    <p className="text-xs text-center text-muted-foreground">
                                        {images.length} {images.length === 1 ? 'story' : 'stories'} will be created
                                    </p>
                                )}
                            </>
                        )}

                        {/* Error */}
                        {error && (
                            <p className="text-sm text-red-500 text-center">{error}</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t">
                        <Button
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={!isValid || loading || uploading}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Send className="h-4 w-4 mr-2" />
                            )}
                            {mode === "IMAGE" && images.length > 1
                                ? `Share ${images.length} Stories`
                                : "Share Story"
                            }
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
