"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ExamList from "./ExamList"

export default function ExamTabs() {
  return (
    <Tabs defaultValue="drafts" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-100">
        <TabsTrigger
          value="drafts"
          className="font-medium data-[state=active]:bg-white data-[state=active]:text-primary-purple"
        >
          Drafts
        </TabsTrigger>
        <TabsTrigger
          value="active"
          className="font-medium data-[state=active]:bg-white data-[state=active]:text-primary-purple"
        >
          Active
        </TabsTrigger>
      </TabsList>

      <TabsContent value="drafts" className="mt-6">
        <ExamList status="draft" />
      </TabsContent>

      <TabsContent value="active" className="mt-6">
        <ExamList status="active" />
      </TabsContent>
    </Tabs>
  )
}
