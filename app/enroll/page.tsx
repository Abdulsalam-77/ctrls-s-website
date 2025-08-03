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
        <h2 className="font-montserrat text-3xl font-extrabold text-purple md:text-4xl">
          {currentContent.enrollment.title}
        </h2>
        <p className="mt-4 text-lg text-gray-700">{currentContent.enrollment.description}</p>

        <div className="mt-12 flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{currentContent.enrollment.plan.name}</CardTitle>
              <CardDescription>{currentContent.enrollment.plan.paymentMethod}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-teal">{currentContent.enrollment.plan.price}</div>
              <p className="mt-4 text-gray-600">{/* Add more details about the plan if needed */}</p>
            </CardContent>
            <CardFooter>
              <Link
                href={currentContent.enrollment.plan.etisalatLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full rounded-full bg-teal px-6 py-3 font-bold text-white hover:bg-purple">
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
