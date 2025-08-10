"use client"

import type * as React from "react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface HorizontalScrollCarouselProps {
  children: React.ReactNode
  title: string
  isArabic?: boolean
}

export default function HorizontalScrollCarousel({ children, title, isArabic }: HorizontalScrollCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75 // Scroll by 75% of visible width
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="relative group">
      <h2 className="font-inter text-2xl font-bold text-primary-purple md:text-3xl lg:text-[36px] mb-4">{title}</h2>
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-4 overflow-x-auto pb-4 scrollbar-hide", // scrollbar-hide is a custom utility class
          "relative", // Needed for absolute positioning of buttons
          isArabic && "flex-row-reverse", // Reverse order for RTL
        )}
      >
        {children}
      </div>

      {/* Left Arrow Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll("left")}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full shadow-md z-10",
          "hidden group-hover:flex items-center justify-center", // Show on group hover
          "left-0 ml-2", // Position on left
          "h-10 w-10", // Size
        )}
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-6 w-6 text-purple" />
      </Button>

      {/* Right Arrow Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll("right")}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full shadow-md z-10",
          "hidden group-hover:flex items-center justify-center", // Show on group hover
          "right-0 mr-2", // Position on right
          "h-10 w-10", // Size
        )}
        aria-label="Scroll right"
      >
        <ChevronRight className="h-6 w-6 text-purple" />
      </Button>
    </div>
  )
}
