"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { VideoLecture } from "@/lib/content" // Import the type

interface VideoThumbnailCardProps {
  video: VideoLecture
  isCurrent?: boolean
  onClick?: (videoId: string) => void // Optional click handler for player page playlist
}

export default function VideoThumbnailCard({ video, isCurrent = false, onClick }: VideoThumbnailCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(video.id)
    }
  }

  const cardContent = (
    <Card
      className={cn(
        "h-full flex flex-col",
        isCurrent && "bg-blue-50", // Light blue background for active state
      )}
    >
      <CardContent className="p-0">
        <div className="relative w-full aspect-video">
          <Image
            src={video.thumbnailImage || "/placeholder.svg"}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <h3 className={cn("font-montserrat text-lg truncate", isCurrent && "font-bold")}>{video.title}</h3>
          <p className="text-sm text-lightGreyText line-clamp-2 mt-1">{video.description}</p>
        </div>
      </CardContent>
    </Card>
  )

  if (onClick) {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "flex-shrink-0 w-64 md:w-72 lg:w-80 rounded-lg overflow-hidden shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer",
          "bg-white text-darkProfessional", // Default card background and text
          isCurrent && "border-2 border-teal shadow-blue-glow", // Keep border for stronger highlight
          "block w-full text-left", // Ensure button takes full width in playlist
        )}
      >
        {cardContent}
      </button>
    )
  } else {
    return (
      <Link
        href={`/dashboard/student/player?id=${video.id}`}
        className={cn(
          "flex-shrink-0 w-64 md:w-72 lg:w-80 rounded-lg overflow-hidden shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer",
          "bg-white text-darkProfessional", // Default card background and text
          isCurrent && "border-2 border-teal shadow-blue-glow", // Keep border for stronger highlight
        )}
      >
        {cardContent}
      </Link>
    )
  }
}
