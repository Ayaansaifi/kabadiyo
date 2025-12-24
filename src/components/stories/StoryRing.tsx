"use client"

import { cn } from "@/lib/utils"

interface StoryRingProps {
    name: string
    image?: string | null
    hasUnviewed: boolean
    isOwnStory?: boolean
    onClick?: () => void
    size?: "sm" | "md" | "lg"
}

const sizeClasses = {
    sm: {
        ring: "w-14 h-14",
        avatar: "w-12 h-12",
        text: "text-[10px] w-14"
    },
    md: {
        ring: "w-18 h-18",
        avatar: "w-16 h-16",
        text: "text-xs w-18"
    },
    lg: {
        ring: "w-22 h-22",
        avatar: "w-20 h-20",
        text: "text-sm w-22"
    }
}

export function StoryRing({
    name,
    image,
    hasUnviewed,
    isOwnStory = false,
    onClick,
    size = "md"
}: StoryRingProps) {
    const sizes = sizeClasses[size]

    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-1 focus:outline-none transition-transform hover:scale-105 active:scale-95"
        >
            {/* Gradient Ring */}
            <div
                className={cn(
                    sizes.ring,
                    "rounded-full p-[3px] flex items-center justify-center",
                    hasUnviewed
                        ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                        : "bg-gray-300 dark:bg-gray-600"
                )}
            >
                {/* White/Dark inner ring */}
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 p-[2px] flex items-center justify-center">
                    {/* Avatar */}
                    <div
                        className={cn(
                            sizes.avatar,
                            "rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold overflow-hidden"
                        )}
                    >
                        {image ? (
                            <img
                                src={image}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // Hide broken image and show fallback
                                    e.currentTarget.style.display = 'none'
                                }}
                            />
                        ) : null}
                        {/* Always show fallback initial behind image */}
                        <span className="text-lg absolute">{name?.[0]?.toUpperCase() || "?"}</span>
                    </div>
                </div>
            </div>

            {/* Name */}
            <span
                className={cn(
                    sizes.text,
                    "truncate text-center text-muted-foreground",
                    isOwnStory && "font-medium"
                )}
            >
                {isOwnStory ? "Your Story" : name?.split(" ")[0] || "User"}
            </span>
        </button>
    )
}
