import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { signOut } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import VideoThumbnailCard from "@/components/video-thumbnail-card"
import HorizontalScrollCarousel from "@/components/horizontal-scroll-carousel"
import UpcomingExams from "@/components/student/upcoming-exams"
import RecentGrades from "@/components/student/recent-grades"

export default async function StudentDashboardPage() {
  const supabase = await createClient()

  // Server-side authentication check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is student (not admin)
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (profile?.is_admin) {
    redirect("/dashboard/admin")
  }

  // Mock content data - replace with actual data fetching
  const currentContent = {
    auth: {
      studentDashboard: {
        title: "Student Dashboard",
        signOut: "Sign Out",
        continueWatching: "Continue Watching",
        noVideosWatched: "No videos watched yet",
        theoreticalContent: "Theoretical Content",
        practicalContent: "Practical Content",
      },
    },
    lectures: [], // Replace with actual lecture data
  }

  const theoreticalVideos = currentContent.lectures.filter((video: any) => video.category === "Theoretical")
  const practicalVideos = currentContent.lectures.filter((video: any) => video.category === "Practical")

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

      <div className="mt-8 space-y-8">
        <UpcomingExams />
        <RecentGrades />
      </div>

      <div className="mt-8 text-center text-lg text-gray-600">
        <p>{currentContent.auth.studentDashboard.noVideosWatched}</p>
      </div>

      <div className="mt-12">
        <HorizontalScrollCarousel title={currentContent.auth.studentDashboard.theoreticalContent} isArabic={false}>
          {theoreticalVideos.map((video: any) => (
            <VideoThumbnailCard key={video.id} video={video} />
          ))}
        </HorizontalScrollCarousel>
      </div>

      <div className="mt-12">
        <HorizontalScrollCarousel title={currentContent.auth.studentDashboard.practicalContent} isArabic={false}>
          {practicalVideos.map((video: any) => (
            <VideoThumbnailCard key={video.id} video={video} />
          ))}
        </HorizontalScrollCarousel>
      </div>
    </div>
  )
}
