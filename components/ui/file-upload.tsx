"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "./button"
import { Upload, X, File } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  accept?: string
  maxSize?: number // in MB
  currentFile?: File | null
}

export function FileUpload({ onFileSelect, accept = "*/*", maxSize = 10, currentFile }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }
    onFileSelect(file)
  }

  const removeFile = () => {
    onFileSelect(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept={accept}
        />

        {currentFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <File className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">{currentFile.name}</span>
              <span className="text-xs text-gray-500">({(currentFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">Max file size: {maxSize}MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
