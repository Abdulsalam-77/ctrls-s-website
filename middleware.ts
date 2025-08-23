import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  console.log("[v0] Middleware running for:", request.nextUrl.pathname)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase environment variables not found, skipping auth check")
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: "",
          ...options,
        })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({
          name,
          value: "",
          ...options,
        })
      },
    },
  })

  console.log("[v0] Checking user session...")
  try {
    // Refresh session if expired - required for Server Components
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] User found:", !!user)
    if (user) {
      console.log("[v0] User ID:", user.id)
    }

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      console.log("[v0] Dashboard route accessed")

      if (!user) {
        console.log("[v0] No user found, redirecting to login")
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }

      // Check admin access for admin dashboard
      if (request.nextUrl.pathname.startsWith("/dashboard/admin")) {
        console.log("[v0] Admin dashboard accessed, checking admin status...")
        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
        console.log("[v0] Profile data:", profile)

        if (!profile?.is_admin) {
          console.log("[v0] User is not admin, redirecting to student dashboard")
          return NextResponse.redirect(new URL("/dashboard/student", request.url))
        }
        console.log("[v0] Admin access granted")
      }

      // Check student access for student dashboard
      if (request.nextUrl.pathname.startsWith("/dashboard/student")) {
        console.log("[v0] Student dashboard accessed, checking student status...")
        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
        console.log("[v0] Profile data:", profile)

        if (profile?.is_admin) {
          console.log("[v0] User is admin, redirecting to admin dashboard")
          return NextResponse.redirect(new URL("/dashboard/admin", request.url))
        }
        console.log("[v0] Student access granted")
      }
    }

    // Redirect authenticated users away from auth pages
    if (request.nextUrl.pathname.startsWith("/auth") && user) {
      console.log("[v0] Authenticated user accessing auth page, redirecting...")
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

      if (profile?.is_admin) {
        console.log("[v0] Redirecting admin to admin dashboard")
        return NextResponse.redirect(new URL("/dashboard/admin", request.url))
      } else {
        console.log("[v0] Redirecting student to student dashboard")
        return NextResponse.redirect(new URL("/dashboard/student", request.url))
      }
    }
  } catch (error) {
    console.log("[v0] Supabase error in middleware:", error)
    return NextResponse.next()
  }

  console.log("[v0] Middleware completed, allowing request")
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
