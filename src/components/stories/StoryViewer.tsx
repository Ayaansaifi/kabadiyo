/**
 * Story Viewer Component
 * ----------------------
 * Full-screen story viewer with:
 * - Auto-progress timer (5s per story)
 * - Tap to pause/resume
 * - Swipe/click navigation
 * - View count for own stories
 * - WhatsApp-like viewers list panel
 * - Delete option for own stories
 */
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Eye, Trash2, MoreVertical, ChevronUp, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Story {
    id: string
    mediaUrl?: string
    mediaType: string
    text?: string
    bgColor?: string
    caption?: string
    createdAt: string
    hasViewed?: boolean
}

interface StoryGroup {
    user: {
        id: string
        name: string | null
        image?: string | null
        kabadiwalaProfile?: { businessName: string } | null
    }
    stories: Story[]
    hasUnviewed: boolean
}

interface Viewer {
    id: string
    viewedAt: string
    viewer: {
        id: string
        name: string | null
        image: string | null
    }
}

interface StoryViewerProps {
    storyGroups: StoryGroup[]
    initialGroupIndex: number
    currentUserId?: string
    onClose: () => void
}

export function StoryViewer({ storyGroups, initialGroupIndex, currentUserId, onClose }: StoryViewerProps) {
    const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex)
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
    const [progress, setProgress] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [viewCount, setViewCount] = useState<number | null>(null)
    const [viewers, setViewers] = useState<Viewer[]>([])
    const [showViewers, setShowViewers] = useState(false)
    // Use refs to track if component is mounted to prevent state updates after unmount
    const isMounted = useRef(true)
    const progressInterval = useRef<NodeJS.Timeout | null>(null)

    const currentGroup = storyGroups[currentGroupIndex]
    const currentStory = currentGroup?.stories[currentStoryIndex]
    const isOwnStory = currentUserId === currentGroup?.user.id

    const STORY_DURATION = 5000 // 5 seconds per story

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    // Record view
    useEffect(() => {
        if (currentStory && !isOwnStory) {
            // Use fire-and-forget for view recording
            fetch(`/api/stories/${currentStory.id}/view`, { method: "POST", credentials: 'include' })
                .catch(err => console.error("Failed to record view", err))
        }
    }, [currentStory, isOwnStory])

    // Load view count and viewers for own stories
    useEffect(() => {
        if (currentStory && isOwnStory) {
            // Initial fetch
            const fetchViews = () => {
                fetch(`/api/stories/${currentStory.id}/view`, { credentials: 'include' })
                    .then(res => res.json())
                    .then(data => {
                        if (isMounted.current) {
                            setViewCount(data.total || 0)
                            setViewers(data.views || [])
                        }
                    })
                    .catch(() => {
                        if (isMounted.current) {
                            setViewCount(null)
                            setViewers([])
                        }
                    })
            }

            fetchViews()

            // Poll every 3 seconds for real-time updates
            const viewInterval = setInterval(fetchViews, 3000)

            return () => clearInterval(viewInterval)
        } else {
            const timer = setTimeout(() => {
                if (isMounted.current) {
                    setViewCount(null)
                    setViewers([])
                }
            }, 0)
            return () => clearTimeout(timer)
        }
    }, [currentStory, isOwnStory])

    // Navigate to next story
    const goToNextStory = useCallback(() => {
        if (currentStoryIndex < currentGroup.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1)
            setProgress(0)
            setShowViewers(false)
        } else if (currentGroupIndex < storyGroups.length - 1) {
            setCurrentGroupIndex(prev => prev + 1)
            setCurrentStoryIndex(0)
            setProgress(0)
            setShowViewers(false)
        } else {
            // Defer onClose to avoid "Cannot update component while rendering"
            setTimeout(() => {
                if (isMounted.current) onClose()
            }, 0)
        }
    }, [currentStoryIndex, currentGroupIndex, currentGroup?.stories.length, storyGroups.length, onClose])

    // Progress timer
    useEffect(() => {
        if (isPaused || showViewers) return

        progressInterval.current = setInterval(() => {
            if (!isMounted.current) return

            setProgress(prev => {
                if (prev >= 100) {
                    // Start transition to next story
                    // Clear interval immediately to prevent multiple triggers
                    if (progressInterval.current) clearInterval(progressInterval.current)
                    goToNextStory()
                    return 0
                }
                return prev + (100 / (STORY_DURATION / 100))
            })
        }, 100)

        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current)
        }
    }, [currentStoryIndex, currentGroupIndex, isPaused, showViewers, goToNextStory])

    const goToPrevStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1)
            setProgress(0)
            setShowViewers(false)
        } else if (currentGroupIndex > 0) {
            setCurrentGroupIndex(prev => prev - 1)
            setCurrentStoryIndex(storyGroups[currentGroupIndex - 1].stories.length - 1)
            setProgress(0)
            setShowViewers(false)
        }
    }

    if (!currentStory) return
    try {
        const res = await fetch(`/api/stories/${currentStory.id}`, { method: "DELETE", credentials: 'include' })
        if (res.ok) {
            toast.success("Story deleted")
            // Remove from local state immediately for better UI
            // Actually goToNextStory handles navigation, but we might want to refresh upstream
            goToNextStory()
            onClose() // Close for now to force refresh
        } else {
            toast.error("Failed to delete story")
        }
    } catch (error) {
        toast.error("Error deleting story")
        console.error("Failed to delete story")
    }

    const getDisplayName = () => {
        if (currentGroup.user.kabadiwalaProfile?.businessName) {
            return currentGroup.user.kabadiwalaProfile.businessName
        }
        return currentGroup.user.name || "User"
    }

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        if (hours < 1) {
            const minutes = Math.floor(diff / (1000 * 60))
            return `${minutes}m ago`
        }
        return `${hours}h ago`
    }

    if (!currentGroup || !currentStory) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                onMouseDown={() => !showViewers && setIsPaused(true)}
                onMouseUp={() => !showViewers && setIsPaused(false)}
                onTouchStart={() => !showViewers && setIsPaused(true)}
                onTouchEnd={() => !showViewers && setIsPaused(false)}
            >
                {/* Story Container */}
                <div className="relative w-full h-full max-w-md mx-auto">
                    {/* Progress Bars */}
                    <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
                        {currentGroup.stories.map((_, idx) => (
                            <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all duration-100"
                                    style={{
                                        width: idx === currentStoryIndex ? `${progress}%` :
                                            idx < currentStoryIndex ? "100%" : "0%"
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Header */}
                    <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                                {getDisplayName()[0]}
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">{getDisplayName()}</p>
                                <p className="text-white/70 text-xs">{getTimeAgo(currentStory.createdAt)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isOwnStory && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-white">
                                            <MoreVertical className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Story
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                            <Button variant="ghost" size="icon" className="text-white" onClick={onClose}>
                                <X className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>

                    {/* Story Content */}
                    <div className="w-full h-full flex items-center justify-center">
                        {currentStory.mediaType === "IMAGE" && currentStory.mediaUrl ? (
                            <img
                                src={currentStory.mediaUrl}
                                alt="Story"
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center p-8"
                                style={{ backgroundColor: currentStory.bgColor || "#10b981" }}
                            >
                                <p className="text-white text-2xl md:text-4xl font-bold text-center leading-relaxed">
                                    {currentStory.text}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Caption */}
                    {currentStory.caption && (
                        <div className="absolute bottom-20 left-4 right-4 z-20">
                            <p className="text-white text-center bg-black/50 px-4 py-2 rounded-lg">
                                {currentStory.caption}
                            </p>
                        </div>
                    )}

                    {/* View Count Button (own stories) - Opens viewers panel */}
                    {isOwnStory && viewCount !== null && (
                        <button
                            onClick={() => setShowViewers(!showViewers)}
                            className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/30 px-3 py-2 rounded-full"
                        >
                            <Eye className="h-5 w-5" />
                            <span>{viewCount} {viewCount === 1 ? 'view' : 'views'}</span>
                            <ChevronUp className={cn("h-4 w-4 transition-transform", showViewers && "rotate-180")} />
                        </button>
                    )}

                    {/* Viewers Panel (WhatsApp-like) */}
                    <AnimatePresence>
                        {showViewers && isOwnStory && (
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="absolute bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-xl rounded-t-3xl max-h-[60%] overflow-hidden"
                            >
                                {/* Handle */}
                                <div className="flex justify-center py-2">
                                    <div className="w-10 h-1 bg-white/30 rounded-full" />
                                </div>

                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-white/70" />
                                        <span className="font-semibold text-white">Viewers</span>
                                        <span className="text-white/50 text-sm">({viewCount})</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white/70"
                                        onClick={() => setShowViewers(false)}
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                {/* Viewers List */}
                                <div className="overflow-y-auto max-h-[40vh] p-2">
                                    {viewers.length === 0 ? (
                                        <div className="text-center py-8 text-white/50">
                                            <Eye className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                            <p>No views yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {viewers.map((view) => (
                                                <div
                                                    key={view.id}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                                                >
                                                    <Avatar className="h-10 w-10">
                                                        {view.viewer?.image ? (
                                                            <img src={view.viewer.image} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 text-white">
                                                                {view.viewer?.name?.[0] || '?'}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-white">
                                                            {view.viewer?.name || 'Unknown User'}
                                                        </p>
                                                        <p className="text-xs text-white/50">
                                                            {getTimeAgo(view.viewedAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <button
                        onClick={goToPrevStory}
                        className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
                        aria-label="Previous story"
                    />
                    <button
                        onClick={goToNextStory}
                        className="absolute right-0 top-0 bottom-0 w-2/3 z-10"
                        aria-label="Next story"
                    />

                    {/* Side Navigation Arrows (Desktop) */}
                    <button
                        onClick={goToPrevStory}
                        className={cn(
                            "absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors hidden md:block",
                            currentGroupIndex === 0 && currentStoryIndex === 0 && "invisible"
                        )}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={goToNextStory}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors hidden md:block"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
