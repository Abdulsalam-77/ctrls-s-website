"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-context";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Brain, MessageCircle, Wrench } from "lucide-react";
import React from "react";

// Map icon names to components
const IconMap = {
  Brain: Brain,
  MessageCircle: MessageCircle,
  Wrench: Wrench,
};

export default function HeroSection() {
  const { currentContent, language } = useLanguage();
  const isArabic = language === "ar";

  // Helper function for smooth scrolling
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className={cn(
        "relative flex items-center justify-center overflow-hidden px-4 py-12 md:py-0",
        "min-h-[calc(100vh-64px)]"
      )}
    >
      <div
        className={cn(
          "container relative z-10 flex flex-col items-center gap-8 md:gap-16",
          isArabic ? "md:flex-row-reverse" : "md:flex-row",
          "h-full w-full"
        )}
      >
        {/* Text Content Column */}
        <div
          className={cn(
            "flex w-full flex-col text-black md:w-1/2", // Text color set to black
            "order-last",
            "items-center text-center", // Default for mobile (centered)
            isArabic
              ? "md:order-2 md:items-end md:text-right"
              : "md:order-1 md:items-start md:text-left" // Keep existing alignment for headline/bullets
          )}
        >
          <h1 className="font-inter text-[36px] font-extrabold leading-tight text-primary-purple md:text-[48px]">
            {currentContent.hero.headline}
          </h1>
          <ul className="mt-4 space-y-3 text-lg md:text-xl">
            {currentContent.hero.subtext.map((point, index) => {
              const IconComponent = IconMap[point.icon as keyof typeof IconMap];
              return (
                <li
                  key={index}
                  className={cn(
                    "flex items-start md:items-center gap-3" // vertical: top on mobile, center on desktop
                  )}
                >
                  {IconComponent && (
                    <IconComponent className="h-6 w-6 text-accent-teal flex-shrink-0 mt-[8px] md:mt-0" />
                  )}
                  <span className="text-neutral-grey">
                    {point.text.split(point.highlight).map((part, i) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < point.text.split(point.highlight).length - 1 && (
                          <span className="text-accent-teal font-bold">
                            {point.highlight}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>

          <Link
            href="/#roadmap" // Changed href to target roadmap section
            className={cn(
              "mt-8 block",
              isArabic ? "md:self-start" : "md:self-start"
            )} // UPDATED: Use self-start for left alignment
            onClick={(e) => {
              e.preventDefault(); // Prevent default link behavior
              scrollToSection("roadmap"); // Call smooth scroll function
            }}
          >
            <Button className="rounded-full bg-accent-teal px-8 py-3 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary-purple">
              {currentContent.hero.cta}
            </Button>
          </Link>
        </div>

        {/* Image Column */}
        <div
          className={cn(
            "relative flex w-full items-center justify-center md:w-1/2 md:h-full",
            "order-first",
            isArabic ? "md:order-1" : "md:order-2"
          )}
        >
          <Image
            src="/hero-section.png"
            width={468}
            height={766}
            alt={currentContent.hero.imageAlt}
            className="h-auto w-full max-h-[400px] object-contain md:max-h-full"
            priority
          />
        </div>
      </div>
    </section>
  );
}
