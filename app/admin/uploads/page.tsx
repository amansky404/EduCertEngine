"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FileManagerPage() {
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "uploads")

      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setFiles((prev) => [...prev, data.file])
        }
      } catch (error) {
        console.error("Upload error:", error)
      }
    }

    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">File Manager</h1>
              <p className="text-sm text-gray-600">
                Upload and manage files
              </p>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Files</CardTitle>
                <CardDescription>
                  {files.length} files uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                {files.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    No files uploaded yet. Go to Upload tab to add files.
                  </div>
                ) : (
                  <div className="grid md:grid-cols-4 gap-4">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="border rounded p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center">
                          {file.fileType.startsWith("image/") ? (
                            <img
                              src={file.fileUrl}
                              alt={file.fileName}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <svg
                              className="w-12 h-12 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm font-medium truncate">
                          {file.originalName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {(file.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
                <CardDescription>Image files only</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-600">
                  Image gallery view
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>PDF and document files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-600">
                  Document list view
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>
                  Upload images, PDFs, and other files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="fileUpload"
                  />
                  <label
                    htmlFor="fileUpload"
                    className="cursor-pointer"
                  >
                    <div className="mb-4">
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <p className="text-lg font-medium mb-2">
                      {uploading ? "Uploading..." : "Click to upload files"}
                    </p>
                    <p className="text-sm text-gray-600">
                      or drag and drop files here
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported: Images, PDFs, ZIP files
                    </p>
                  </label>
                </div>

                <div className="bg-blue-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">Upload Guidelines</h4>
                  <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                    <li>Maximum file size: 10MB per file</li>
                    <li>Supported formats: JPG, PNG, PDF, ZIP</li>
                    <li>Files are automatically organized by type</li>
                    <li>Uploaded files can be used in templates and documents</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
