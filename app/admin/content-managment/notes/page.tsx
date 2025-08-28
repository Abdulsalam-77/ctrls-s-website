"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import NoteItem from "./components/NoteItem"

interface Note {
  id: string
  title: string
  description: string
  content_type: string
  content_url: string
  visibility: "published" | "hidden"
  section: string
  created_at: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .eq("content_type", "text")
        .order("created_at", { ascending: false })

      if (error) throw error
      if (data) setNotes(data)
    } catch (error) {
      console.log("[v0] Error fetching notes:", error)
      toast({
        title: "Error",
        description: "Failed to fetch notes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNoteUpdate = () => {
    fetchNotes()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-montserrat text-2xl font-bold text-primary-purple">Notes Management</h2>
        <Button className="bg-accent-teal hover:bg-primary-purple text-white font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Add New Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">No notes found. Create your first note to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">Manage course notes and study materials here.</p>
          <div className="grid gap-4">
            {notes.map((note) => (
              <NoteItem key={note.id} note={note} onUpdate={handleNoteUpdate} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
