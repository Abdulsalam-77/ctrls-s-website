"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-context"
import Image from "next/image"
import Link from "next/link"

export default function HeroSection() {
  const { currentContent } = useLanguage()

  return (
    <section
      id="hero"
      className="relative flex h-[600px] items-center justify-center overflow-hidden bg-gradient-to-r from-blueGradientStart to-blueGradientEnd px-4 py-12 md:h-[700px] lg:h-[800px]"
    >
      <Image
        src="/placeholder.svg?height=800&width=1200"
        width={1200}
        height={800}
        alt={currentContent.hero.imageAlt}
        className="absolute inset-0 h-full w-full object-cover opacity-20"
        priority
      />
      <div className="relative z-10 max-w-3xl text-center text-white">
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
    </section>
  )
}
