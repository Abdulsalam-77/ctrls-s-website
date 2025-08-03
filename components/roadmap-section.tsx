"use client"

import { useLanguage } from "@/components/language-context"
import Image from "next/image"
import { Laptop, Palette, Code, Rocket, Flag } from "lucide-react"

const IconMap = {
  Laptop: Laptop,
  Palette: Palette,
  Code: Code,
  Rocket: Rocket,
}

export default function RoadmapSection() {
  const { currentContent } = useLanguage()

  return (
    <section id="roadmap" className="relative overflow-hidden bg-lightBackground py-16 md:py-24">
      <div className="container relative z-10 px-4 md:px-6">
        <h2 className="text-center font-montserrat text-3xl font-extrabold text-darkProfessional md:text-4xl">
          {currentContent.roadmap.title}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-lightGreyText">
          {currentContent.roadmap.description}
        </p>

        {/* Desktop Layout (Horizontal Cards, then Horizontal Timeline) */}
        <div className="hidden flex-col items-center md:flex">
          {/* Course Cards Container for Desktop */}
          <div className="mt-12 flex justify-center gap-8 lg:gap-16">
            {currentContent.roadmap.level1.modules.map((module, index) => {
              const ModuleIcon = IconMap[module.icon as keyof typeof IconMap]
              return (
                <div
                  key={index}
                  className="relative flex h-[280px] w-full max-w-[250px] flex-col items-center justify-between rounded-2xl bg-cardGradient p-4 text-black shadow-lg"
                >
                  <div className="flex w-full justify-between">
                    {/* Top-Left Icon */}
                    {ModuleIcon && <ModuleIcon className="h-6 w-6 text-white" />}
                  </div>
                  {/* Main Illustration */}
                  <Image
                    src={module.illustration || "/placeholder.svg"}
                    width={200}
                    height={100}
                    alt={module.title}
                    className="my-2 h-[100px] w-auto object-contain"
                  />
                  {/* Title */}
                  <h3 className="text-center font-montserrat text-lg font-bold">{module.title}</h3>
                </div>
              )
            })}
          </div>

          {/* Timeline Line and Waypoints for Desktop */}
          <div className="relative mt-12 flex h-20 w-full items-center justify-center">
            {/* Horizontal Line */}
            <div className="absolute left-[10%] right-[10%] top-1/2 h-0.5 -translate-y-1/2 border-b-2 border-dashed border-accentLightBlue" />

            {/* Start Flag */}
            <Flag className="absolute left-[8%] top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-blueGradientEnd" />

            {/* Waypoints and Duration */}
            {currentContent.roadmap.level1.modules.map((module, index) => (
              <div
                key={index}
                className="absolute top-1/2 flex -translate-y-1/2 flex-col items-center"
                style={{ left: `${20 + index * 20}%` }} // Evenly spaced
              >
                {/* Waypoint */}
                <div className="h-4 w-4 rounded-full bg-blueGradientEnd shadow-blue-glow" />
                <p className="mt-2 text-sm text-gray-600">{module.duration}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline (Vertical) */}
        <div className="relative mx-auto mt-12 flex flex-col items-start py-12 md:hidden">
          {/* Vertical Line on the left */}
          <div className="absolute left-4 top-0 h-full w-0.5 border-l-2 border-dashed border-accentLightBlue" />

          {/* Start Flag (Mobile) */}
          <Flag className="absolute left-4 top-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-blueGradientEnd" />

          {currentContent.roadmap.level1.modules.map((module, index) => {
            const ModuleIcon = IconMap[module.icon as keyof typeof IconMap]
            return (
              <div key={index} className="relative flex w-full items-center py-10">
                {/* Waypoint */}
                <div className="absolute left-4 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blueGradientEnd shadow-blue-glow" />
                {/* Small horizontal line connecting waypoint to card */}
                <div className="absolute left-4 top-1/2 h-0.5 w-10 -translate-y-1/2 border-b-2 border-dashed border-accentLightBlue" />

                {/* Course Card */}
                <div className="ml-[calc(4px+10px+2.5rem)] w-full max-w-[250px] rounded-2xl bg-cardGradient p-4 text-black shadow-lg">
                  <div className="flex w-full justify-between">
                    {/* Top-Left Icon */}
                    {ModuleIcon && <ModuleIcon className="h-6 w-6 text-white" />}
                  </div>
                  {/* Main Illustration */}
                  <Image
                    src={module.illustration || "/placeholder.svg"}
                    width={200}
                    height={100}
                    alt={module.title}
                    className="my-2 h-[100px] w-auto object-contain"
                  />
                  {/* Title */}
                  <h3 className="text-center font-montserrat text-lg font-bold">{module.title}</h3>
                  <p className="mt-2 text-center text-sm text-gray-200">{module.duration}</p>
                </div>
              </div>
            )
          })}
          {/* End Flag (Mobile) - positioned at the end of the last module's card */}
          <Flag className="absolute left-4 bottom-0 h-8 w-8 -translate-x-1/2 translate-y-1/2 text-blueGradientEnd" />
        </div>
      </div>
    </section>
  )
}
