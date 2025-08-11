"use client";

import { useLanguage } from "@/components/language-context";
import {
  Brain,
  Users,
  Laptop,
  Heart,
  Palette,
  Code,
  Rocket,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const IconMap = {
  Brain: Brain,
  Users: Users,
  Laptop: Laptop,
  Palette: Palette,
  Code: Code,
  Rocket: Rocket,
  Map: Map,
  Heart: Heart,
};

export default function WhyCtrlsSSection() {
  const { currentContent, language } = useLanguage();
  const isArabic = language === "ar";

  const [activeReasonIndex, setActiveReasonIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      const interval = setInterval(() => {
        setCurrentSlideIndex(
          (prevIndex) =>
            (prevIndex + 1) % currentContent.whyCtrlsS.points.length
        );
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isMobile, currentContent.whyCtrlsS.points.length]);

  return (
    <section id="why-ctrls-s" className="py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        <h2 className="text-center font-inter text-3xl font-extrabold text-primary-purple md:text-4xl lg:text-[48px]">
          {currentContent.whyCtrlsS.title}
        </h2>

        {/* Desktop & Tablet Layout */}
        <div
          className={cn(
            "hidden md:flex mt-12 items-start justify-start min-h-[500px]",
            isArabic ? "md:flex-row-reverse" : "md:flex-row"
          )}
        >
          {/* Reasons List */}
          <div className="flex flex-col gap-4 md:w-2/5 h-[450px] overflow-y-auto">
            {currentContent.whyCtrlsS.points.map((point, index) => {
              const IconComponent = IconMap[point.icon as keyof typeof IconMap];
              const isActive = index === activeReasonIndex;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className={cn(
                    "flex flex-row items-center gap-4 p-6 rounded-lg shadow-md transition-all duration-300 h-auto w-full justify-start",
                    isActive
                      ? "bg-gradient-to-r from-blueGradientStart to-blueGradientEnd text-primary-purple"
                      : "bg-gradient-to-br from-teal/10 to-purple/10 text-black hover:scale-[1.02]"
                  )}
                  onClick={() => setActiveReasonIndex(index)}
                >
                  {IconComponent && (
                    <IconComponent
                      className={cn(
                        "h-8 w-8",
                        isActive ? "text-accent-teal" : "text-accent-teal"
                      )}
                    />
                  )}
                  <h3
                    className={cn(
                      "font-inter text-lg font-bold",
                      isArabic && "text-right"
                    )}
                  >
                    {point.shortTitle}
                  </h3>
                </Button>
              );
            })}
          </div>

          {/* Image & Description */}
          <div className="relative flex flex-col items-center justify-start md:w-3/5 h-[500px]">
            <Image
              src={
                currentContent.whyCtrlsS.points[activeReasonIndex]
                  .mainFeatureImage || "/placeholder.svg"
              }
              width={400}
              height={400}
              alt={
                currentContent.whyCtrlsS.points[activeReasonIndex].shortTitle
              }
              className="w-[350px] h-[350px] object-contain"
            />
            <p className="mt-4 text-neutral-grey text-xs font-normal w-1/2 text-center px-4 leading-relaxed overflow-y-auto max-h-[100px]">
              {currentContent.whyCtrlsS.points[activeReasonIndex].description}
            </p>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden mt-12 flex flex-col items-center h-[600px]">
          {" "}
          {/* FIXED HEIGHT */}
          {/* Image with swapped arrows */}
          <div className="relative flex items-center justify-center w-full max-w-[300px]">
            {/* Right Arrow */}
            <button
              className="absolute -right-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white shadow-md z-10 hover:bg-black/80 transition"
              onClick={() =>
                setCurrentSlideIndex(
                  (prev) => (prev + 1) % currentContent.whyCtrlsS.points.length
                )
              }
              aria-label="Next slide"
            >
              ›
            </button>

            {/* Image */}
            <Image
              src={
                currentContent.whyCtrlsS.points[currentSlideIndex]
                  .mainFeatureImage || "/placeholder.svg"
              }
              width={250}
              height={250}
              alt={
                currentContent.whyCtrlsS.points[currentSlideIndex].shortTitle
              }
              className="w-full h-auto object-contain"
            />

            {/* Left Arrow */}
            <button
              className="absolute -left-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white shadow-md z-10 hover:bg-black/80 transition"
              onClick={() =>
                setCurrentSlideIndex(
                  (prev) =>
                    (prev - 1 + currentContent.whyCtrlsS.points.length) %
                    currentContent.whyCtrlsS.points.length
                )
              }
              aria-label="Previous slide"
            >
              ‹
            </button>
          </div>
          {/* Title + Description Wrapper */}
          <div className="flex flex-col items-center justify-start flex-grow max-h-[200px]">
            {" "}
            {/* FIXED MAX HEIGHT */}
            {/* Title */}
            <h3 className="font-inter text-2xl font-bold text-neutral-dark text-center mb-2 mt-4 min-h-[3rem] flex items-center">
              {currentContent.whyCtrlsS.points[currentSlideIndex].shortTitle}
            </h3>
            {/* Description */}
            <p className="text-neutral-grey text-sm font-normal px-4 leading-relaxed text-center min-h-[6rem] max-h-[6rem] ">
              {currentContent.whyCtrlsS.points[currentSlideIndex].description}
            </p>
          </div>
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {currentContent.whyCtrlsS.points.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-3 w-3 rounded-full transition-colors duration-300",
                  index === currentSlideIndex
                    ? "bg-blueGradientEnd"
                    : "bg-gray-300"
                )}
                onClick={() => setCurrentSlideIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
