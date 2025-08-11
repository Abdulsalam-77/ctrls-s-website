"use client";

import { useLanguage } from "@/components/language-context";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function RoadmapSection() {
  const { currentContent } = useLanguage();

  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);

  useEffect(() => {
    if (cardsRef.current.length === 0) return;

    // Measure heights of all cards
    const heights = cardsRef.current.map((el) => el?.offsetHeight || 0);
    const max = Math.max(...heights);
    setMaxHeight(max);
  }, [currentContent]);

  return (
    <section
      id="roadmap"
      className="relative overflow-hidden pt-16 pb-4 md:py-24"
    >
      <div className="container relative z-10 px-4 md:px-6">
        <h2 className="text-center font-inter text-3xl font-extrabold text-primary-purple md:text-4xl lg:text-[48px]">
          {currentContent.roadmap.title}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-center text-base font-normal text-neutral-grey leading-relaxed">
          {currentContent.roadmap.description}
        </p>

        {/* Desktop Layout (Horizontal Cards) */}
        <div className="hidden flex-col items-center md:flex">
          <div className="mt-12 flex justify-center gap-8 lg:gap-16">
            {currentContent.roadmap.level1.modules.map((module, index) => (
              <div
                key={index}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                style={{ height: maxHeight ? `${maxHeight}px` : "auto" }}
                className="relative flex w-full max-w-[250px] flex-col rounded-2xl bg-cardGradient p-4 text-white shadow-lg"
              >
                <div className="flex w-full justify-between">
                  {/* Empty for future icons */}
                </div>
                <Image
                  src={module.illustration || "/placeholder.svg"}
                  width={200}
                  height={100}
                  alt={module.title}
                  className="my-2 h-[100px] w-auto object-contain"
                />
                <h3 className="text-center font-inter text-xl font-bold text-neutral-dark">
                  {module.title}
                </h3>
                <p className="text-center text-base font-normal text-neutral-grey mt-2 leading-relaxed">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline (Vertical) */}
        <div className="relative mx-auto flex flex-col items-center justify-center py-4 md:hidden">
          {currentContent.roadmap.level1.modules.map((module, index) => (
            <div
              key={index}
              className="relative flex w-full items-center py-10"
            >
              <div
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                style={{ height: maxHeight ? `${maxHeight}px` : "auto" }}
                className=" w-full max-w-[250px] flex mx-auto flex-col items-center justify-center rounded-2xl bg-cardGradient p-4 text-white shadow-lg"
              >
                <div className="flex w-full justify-between">{/* Empty */}</div>
                <Image
                  src={module.illustration || "/placeholder.svg"}
                  width={200}
                  height={100}
                  alt={module.title}
                  className="my-2 h-[100px] w-auto object-contain mx-auto"
                />
                <h3 className="text-center font-inter text-xl font-bold text-neutral-dark">
                  {module.title}
                </h3>
                <p className="text-center text-base font-normal text-neutral-grey mt-2 leading-relaxed">
                  {module.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
