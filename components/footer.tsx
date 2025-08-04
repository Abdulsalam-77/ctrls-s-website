"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-context"
import { Mail, Phone, Facebook, Instagram, MessageCircle } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  const { currentContent } = useLanguage()

  return (
    <footer className="bg-purple py-12 text-white">
      <div className="container grid grid-cols-1 gap-8 px-4 md:grid-cols-3 md:px-6">
        <div className="space-y-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-montserrat text-2xl font-extrabold text-white"
            prefetch={false}
          >
            <Image
              src="C:\Users\Abd Elsalam\OneDrive\Desktop\ctrls-s-website\pic\ctrl s.png"
              width={468} // Updated width to actual intrinsic dimension
              height={766} // Updated height to actual intrinsic dimension
              alt={currentContent.header.logoAlt}
              className="h-12 w-12" // Tailwind classes for rendered size
            />
            <span>CTRLS-S</span>
          </Link>
          <p className="text-sm">{currentContent.footer.copyright}</p>
        </div>
        <div className="space-y-4">
          <h3 className="font-montserrat text-lg font-bold">{currentContent.footer.quickLinks}</h3>
          <nav className="flex flex-col space-y-2">
            {currentContent.header.navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-sm hover:underline" prefetch={false}>
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="space-y-4">
          <h3 className="font-montserrat text-lg font-bold">{currentContent.footer.socialMedia}</h3>
          <div className="flex items-center gap-4">
            <a
              href={`https://wa.me/${currentContent.contact.info.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-teal"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="sr-only">{currentContent.contact.social.whatsapp}</span>
            </a>
            <a href="#" className="text-white hover:text-teal">
              <Facebook className="h-6 w-6" />
              <span className="sr-only">{currentContent.contact.social.facebook}</span>
            </a>
            <a href="#" className="text-white hover:text-teal">
              <Instagram className="h-6 w-6" />
              <span className="sr-only">{currentContent.contact.social.instagram}</span>
            </a>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <a href={`mailto:${currentContent.contact.info.email}`} className="text-sm hover:underline">
                {currentContent.contact.info.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              <a href={`tel:${currentContent.contact.info.phone}`} className="text-sm hover:underline">
                {currentContent.contact.info.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
