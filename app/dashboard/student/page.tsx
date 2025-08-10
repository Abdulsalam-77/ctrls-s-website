"use client"

import { createClient } from "@/lib/supabase/client" // Use client-side Supabase client
import { redirect } from "next/navigation"
import { signOut } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/components/language-context" // Use client-side language context
import VideoThumbnailCard from "@/components/video-thumbnail-card"
import { useEffect, useState } from "react"
import Link from "next/link"
import NextImage from "next/image" // Explicitly import NextImage from next/image
import HorizontalScrollCarousel from "@/components/horizontal-scroll-carousel" // Import the new component

export default function StudentDashboardPage() {
  const { currentContent, language } = useLanguage()
  const isArabic = language === "ar"
  const [lastWatchedVideoId, setLastWatchedVideoId] = useState<string | null>(null)

  // Simulate user authentication check on client-side (for demo purposes)
  // In a real app, you'd likely fetch user session here or rely on server-side checks
  // and pass user data as props from a layout.
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

    // Load last watched video from localStorage
    const storedVideoId = localStorage.getItem("lastWatchedVideoId")
    setLastWatchedVideoId(storedVideoId)
  }, [])

  const theoreticalVideos = currentContent.lectures.filter((video) => video.category === "Theoretical")
  const practicalVideos = currentContent.lectures.filter((video) => video.category === "Practical")
  const lastWatchedVideo = lastWatchedVideoId
    ? currentContent.lectures.find((video) => video.id === lastWatchedVideoId)
    : null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-montserrat text-3xl font-extrabold text-purple">
          {currentContent.auth.studentDashboard.title}
        </h1>
        <form action={signOut}>
          <Button variant="outline" className="bg-red-500 text-white hover:bg-red-600">
            {currentContent.auth.studentDashboard.signOut}
          </Button>
        </form>
      </div>

      {/* Section 1: Continue Watching */}
      {lastWatchedVideo ? (
        <div className="mt-8">
          <h2 className="font-montserrat text-2xl font-bold text-darkProfessional mb-4">
            {currentContent.auth.studentDashboard.continueWatching}
          </h2>
          <Link href={`/dashboard/student/player?id=${lastWatchedVideo.id}`}>
            <Card className="w-full rounded-lg overflow-hidden shadow-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer">
              <CardContent className="p-0 flex flex-col md:flex-row">
                <div className="relative w-full md:w-1/2 aspect-video">
                  <NextImage
                    src={lastWatchedVideo.thumbnailImage || "/placeholder.svg"}
                    alt={lastWatchedVideo.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Progress Bar (Prompt 2) */}
                  {lastWatchedVideo.progress !== undefined && (
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-300">
                      <div className="h-full bg-blue-500" style={{ width: `${lastWatchedVideo.progress}%` }} />
                    </div>
                  )}
                </div>
                <div className="p-4 md:w-1/2 flex flex-col justify-center">
                  <h3 className="font-montserrat text-xl font-bold text-purple">{lastWatchedVideo.title}</h3>
                  <p className="text-gray-700 mt-2 line-clamp-3">{lastWatchedVideo.description}</p>
                  <Button className="mt-4 self-start bg-teal hover:bg-purple">
                    {currentContent.auth.studentDashboard.continueWatching}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      ) : (
        <div className="mt-8 text-center text-lg text-gray-600">
          <p>{currentContent.auth.studentDashboard.noVideosWatched}</p>
        </div>
      )}

      {/* Section 2: Theoretical Content (Prompt 1) */}
      <div className="mt-12">
        <HorizontalScrollCarousel title={currentContent.auth.studentDashboard.theoreticalContent} isArabic={isArabic}>
          {theoreticalVideos.map((video) => (
            <VideoThumbnailCard key={video.id} video={video} />
          ))}
        </HorizontalScrollCarousel>
      </div>

      {/* Section 3: Practical Content (Prompt 1) */}
      <div className="mt-12">
        <HorizontalScrollCarousel title={currentContent.auth.studentDashboard.practicalContent} isArabic={isArabic}>
          {practicalVideos.map((video) => (
            <VideoThumbnailCard key={video.id} video={video} />
          ))}
        </HorizontalScrollCarousel>
      </div>
    </div>
  )
}
