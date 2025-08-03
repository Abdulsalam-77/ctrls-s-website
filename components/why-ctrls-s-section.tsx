"use client"

import { useLanguage } from "@/components/language-context"
import { Brain, Users, Laptop, Map, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import Image from "next/image"

const IconMap = {
  Brain: Brain,
  Users: Users,
  Laptop: Laptop,
  Map: Map,
  Heart: Heart,
}

export default function WhyCtrlsSSection() {
  const { currentContent, language } = useLanguage()
  const isArabic = language === "ar"
  const [selectedReasonIndex, setSelectedReasonIndex] = useState(0)

  useEffect(() => {
    setSelectedReasonIndex(0)
  }, [])

  return (
    <section id="why-ctrls-s" className="bg-white py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <h2 className="text-center font-montserrat text-3xl font-extrabold text-purple md:text-4xl">
          {currentContent.whyCtrlsS.title}
        </h2>
        <div className={cn("mt-12 grid gap-8 md:grid-cols-2", isArabic && "md:grid-cols-2-rtl")}>
          {/* Left Column: Image and Detailed Description */}
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-lg bg-gray-100 p-6 shadow-md",
              isArabic && "text-right",
            )}
          >
            <Image
              src={currentContent.whyCtrlsS.points[selectedReasonIndex].image || "/placeholder.svg"}
              width={600}
              height={400}
              alt={currentContent.whyCtrlsS.points[selectedReasonIndex].shortTitle}
              className="mb-6 h-auto w-full rounded-lg object-cover shadow-sm"
            />
            <p className="text-lg text-gray-800">
              {currentContent.whyCtrlsS.points[selectedReasonIndex].detailedDescription}
            </p>
          </div>

          {/* Right Column: Clickable Reasons List */}
          <div className="flex flex-col gap-4">
            {currentContent.whyCtrlsS.points.map((point, index) => {
              const IconComponent = IconMap[point.icon as keyof typeof IconMap]
              const isSelected = index === selectedReasonIndex
              return (
                <div
                  key={index}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-lg p-4 shadow-md transition-all duration-300",
                    isSelected
                      ? "bg-gradient-to-r from-blueGradientStart to-blueGradientEnd text-white"
                      : "bg-gradient-to-br from-teal/10 to-purple/10 text-purple hover:scale-[1.02]",
                    isArabic && "flex-row-reverse text-right",
                  )}
                  onClick={() => setSelectedReasonIndex(index)}
                >
                  {IconComponent && (
                    <IconComponent className={cn("h-8 w-8", isSelected ? "text-white" : "text-teal")} />
                  )}
                  <h3 className={cn("font-montserrat text-lg font-bold", isSelected ? "text-white" : "text-purple")}>
                    {point.shortTitle}
                  </h3>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
