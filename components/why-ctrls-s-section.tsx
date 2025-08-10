"use client"

import { useLanguage } from "@/components/language-context"
import { Brain, Users, Laptop, Heart, Palette, Code, Rocket, Map } from "lucide-react" // Added Map as it was missing from previous imports
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const IconMap = {
  Brain: Brain,
  Users: Users,
  Laptop: Laptop,
  Palette: Palette,
  Code: Code,
  Rocket: Rocket,
  Map: Map, // Ensure Map is included in the map
  Heart: Heart,
}

export default function WhyCtrlsSSection() {
  const { currentContent, language } = useLanguage()
  const isArabic = language === "ar"

  // State for desktop/tablet active tab
  const [activeReasonIndex, setActiveReasonIndex] = useState(0)

  // State for mobile carousel
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Determine if it's a mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Auto-play for mobile carousel
  useEffect(() => {
    if (isMobile) {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % currentContent.whyCtrlsS.points.length)
      }, 6000) // Change slide every 6 seconds
      return () => clearInterval(interval)
    }
  }, [isMobile, currentContent.whyCtrlsS.points.length])

  return (
    <section id="why-ctrls-s" className="bg-white py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <h2 className="text-center font-montserrat text-3xl font-extrabold text-purple md:text-4xl">
          {currentContent.whyCtrlsS.title}
        </h2>

        {/* Desktop & Tablet Layout (>= 768px) */}
        <div
          className={cn(
            "hidden md:flex mt-12 gap-8 items-center", // Flex container for two columns
            "min-h-[500px]", // Minimum height to ensure content fits without scrolling
            isArabic ? "md:flex-row-reverse" : "md:flex-row", // Explicit flex-direction for desktop LTR/RTL
          )}
        >
          {/* Reasons Column (Left for LTR, Right for RTL) */}
          <div
            className={cn(
              "flex flex-col gap-4 md:w-2/5",
              isArabic ? "text-right" : "text-left", // Text alignment based on language
            )}
          >
            {currentContent.whyCtrlsS.points.map((point, index) => {
              const IconComponent = IconMap[point.icon as keyof typeof IconMap]
              const isActive = index === activeReasonIndex
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg shadow-md transition-all duration-300 h-auto",
                    isActive
                      ? "bg-gradient-to-r from-blueGradientStart to-blueGradientEnd text-white"
                      : "bg-gradient-to-br from-teal/10 to-purple/10 text-purple hover:scale-[1.02]",
                    isArabic ? "flex-row-reverse justify-end" : "justify-start", // Reverse icon and text for Arabic, justify to end
                  )}
                  onClick={() => setActiveReasonIndex(index)}
                >
                  {IconComponent && <IconComponent className={cn("h-8 w-8", isActive ? "text-white" : "text-teal")} />}
                  <h3 className={cn("font-montserrat text-lg font-bold", isActive ? "text-white" : "text-purple")}>
                    {point.shortTitle}
                  </h3>
                </Button>
              )
            })}
          </div>

          {/* Feature Image Column (Right for LTR, Left for RTL) */}
          <div
            className={cn(
              "relative flex items-center justify-center md:w-3/5 h-full",
              // No order classes needed here, parent flex-direction handles it
            )}
          >
            <Image
              src={currentContent.whyCtrlsS.points[activeReasonIndex].mainFeatureImage || "/placeholder.svg"}
              width={600} // Example intrinsic width
              height={400} // Example intrinsic height
              alt={currentContent.whyCtrlsS.points[activeReasonIndex].shortTitle}
              className="w-full h-auto object-contain max-h-[500px] rounded-lg shadow-lg" // Scale and fit
            />
          </div>
        </div>

        {/* Mobile Layout (< 768px) - Carousel */}
        <div className="md:hidden mt-12 flex flex-col items-center">
          {/* Carousel Slide */}
          <div className="w-full flex flex-col items-center text-center">
            <Image
              src={currentContent.whyCtrlsS.points[currentSlideIndex].mainFeatureImage || "/placeholder.svg"}
              width={600} // Example intrinsic width
              height={400} // Example intrinsic height
              alt={currentContent.whyCtrlsS.points[currentSlideIndex].shortTitle}
              className="w-full h-auto object-contain max-h-[300px] rounded-lg shadow-lg mb-6" // Scale and fit
            />
            <h3 className="font-montserrat text-2xl font-bold text-purple mb-2">
              {currentContent.whyCtrlsS.points[currentSlideIndex].shortTitle}
            </h3>
            <p className="text-gray-700 text-base px-4">
              {currentContent.whyCtrlsS.points[currentSlideIndex].description}
            </p>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {currentContent.whyCtrlsS.points.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-3 w-3 rounded-full transition-colors duration-300",
                  index === currentSlideIndex ? "bg-blueGradientEnd" : "bg-gray-300",
                )}
                onClick={() => setCurrentSlideIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
