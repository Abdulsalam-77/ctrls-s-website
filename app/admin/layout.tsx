import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signOutAdmin } from "@/app/dashboard/admin/actions"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Server-side authentication check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile, error } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (error || !profile?.is_admin) {
    redirect("/dashboard/student")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="font-montserrat text-xl font-bold text-primary-purple">Admin Panel</h1>
              <div className="flex space-x-6">
                <Link
                  href="/admin/dashboard"
                  className="text-gray-700 hover:text-primary-purple font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/content-management"
                  className="text-gray-700 hover:text-primary-purple font-medium transition-colors"
                >
                  Content Management
                </Link>
                <Link
                  href="/admin/exam-management"
                  className="text-gray-700 hover:text-primary-purple font-medium transition-colors"
                >
                  Exam Management
                </Link>
                <Link
                  href="/admin/student-management"
                  className="text-gray-700 hover:text-primary-purple font-medium transition-colors"
                >
                  Student Management
                </Link>
              </div>
            </div>
            <form action={signOutAdmin}>
              <Button variant="outline" className="bg-red-500 text-white hover:bg-red-600 font-medium">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
