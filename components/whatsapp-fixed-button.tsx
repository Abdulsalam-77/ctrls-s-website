"use client"

import Link from "next/link"
import { MessageCircle } from 'lucide-react' // Using MessageCircle as a close approximation for the WhatsApp icon
import { useLanguage } from "@/components/language-context"
import { cn } from "@/lib/utils"

export default function WhatsAppFixedButton({ className }: { className?: string }) {
  const { currentContent, language } = useLanguage()
  const whatsappNumber = currentContent.contact.info.whatsappPhone.replace(/\D/g, "") // Remove non-digits
  const isArabic = language === "ar"

  return (
    <Link
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
        isArabic ? "left-4" : "right-4", // Conditional positioning based on language
        className // Apply the passed className here
      )}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" /> {/* Smaller icon */}
      {/* Red notification dot */}
      <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-green-500" />
    </Link>
  )
}
