"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"

export default function HomeCtaSection() {
  const { currentContent } = useLanguage()

  return (
    <section id="cta" className="bg-gradient-to-r from-blueGradientStart to-blueGradientEnd py-16 text-center">
      <h2 className="font-montserrat text-3xl font-extrabold text-white md:text-4xl">
        {currentContent.homeCta.headline}
      </h2>
      <p className="mt-4 text-lg text-white">{currentContent.homeCta.subtext}</p>
      <Link href="/contact">
        <Button className="mt-8 rounded-full bg-teal px-8 py-3 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-purple">
          {currentContent.header.cta}
        </Button>
      </Link>
    </section>
  )
}
