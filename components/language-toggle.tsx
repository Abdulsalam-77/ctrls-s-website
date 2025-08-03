"use client"

import { useLanguage } from "@/components/language-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export default function LanguageToggle() {
  const { language, setLanguage, currentContent } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-purple hover:text-teal">
          <Globe className="h-5 w-5" />
          <span className="sr-only">{currentContent.common.language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("en")}>{currentContent.common.english}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("ar")}>{currentContent.common.arabic}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
