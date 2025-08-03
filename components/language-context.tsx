"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import { content } from "@/lib/content"

type Language = "en" | "ar"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  currentContent: typeof content.en
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const storedLang = localStorage.getItem("ctrls-s-lang") as Language
    if (storedLang && (storedLang === "en" || storedLang === "ar")) {
      setLanguageState(storedLang)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
    localStorage.setItem("ctrls-s-lang", language)
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const currentContent = language === "ar" ? content.ar : content.en

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentContent }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
