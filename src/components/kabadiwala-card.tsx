import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, MapPin, MessageCircle, Phone, Star } from "lucide-react"
import Link from "next/link"
import { FavoriteButtonWrapper } from "@/app/market/FavoriteButtonWrapper"

interface KabadiwalaProfileProps {
    profile: {
        id: string
        userId: string
        businessName: string
        coverImage: string | null
        isVerified: boolean
        serviceArea: string | null
        rating: number
        bio: string | null
        rates: string | null
        totalReviews: number
        totalPickups: number
        user: {
            phone: string
            image: string | null
        }
    }
    isFavorited: boolean
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QuickChatSheet } from "@/components/chat/QuickChatSheet"

export function KabadiwalaCard({ profile, isFavorited }: KabadiwalaProfileProps) {
    // Parse rates safely
    const parseRates = (ratesStr: string | null) => {
        if (!ratesStr) return null
        try {
            return JSON.parse(ratesStr) as Record<string, number>
        } catch {
            return null
        }
    }

    const rates = parseRates(profile.rates)

    return (
        <Card className="flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
            {profile.coverImage && (
                <div className="h-32 w-full bg-muted relative">
                    <img
                        src={profile.coverImage}
                        alt={profile.businessName}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <CardHeader className="pb-3 relative">
                {profile.coverImage && <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-background/0 to-background/0" />}

                <div className="flex justify-between items-start">
                    <div className="flex-1 flex gap-3">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                            <AvatarImage src={profile.user.image || undefined} />
                            <AvatarFallback>{profile.businessName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-xl">{profile.businessName}</CardTitle>
                                {profile.isVerified && (
                                    <Badge variant="secondary" className="gap-1 text-xs px-1.5 h-5">
                                        <CheckCircle className="h-3 w-3 text-blue-500" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" /> {profile.serviceArea || "Local"}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="flex items-center">
                                <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                                {profile.rating.toFixed(1)}
                            </Badge>
                            <FavoriteButtonWrapper
                                kabadiwalaId={profile.userId}
                                initialFavorited={isFavorited}
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                {profile.bio && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {profile.bio}
                    </p>
                )}

                {/* Rates */}
                {rates && (
                    <div className="mb-3">
                        <p className="text-sm font-medium mb-2">Rates (₹/kg)</p>
                        <div className="flex flex-wrap gap-1">
                            {Object.entries(rates).slice(0, 4).map(([material, price]) => (
                                <Badge key={material} variant="outline" className="text-xs capitalize">
                                    {material}: ₹{price}
                                </Badge>
                            ))}
                            {Object.keys(rates).length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                    +{Object.keys(rates).length - 4} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{profile.totalReviews} Reviews</Badge>
                    <Badge variant="outline">{profile.totalPickups} Pickups</Badge>
                </div>
            </CardContent>
            <CardFooter className="flex gap-3 pt-0">
                <QuickChatSheet
                    otherUserId={profile.userId}
                    businessName={profile.businessName}
                    userName={profile.user.phone} // Fallback name
                    userImage={profile.user.image}
                    isVerified={profile.isVerified}
                    trigger={
                        <Button variant="outline" className="flex-1 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all group">
                            <MessageCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                            Quick Chat
                        </Button>
                    }
                />

                <Link href={`/book/${profile.userId}`} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-700 shadow-lg shadow-green-500/20 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative flex items-center justify-center gap-2">
                            Book Pickup
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                        </span>
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
