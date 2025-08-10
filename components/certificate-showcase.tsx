"use client"

import { useLanguage } from "@/components/language-context"
import Image from "next/image"

export default function CertificateShowcase() {
  const { currentContent } = useLanguage()

  return (
    <section id="certificate" className="relative overflow-hidden py-16 md:py-24  bg-white">
      {/* Main Content */}
      <div className="container relative z-10 px-4 text-center md:px-6">
        <h2 className="font-inter text-4xl font-extrabold text-primary-purple md:text-5xl lg:text-[48px]">
          {currentContent.certificate.title}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base font-normal text-neutral-grey leading-relaxed">
          {currentContent.certificate.mainText}
        </p>

        {/* Certificate Image */}
        <div className="relative mx-auto mt-12 w-full max-w-xl">
          <Image
            src="/Certificate.png"
            width={600}
            height={400}
            alt={currentContent.certificate.imageAlt}
            className="relative z-20 mx-auto h-auto w-full rounded-lg shadow-xl"
          />
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-sm font-normal text-neutral-grey leading-relaxed">
          {currentContent.certificate.bilingualNote}
        </p>
      </div>
    </section>
  )
}
