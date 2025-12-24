"use client"

import { FavoriteButton } from "@/components/favorites"

interface FavoriteButtonWrapperProps {
    kabadiwalaId: string
    initialFavorited: boolean
}

export function FavoriteButtonWrapper({ kabadiwalaId, initialFavorited }: FavoriteButtonWrapperProps) {
    return (
        <FavoriteButton
            kabadiwalaId={kabadiwalaId}
            isFavorited={initialFavorited}
        />
    )
}
