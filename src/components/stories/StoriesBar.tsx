"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { StoryRing } from "./StoryRing"
import { StoryViewer } from "./StoryViewer"
import { StoryCreator } from "./StoryCreator"
import { cn } from "@/lib/utils"

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

interface StoriesBarProps {
    currentUserId?: string
    className?: string
}

export function StoriesBar({ currentUserId, className }: StoriesBarProps) {
    const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [viewerOpen, setViewerOpen] = useState(false)
    const [selectedGroupIndex, setSelectedGroupIndex] = useState(0)
    const [creatorOpen, setCreatorOpen] = useState(false)

    const fetchStories = async () => {
        try {
            // Check if online first to avoid unnecessary fetch errors
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
                console.log("Offline, skipping story fetch")
                setLoading(false)
                return
            }

            const res = await fetch("/api/stories", { credentials: 'include' })
            if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data)) {
                    setStoryGroups(data)
                } else {
                    console.error("Stories API returned non-array:", data)
                    setStoryGroups([])
                }
            } else {
                // Silently fail on 500/400 errors, just keep existing stories or empty
                console.warn("API Error fetching stories", res.status)
            }
        } catch (error) {
            // Silently handle network errors to avoid crashing UI with Red Box
            console.error("Network error fetching stories (handled):", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStories()
        // Refresh stories every 15 seconds for real-time updates
        const interval = setInterval(fetchStories, 15000)
        return () => clearInterval(interval)
    }, [])

    const handleStoryClick = (index: number) => {
        setSelectedGroupIndex(index)
        setViewerOpen(true)
    }

    const handleStoryCreated = () => {
        setCreatorOpen(false)
        fetchStories() // Refresh
    }

    // Find if current user has stories
    const ownStoryIndex = storyGroups.findIndex(g => g.user.id === currentUserId)
    const hasOwnStory = ownStoryIndex !== -1

    if (loading) {
        return (
            <div className={cn("flex gap-4 overflow-x-auto py-4 px-2 scrollbar-hide", className)}>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="w-12 h-3 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <>
            <div className={cn("flex gap-4 overflow-x-auto py-4 px-2 scrollbar-hide", className)}>
                {/* Add Story Button */}
                {currentUserId && (
                    <button
                        onClick={() => hasOwnStory ? handleStoryClick(ownStoryIndex) : setCreatorOpen(true)}
                        className="flex flex-col items-center gap-1 focus:outline-none transition-transform hover:scale-105 active:scale-95"
                    >
                        <div className="relative">
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center",
                                hasOwnStory
                                    ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[3px]"
                                    : "border-2 border-dashed border-gray-300 dark:border-gray-600"
                            )}>
                                {hasOwnStory ? (
                                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 p-[2px] flex items-center justify-center">
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                                            {storyGroups[ownStoryIndex]?.user.name?.[0] || "Y"}
                                        </div>
                                    </div>
                                ) : (
                                    <Plus className="h-6 w-6 text-gray-400" />
                                )}
                            </div>
                            {!hasOwnStory && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                                    <Plus className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground truncate w-16 text-center">
                            {hasOwnStory ? "Your Story" : "Add Story"}
                        </span>
                    </button>
                )}

                {/* Other Stories */}
                {storyGroups
                    .filter(g => g.user.id !== currentUserId)
                    .map((group, idx) => {
                        const actualIndex = storyGroups.findIndex(g => g.user.id === group.user.id)
                        return (
                            <StoryRing
                                key={group.user.id}
                                name={group.user.kabadiwalaProfile?.businessName || group.user.name || "User"}
                                image={group.user.image}
                                hasUnviewed={group.hasUnviewed}
                                onClick={() => handleStoryClick(actualIndex)}
                            />
                        )
                    })}
            </div>

            {/* Story Viewer Modal */}
            {viewerOpen && storyGroups.length > 0 && (
                <StoryViewer
                    storyGroups={storyGroups}
                    initialGroupIndex={selectedGroupIndex}
                    currentUserId={currentUserId}
                    onClose={() => {
                        setViewerOpen(false)
                        fetchStories() // Refresh after viewing
                    }}
                />
            )}

            {/* Story Creator Modal */}
            {creatorOpen && (
                <StoryCreator
                    onClose={() => setCreatorOpen(false)}
                    onCreated={handleStoryCreated}
                />
            )}
        </>
    )
}
