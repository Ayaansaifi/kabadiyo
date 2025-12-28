"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { useIsNativePlatform } from "@/hooks/useNativePlatform"

export function AppVideo() {
    const { isNative, isLoading } = useIsNativePlatform()
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const videoRef = useRef<HTMLVideoElement>(null)

    if (isLoading || !isNative) return null

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full mb-8 rounded-2xl overflow-hidden shadow-xl relative group bg-black aspect-video"
        >
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                loop
                playsInline
                muted={isMuted}
                poster="/images/video-thumb.png"
                onClick={togglePlay}
            >
                <source src="/videos/promo.mp4" type="video/mp4" />
                {/* Fallback if user hasn't uploaded video yet */}
                Your browser does not support the video tag.
            </video>

            {/* Controls Overlay */}
            <div className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                <button
                    onClick={togglePlay}
                    className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 hover:scale-110 transition-transform"
                >
                    {isPlaying ? (
                        <Pause className="h-8 w-8 text-white fill-white" />
                    ) : (
                        <Play className="h-8 w-8 text-white fill-white translate-x-1" />
                    )}
                </button>
            </div>

            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={toggleMute}
                    className="p-2 bg-black/40 rounded-full text-white backdrop-blur-sm"
                >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
            </div>

            <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                Watch Now
            </div>
        </motion.div>
    )
}
