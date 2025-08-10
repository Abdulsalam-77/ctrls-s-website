"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"

export default function HomeCtaSection() {
  const { currentContent } = useLanguage()

  return (
    <section id="cta" className="bg-gradient-to-r from-blueGradientStart to-blueGradientEnd py-16 text-center">
      <h2 className="font-inter text-3xl font-extrabold text-primary-purple md:text-4xl lg:text-[48px]">
        {currentContent.homeCta.headline}
      </h2>
      <p className="mt-4 text-base font-normal text-neutral-grey leading-relaxed">{currentContent.homeCta.subtext}</p>
      <Link href="/enroll">
        {" "}
        {/* UPDATED: Changed href to /enroll */}
        <Button className="mt-8 rounded-full bg-accent-teal px-8 py-3 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary-purple">
          {currentContent.header.cta}
        </Button>
      </Link>
    </section>
  )
}
