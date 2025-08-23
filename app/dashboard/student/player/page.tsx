"use client"

import { useSearchParams, redirect, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/components/language-context"
import type { VideoLecture } from "@/lib/content"
import VideoPlayerComponent from "@/components/video-player-component"
import VideoThumbnailCard from "@/components/video-thumbnail-card"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client" // Use client-side Supabase client
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/auth/actions"
import { ArrowLeft } from "lucide-react"

export default function StudentPlayerPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialVideoId = searchParams.get("id")
  const { currentContent, language } = useLanguage()
  const isArabic = language === "ar"

  const [currentVideo, setCurrentVideo] = useState<VideoLecture | undefined>(undefined)

  // Simulate user authentication check on client-side (for demo purposes)
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        redirect("/auth/login")
      }
      // In a real app, you'd also check is_admin here and redirect if admin
    }
    checkUser()
  }, [])

  useEffect(() => {
    if (initialVideoId) {
      const foundVideo = currentContent.lectures.find((v) => v.id === initialVideoId)
      if (foundVideo) {
        setCurrentVideo(foundVideo)
      } else {
        // If video not found, redirect back to dashboard or show error
        redirect("/dashboard/student")
      }
    } else {
      // If no ID in URL, try to load last watched or redirect
      const lastWatchedId = localStorage.getItem("lastWatchedVideoId")
      if (lastWatchedId) {
        const foundVideo = currentContent.lectures.find((v) => v.id === lastWatchedId)
        if (foundVideo) {
          setCurrentVideo(foundVideo)
        } else {
          redirect("/dashboard/student")
        }
      } else {
        redirect("/dashboard/student")
      }
    }
  }, [initialVideoId, currentContent.lectures]) // Depend on initialVideoId and lectures

  const handleVideoPlay = (videoId: string) => {
    localStorage.setItem("lastWatchedVideoId", videoId)
  }

  if (!currentVideo) {
    return (
      <div className="min-h-[calc(100vh-64px-120px)] flex items-center justify-center text-lg text-gray-600">
        Loading video...
      </div>
    )
  }

  const upNextVideos = currentContent.lectures.filter(
    (video) => video.category === currentVideo?.category && video.id !== currentVideo?.id,
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-purple hover:text-teal"
            aria-label="Go back to dashboard"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="font-montserrat text-3xl font-extrabold text-purple">
            {currentVideo.title} {/* Dynamic title (Prompt 4) */}
          </h1>
        </div>
        <form action={signOut}>
          <Button variant="outline" className="bg-red-500 text-white hover:bg-red-600">
            {currentContent.auth.studentDashboard.signOut}
          </Button>
        </form>
      </div>

      <div
        className={cn(
          "flex flex-col md:flex-row gap-8",
          isArabic ? "md:flex-row-reverse" : "md:flex-row", // RTL support for columns
        )}
      >
        {/* Left Column (Video Player) / Top on Mobile */}
        <div className="w-full md:w-3/4">
          <VideoPlayerComponent video={currentVideo} onVideoPlay={handleVideoPlay} />
          <div className="mt-4">
            <h2 className="font-montserrat text-2xl font-bold text-darkProfessional">{currentVideo.title}</h2>
            <p className="text-gray-700 mt-2">{currentVideo.description}</p>
          </div>
        </div>

        {/* Right Column (Up Next Playlist) / Bottom on Mobile */}
        <div className="w-full md:w-1/4">
          <h3 className="font-montserrat text-xl font-bold text-darkProfessional mb-4">
            {currentContent.auth.studentDashboard.upNext}
          </h3>
          <div className="flex flex-col gap-4">
            {upNextVideos.length > 0 ? (
              upNextVideos.map((video) => (
                <VideoThumbnailCard
                  key={video.id}
                  video={video}
                  isCurrent={video.id === currentVideo.id}
                  onClick={() => setCurrentVideo(video)} // Load video in player
                />
              ))
            ) : (
              <p className="text-gray-600">{currentContent.auth.studentDashboard.noVideosWatched}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
