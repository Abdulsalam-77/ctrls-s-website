"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import LanguageToggle from "@/components/language-toggle"
import { useLanguage } from "@/components/language-context"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"

export default function Header({ className }: { className?: string }) {
  const { currentContent, language } = useLanguage()
  const isArabic = language === "ar"
  const pathname = usePathname()

  const scrollToId = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Control Sheet open state
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Handler for nav link clicks inside Sheet
  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isHashLink = href.startsWith("/#")
    const targetId = isHashLink ? href.substring(2) : ""

    if (isHashLink && pathname === "/") {
      e.preventDefault()
      scrollToId(targetId)
    }

    // Close the sheet after clicking any link
    setIsSheetOpen(false)
  }

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-white", className)}>
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 font-inter text-2xl font-extrabold text-primary-purple flex-shrink-0",
            isArabic && "flex-row-reverse"
          )}
          prefetch={false}
        >
          <Image
            src="/pic/ctrl s.png"
            width={468}
            height={766}
            alt={currentContent.header.logoAlt}
            className="h-12 w-auto object-contain"
          />
          <span
            className="whitespace-nowrap text-primary-purple"
            style={{ position: "relative", top: "5px" }}
          >
            CTRLS-S
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {currentContent.header.navLinks.map((link) => {
            const isHashLink = link.href.startsWith("/#")
            const targetId = isHashLink ? link.href.substring(2) : ""

            return (
              <Link
                key={link.name}
                href={link.href}
                className="text-base font-medium text-primary-purple transition-colors hover:text-accent-teal whitespace-nowrap"
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
            <Button className="rounded-full bg-accent-teal px-6 py-2 font-bold text-white hover:bg-primary-purple">
              {currentContent.header.cta}
            </Button>
          </Link>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="text-primary-purple bg-transparent">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 p-4">
                {currentContent.header.navLinks.map((link) => {
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-base font-medium text-primary-purple hover:text-accent-teal"
                      prefetch={false}
                      onClick={(e) => handleNavLinkClick(e, link.href)}
                    >
                      {link.name}
                    </Link>
                  )
                })}
                <Link href="/enroll">
                  <Button
                    className="mt-4 rounded-full bg-accent-teal px-6 py-2 font-bold text-white hover:bg-primary-purple"
                    onClick={() => setIsSheetOpen(false)} // Close on CTA click
                  >
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
