"use client"

import { useLanguage } from "@/components/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Mail, Phone, Facebook, Instagram, MessageCircle } from "lucide-react"

export default function ContactForm() {
  const { currentContent, language } = useLanguage()
  const isArabic = language === "ar"

  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <h2 className="text-center font-inter text-3xl font-extrabold text-primary-purple md:text-4xl lg:text-[48px]">
          {currentContent.contact.title}
        </h2>
        <p className="mt-4 text-center text-base font-normal text-neutral-grey leading-relaxed">
          {currentContent.contact.description}
        </p>
        <div className="mx-auto mt-12 max-w-2xl rounded-lg bg-white p-8 shadow-lg">
          <form className="space-y-6">
            <div className={cn("grid gap-2", isArabic && "text-right")}>
              <Label htmlFor="name" className="text-neutral-dark">
                {currentContent.contact.form.name}
              </Label>
              <Input
                id="name"
                placeholder={currentContent.contact.form.name}
                className="rounded-md border-gray-300 focus:border-teal focus:ring-teal"
              />
            </div>
            <div className={cn("grid gap-2", isArabic && "text-right")}>
              <Label htmlFor="email" className="text-neutral-dark">
                {currentContent.contact.form.email}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={currentContent.contact.form.email}
                className="rounded-md border-gray-300 focus:border-teal focus:ring-teal"
              />
            </div>
            <div className={cn("grid gap-2", isArabic && "text-right")}>
              <Label htmlFor="message" className="text-neutral-dark">
                {currentContent.contact.form.message}
              </Label>
              <Textarea
                id="message"
                placeholder={currentContent.contact.form.message}
                rows={5}
                className="rounded-md border-gray-300 focus:border-teal focus:ring-teal"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-full bg-accent-teal px-6 py-3 font-bold text-white hover:bg-primary-purple"
            >
              {currentContent.contact.form.submit}
            </Button>
          </form>
          <div className={cn("mt-8 space-y-4 text-center", isArabic && "text-right")}>
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <Mail className="h-5 w-5 text-primary-purple" />
              <a href={`mailto:${currentContent.contact.info.email}`} className="text-neutral-grey hover:underline">
                {currentContent.contact.info.email}
              </a>
            </div>
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <Phone className="h-5 w-5 text-primary-purple" />
              <a href={`tel:${currentContent.contact.info.phone}`} className="text-neutral-grey hover:underline">
                {currentContent.contact.info.phone}
              </a>
            </div>
            <div className="flex items-center justify-center gap-4 md:justify-start">
              <a
                href={`https://wa.me/${currentContent.contact.info.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-purple hover:text-accent-teal"
              >
                <MessageCircle className="h-6 w-6" />
                <span className="sr-only">{currentContent.contact.social.whatsapp}</span>
              </a>
              <a href="#" className="text-primary-purple hover:text-accent-teal">
                <Facebook className="h-6 w-6" />
                <span className="sr-only">{currentContent.contact.social.facebook}</span>
              </a>
              <a href="#" className="text-primary-purple hover:text-accent-teal">
                <Instagram className="h-6 w-6" />
                <span className="sr-only">{currentContent.contact.social.instagram}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
