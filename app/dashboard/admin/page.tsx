import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { signOut } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"

export default async function AdminDashboardPage() {
  const supabase = await createClient() // Await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user.id)
    .single()

  if (profileError || !profile?.is_admin) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-montserrat text-3xl font-extrabold text-purple">
          {/* Using a placeholder for now, will add to content.ts later */}
          Admin Dashboard
        </h1>
        <form action={signOut}>
          <Button variant="outline" className="bg-red-500 text-white hover:bg-red-600">
            Sign Out
          </Button>
        </form>
      </div>

      <div className="mt-8">
        <p className="text-gray-700">This is where admin functionalities will be implemented.</p>
        <ul className="mt-4 list-disc pl-5 text-gray-600">
          <li>Manage Students</li>
          <li>Manage Course Content</li>
          <li>Assign Content to Students</li>
        </ul>
      </div>
    </div>
  )
}
