"use client"

import { useLanguage } from "@/components/language-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function EnrollPage() {
  const { currentContent } = useLanguage()

  return (
    <section className="min-h-[calc(100vh-64px-120px)] flex items-center justify-center bg-gray-50 py-16 md:py-24">
      <div className="container px-4 md:px-6 text-center">
        <h2 className="font-inter text-3xl font-extrabold text-primary-purple md:text-4xl lg:text-[48px]">
          {currentContent.enrollment.title}
        </h2>
        <p className="mt-4 text-base font-normal text-neutral-grey leading-relaxed">
          {currentContent.enrollment.description}
        </p>

        <div className="mt-12 flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-inter text-xl font-bold text-neutral-dark">
                {currentContent.enrollment.plan.name}
              </CardTitle>
              <CardDescription className="font-inter text-base font-normal text-neutral-grey leading-relaxed">
                {currentContent.enrollment.plan.paymentMethod}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="font-inter text-5xl font-bold text-accent-teal">
                {currentContent.enrollment.plan.price}
              </div>
              <p className="mt-4 text-base font-normal text-neutral-grey leading-relaxed">
                {/* Add more details about the plan if needed */}
              </p>
            </CardContent>
            <CardFooter>
              <Link
                href={currentContent.enrollment.plan.etisalatLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full rounded-full bg-accent-teal px-6 py-3 font-bold text-white hover:bg-primary-purple">
                  {currentContent.enrollment.plan.cta}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}
