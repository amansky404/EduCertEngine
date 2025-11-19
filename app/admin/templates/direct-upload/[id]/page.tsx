"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FileMapping {
  studentRollNo: string
  fileName: string
  status: "pending" | "uploaded" | "error"
}

export default function DirectUploadPage() {
  const params = useParams()
  const templateId = params.id as string
  const router = useRouter()
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvContent, setCsvContent] = useState("")
  const [mappings, setMappings] = useState<FileMapping[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchTemplate()
  }, [templateId])

  const fetchTemplate = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/admin/login")
        return
      }

      const response = await fetch(`/api/template/get/${templateId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTemplate(data.template)

        if (data.template.fileMapping) {
          const mapping = JSON.parse(data.template.fileMapping)
          setMappings(mapping.mappings || [])
        }
      }
    } catch (error) {
      console.error("Error fetching template:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith(".zip")) {
      setZipFile(file)
    } else {
      alert("Please upload a ZIP file")
    }
  }

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
      setCsvFile(file)
      
      // Read CSV content
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setCsvContent(content)
        parseCsvMapping(content)
      }
      reader.readAsText(file)
    } else {
      alert("Please upload a CSV file")
    }
  }

  const parseCsvMapping = (content: string) => {
    const lines = content.split("\n").filter(line => line.trim())
    const headers = lines[0].split(",").map(h => h.trim())
    
    const rollNoIndex = headers.findIndex(h => 
      h.toLowerCase().includes("roll") || h.toLowerCase().includes("id")
    )
    const fileNameIndex = headers.findIndex(h => 
      h.toLowerCase().includes("file") || h.toLowerCase().includes("pdf")
    )

    if (rollNoIndex === -1 || fileNameIndex === -1) {
      alert("CSV must contain columns for roll number and file name")
      return
    }

    const newMappings: FileMapping[] = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim())
      return {
        studentRollNo: values[rollNoIndex] || "",
        fileName: values[fileNameIndex] || "",
        status: "pending" as const,
      }
    })

    setMappings(newMappings)
  }

  const handleManualCsvPaste = () => {
    if (csvContent.trim()) {
      parseCsvMapping(csvContent)
    }
  }

  const uploadFiles = async () => {
    if (!zipFile) {
      alert("Please upload a ZIP file")
      return
    }

    if (mappings.length === 0) {
      alert("Please upload or create a CSV mapping")
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("zipFile", zipFile)
      formData.append("mappings", JSON.stringify(mappings))
      formData.append("templateId", templateId)

      const response = await fetch("/api/template/direct-upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Successfully uploaded ${data.count} documents`)
        
        // Update template with mapping
        await saveMapping()
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error uploading files:", error)
      alert("An error occurred while uploading")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const saveMapping = async () => {
    try {
      const token = localStorage.getItem("token")
      const config = {
        mappings: mappings,
        zipFileName: zipFile?.name,
        csvFileName: csvFile?.name,
      }
      
      const response = await fetch(`/api/template/update/${templateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileMapping: JSON.stringify(config),
          zipUrl: zipFile?.name,
        }),
      })

      if (response.ok) {
        console.log("Mapping saved successfully")
      }
    } catch (error) {
      console.error("Error saving mapping:", error)
    }
  }

  const downloadSampleCsv = () => {
    const sample = "rollNo,fileName\n2024001,student-2024001.pdf\n2024002,student-2024002.pdf\n2024003,student-2024003.pdf"
    const blob = new Blob([sample], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "sample-mapping.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading template...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Direct Document Upload</h1>
              <p className="text-sm text-gray-600">
                {template?.name || "Untitled Template"}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={uploadFiles} disabled={uploading} variant="default">
                {uploading ? "Uploading..." : "Upload & Process"}
              </Button>
              <Link href="/admin/templates">
                <Button variant="outline">Back</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Side - Instructions */}
          <div className="col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">Step 1: Prepare Documents</p>
                  <p className="text-gray-600">
                    Create a ZIP file containing all PDF documents. Name them systematically
                    (e.g., student-2024001.pdf, student-2024002.pdf)
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">Step 2: Create CSV Mapping</p>
                  <p className="text-gray-600">
                    Create a CSV file with two columns: rollNo and fileName. This maps
                    each student to their document.
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">Step 3: Upload Files</p>
                  <p className="text-gray-600">
                    Upload both the ZIP file and CSV mapping. The system will automatically
                    match and assign documents to students.
                  </p>
                </div>
                <Button onClick={downloadSampleCsv} variant="outline" className="w-full">
                  Download Sample CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">CSV Format</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                  rollNo,fileName<br />
                  2024001,student-2024001.pdf<br />
                  2024002,student-2024002.pdf<br />
                  2024003,student-2024003.pdf
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Upload Forms */}
          <div className="col-span-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Files</CardTitle>
                <CardDescription>
                  Upload your ZIP file containing documents and CSV mapping file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ZIP Upload */}
                <div className="space-y-2">
                  <Label htmlFor="zipFile">ZIP File (Documents)</Label>
                  <Input
                    id="zipFile"
                    type="file"
                    accept=".zip"
                    onChange={handleZipUpload}
                    disabled={uploading}
                  />
                  {zipFile && (
                    <p className="text-sm text-green-600">
                      ✓ Selected: {zipFile.name} ({(zipFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* CSV Upload */}
                <div className="space-y-2">
                  <Label htmlFor="csvFile">CSV Mapping File</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCsvUpload}
                    disabled={uploading}
                  />
                  {csvFile && (
                    <p className="text-sm text-green-600">
                      ✓ Selected: {csvFile.name}
                    </p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-2">Or paste CSV content directly:</p>
                  <Textarea
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    placeholder="rollNo,fileName&#10;2024001,student-2024001.pdf&#10;2024002,student-2024002.pdf"
                    rows={6}
                    disabled={uploading}
                  />
                  <Button 
                    onClick={handleManualCsvPaste} 
                    variant="outline" 
                    className="mt-2"
                    disabled={uploading}
                  >
                    Parse CSV Content
                  </Button>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-center text-gray-600">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mappings Preview */}
            {mappings.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Mapping Preview</CardTitle>
                  <CardDescription>
                    {mappings.length} mappings found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left">Roll No</th>
                          <th className="px-4 py-2 text-left">File Name</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mappings.map((mapping, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-2">{mapping.studentRollNo}</td>
                            <td className="px-4 py-2">{mapping.fileName}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                mapping.status === "uploaded" ? "bg-green-100 text-green-800" :
                                mapping.status === "error" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {mapping.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
