"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import LanguageToggle from "@/components/language-toggle"
import { useLanguage } from "@/components/language-context"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { usePathname } from "next/navigation"

export default function Header() {
  const { currentContent } = useLanguage()
  const pathname = usePathname()

  const scrollToId = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-sm" dir="ltr">
      {" "}
      {/* Added dir="ltr" */}
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-montserrat text-2xl font-extrabold text-purple"
          prefetch={false}
        >
          <Image
            src="/pic/ctrl s.png"
            width={468} // Updated width to actual intrinsic dimension
            height={766} // Updated height to actual intrinsic dimension
            alt={currentContent.header.logoAlt}
            className="h-20 w-12" // Tailwind classes for rendered size
          />
          <span>CTRLS-S</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {currentContent.header.navLinks.map((link) => {
            const isHashLink = link.href.startsWith("/#")
            const targetId = isHashLink ? link.href.substring(2) : ""

            return (
              <Link
                key={link.name}
                href={link.href}
                className="text-md font-medium text-purple transition-colors hover:text-teal"
                prefetch={false}
                onClick={(e) => {
                  if (isHashLink && pathname === "/") {
                    e.preventDefault()
                    scrollToId(targetId)
                  }
                }}
              >
                {link.name}
              </Link>
            )
          })}
          <LanguageToggle />
          <Link href="/enroll">
            <Button className="rounded-full bg-teal px-6 py-2 font-bold text-white hover:bg-purple">
              {currentContent.header.cta}
            </Button>
          </Link>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="text-purple bg-transparent">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 p-4">
                {currentContent.header.navLinks.map((link) => {
                  const isHashLink = link.href.startsWith("/#")
                  const targetId = isHashLink ? link.href.substring(2) : ""
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-lg font-medium text-purple hover:text-teal"
                      prefetch={false}
                      onClick={(e) => {
                        if (isHashLink && pathname === "/") {
                          e.preventDefault()
                          scrollToId(targetId)
                        }
                      }}
                    >
                      {link.name}
                    </Link>
                  )
                })}
                <Link href="/enroll">
                  <Button className="mt-4 rounded-full bg-teal px-6 py-2 font-bold text-white hover:bg-purple">
                    {currentContent.header.cta}
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
