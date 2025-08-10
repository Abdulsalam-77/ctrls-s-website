"use client"

import { useEffect, useRef } from "react"
import type { VideoLecture } from "@/lib/content" // Import the type

interface VideoPlayerComponentProps {
  video: VideoLecture
  onVideoPlay?: (videoId: string) => void // Callback when video starts playing
}

export default function VideoPlayerComponent({ video, onVideoPlay }: VideoPlayerComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // When video changes, load and play it
    if (videoRef.current) {
      videoRef.current.load() // Reload the video source
      videoRef.current.play().catch((e) => console.error("Error playing video:", e)) // Attempt to play
      if (onVideoPlay) {
        onVideoPlay(video.id)
      }
    }
  }, [video.id, onVideoPlay])

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
      <video
        ref={videoRef}
        key={video.videoSourceUrl} // Key change forces re-render and source update
        controls
        autoPlay
        className="w-full h-full object-contain" // Use object-contain to prevent cropping
        poster={video.thumbnailImage} // Use thumbnail as poster
      >
        <source src={video.videoSourceUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
