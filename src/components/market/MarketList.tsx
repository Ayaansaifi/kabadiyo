"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KabadiwalaCard } from "@/components/kabadiwala-card"
import { Search, MapPin, Filter, Star, Navigation } from "lucide-react"

interface MarketListProps {
    initialKabadiwalas: any[]
    favoriteIds: string[]
}

export function MarketList({ initialKabadiwalas, favoriteIds }: MarketListProps) {
    const [kabadiwalas, setKabadiwalas] = useState(initialKabadiwalas)
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("all") // all, verified, top
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [locationLoading, setLocationLoading] = useState(false)
    const [sortBy, setSortBy] = useState("default") // default, distance, rating

    // Filter Logic
    useEffect(() => {
        let result = [...initialKabadiwalas]

        // 1. Search Filter
        if (search) {
            const lowerSearch = search.toLowerCase()
            result = result.filter(k =>
                k.businessName.toLowerCase().includes(lowerSearch) ||
                k.serviceArea?.toLowerCase().includes(lowerSearch) ||
                k.user.name?.toLowerCase().includes(lowerSearch)
            )
        }

        // 2. Category Filter
        if (filter === "verified") {
            result = result.filter(k => k.isVerified)
        } else if (filter === "top") {
            result = result.filter(k => k.rating >= 4.0)
        }

        // 3. Sorting
        if (sortBy === "distance" && location) {
            result.sort((a, b) => {
                const distA = getDistance(location.lat, location.lng, a.user.latitude, a.user.longitude)
                const distB = getDistance(location.lat, location.lng, b.user.latitude, b.user.longitude)
                return distA - distB
            })
        } else if (sortBy === "rating") {
            result.sort((a, b) => b.rating - a.rating)
        }

        setKabadiwalas(result)
    }, [search, filter, sortBy, location, initialKabadiwalas])

    // Get User Location
    const handleNearMe = () => {
        setLocationLoading(true)
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser")
            setLocationLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
                setSortBy("distance")
                setLocationLoading(false)
            },
            () => {
                alert("Unable to retrieve your location")
                setLocationLoading(false)
            }
        )
    }

    // Haversine Distance Helper
    function getDistance(lat1: number, lon1: number, lat2?: number, lon2?: number) {
        if (!lat2 || !lon2) return 99999 // Push to bottom if no location
        const R = 6371 // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1)
        const dLon = deg2rad(lon2 - lon1)
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c // Distance in km
    }

    function deg2rad(deg: number) {
        return deg * (Math.PI / 180)
    }

    return (
        <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl shadow-sm border">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, area, or city..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <Button
                        variant={sortBy === "distance" ? "default" : "outline"}
                        onClick={handleNearMe}
                        disabled={locationLoading}
                        className="whitespace-nowrap gap-2"
                    >
                        {locationLoading ? <span className="animate-spin">⌛</span> : <Navigation className="h-4 w-4" />}
                        Near Me
                    </Button>

                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[140px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sellers</SelectItem>
                            <SelectItem value="verified">Verified Only</SelectItem>
                            <SelectItem value="top">Top Rated (4+)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="rating">Highest Rated</SelectItem>
                            {location && <SelectItem value="distance">Nearest</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <p>Found {kabadiwalas.length} Kabadiwalas</p>
                {location && <p className="text-green-600 flex items-center gap-1"><MapPin className="h-3 w-3" /> Sort by Distance Active</p>}
            </div>

            {/* List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kabadiwalas.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No Kabadiwalas Found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or search area.</p>
                        <Button
                            variant="link"
                            onClick={() => { setSearch(""); setFilter("all"); setSortBy("default") }}
                            className="mt-2"
                        >
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    kabadiwalas.map((profile) => (
                        <div key={profile.id} className="relative group">
                            {sortBy === "distance" && location && (
                                <Badge className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-sm pointer-events-none">
                                    {getDistance(
                                        location.lat, location.lng,
                                        profile.user.latitude, profile.user.longitude
                                    ).toFixed(1)} km away
                                </Badge>
                            )}
                            <KabadiwalaCard
                                profile={profile}
                                isFavorited={favoriteIds.includes(profile.userId)}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
