"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-context"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function HeroSection() {
  const { currentContent, language } = useLanguage()
  const isArabic = language === "ar"

  return (
    <section
      id="hero"
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-r from-blueGradientStart to-blueGradientEnd px-4 py-12 md:py-0",
        "min-h-[calc(100vh-64px)]", // Ensures the section takes up most of the viewport height
      )}
    >
      <div
        className={cn(
          "container relative z-10 flex flex-col items-center gap-8 md:gap-16", // Base flex for mobile (column) and desktop (row)
          isArabic ? "md:flex-row-reverse" : "md:flex-row", // Controls overall row direction for LTR/RTL
          "h-full w-full", // Ensure container takes full height and width
        )}
      >
        {/* Text Content Column */}
        <div
          className={cn(
            "flex w-full flex-col text-white md:w-1/2", // Base styles for text column
            "order-last", // Mobile: text is second (bottom)
            isArabic
              ? "md:order-2 md:items-end md:text-right" // Desktop Arabic: text is right column, aligned right
              : "md:order-1 md:items-start md:text-left", // Desktop English: text is left column, aligned left
          )}
        >
          <h1 className="font-montserrat text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
            {currentContent.hero.headline}
          </h1>
          <p className="mt-4 text-lg md:text-xl">{currentContent.hero.subtext}</p>
          <Link href="/why-ctrls-s">
            <Button className="mt-8 rounded-full bg-teal px-8 py-3 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-purple">
              {currentContent.hero.cta}
            </Button>
          </Link>
        </div>

        {/* Image Column */}
        <div
          className={cn(
            "relative flex w-full items-center justify-center md:w-1/2 md:h-full", // Base styles for image column
            "order-first", // Mobile: image is first (top)
            isArabic ? "md:order-1" : "md:order-2", // Desktop Arabic: image is left column; Desktop English: image is right column
          )}
        >
          <Image
            src="/placeholder.svg?height=766&width=468" // Generic placeholder image
            width={468} // Intrinsic width for Next.js optimization
            height={766} // Intrinsic height for Next.js optimization
            alt={currentContent.hero.imageAlt}
            className="h-auto w-full max-h-[400px] object-contain md:max-h-full" // Image scaling and fit
            priority
          />
        </div>
      </div>
    </section>
  )
}
