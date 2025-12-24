import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StoryActions } from "./story-actions" // Client component
import { formatDistanceToNow } from "date-fns"

async function getStories() {
    return await db.story.findMany({
        where: {
            isActive: true,
            expiresAt: { gt: new Date() } // Only active stories
        },
        include: {
            user: {
                select: { name: true, image: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export default async function StoriesPage() {
    const stories = await getStories()

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Story Moderation</h2>

            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                {stories.map((story) => (
                    <Card key={story.id} className="overflow-hidden">
                        <div className="relative aspect-[9/16] bg-black">
                            {story.mediaType === "IMAGE" && story.mediaUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={story.mediaUrl}
                                    alt="Story"
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center p-4 text-center"
                                    style={{ backgroundColor: story.bgColor || "#000" }}
                                >
                                    <p className="text-white font-medium">{story.text}</p>
                                </div>
                            )}

                            <div className="absolute top-2 left-2 flex items-center gap-2">
                                <Avatar className="h-8 w-8 border-2 border-white">
                                    <AvatarImage src={story.user.image || ""} />
                                    <AvatarFallback>{story.user.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="bg-black/50 px-2 py-1 rounded text-xs text-white">
                                    {story.user.name}
                                </div>
                            </div>

                            <div className="absolute bottom-2 right-2">
                                <StoryActions storyId={story.id} />
                            </div>
                        </div>
                        <CardContent className="p-3 text-xs text-muted-foreground flex justify-between">
                            <span>{formatDistanceToNow(story.createdAt)} ago</span>
                            <Badge variant="outline">Expires {formatDistanceToNow(story.expiresAt)}</Badge>
                        </CardContent>
                    </Card>
                ))}

                {stories.length === 0 && (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No active stories
                    </div>
                )}
            </div>
        </div>
    )
}
