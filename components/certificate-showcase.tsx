"use client"

import { useLanguage } from "@/components/language-context"
import Image from "next/image"

export default function CertificateShowcase() {
  const { currentContent } = useLanguage()

  return (
    <section id="certificate" className="relative overflow-hidden bg-white py-16 md:py-24">
      {/* Background Circles */}
      <div className="absolute -left-10 top-1/4 h-20 w-20 rounded-full bg-accentOrange opacity-30 blur-md" />
      <div className="absolute right-10 top-1/2 h-16 w-16 rounded-full bg-accentYellow opacity-30 blur-md" />
      <div className="absolute bottom-10 left-1/3 h-24 w-24 rounded-full bg-accentLightBlue opacity-30 blur-md" />

      {/* Main Content */}
      <div className="container relative z-10 px-4 text-center md:px-6">
        <h2 className="font-montserrat text-4xl font-extrabold text-darkProfessional md:text-5xl">
          {currentContent.certificate.title}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-lightGreyText md:text-xl">
          {currentContent.certificate.mainText}
        </p>

        {/* Certificate Image */}
        <div className="relative mx-auto mt-12 w-full max-w-xl">
          <Image
            src={currentContent.certificate.certificateImage || "/placeholder.svg"}
            width={600}
            height={400}
            alt={currentContent.certificate.imageAlt}
            className="relative z-20 mx-auto h-auto w-full rounded-lg shadow-xl"
          />
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-sm text-gray-600">{currentContent.certificate.bilingualNote}</p>
      </div>
    </section>
  )
}
