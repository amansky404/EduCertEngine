"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CsvField {
  name: string
  type: string
  required: boolean
  options?: string[]
}

export default function CsvCreatorPage() {
  const [fields, setFields] = useState<CsvField[]>([
    { name: "roll_no", type: "text", required: true },
    { name: "student_name", type: "text", required: true },
    { name: "reg_no", type: "text", required: false },
  ])
  const [newField, setNewField] = useState<CsvField>({
    name: "",
    type: "text",
    required: false,
  })
  const [csvName, setCsvName] = useState("Student Data Template")
  const router = useRouter()

  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "dropdown", label: "Dropdown" },
    { value: "boolean", label: "Yes/No" },
    { value: "url", label: "File URL" },
  ]

  const handleAddField = () => {
    if (!newField.name) {
      alert("Field name is required")
      return
    }
    setFields([...fields, { ...newField }])
    setNewField({ name: "", type: "text", required: false })
  }

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleDownloadTemplate = () => {
    // Create CSV header
    const headers = fields.map((f) => f.name).join(",")
    const sampleRow = fields.map((f) => {
      switch (f.type) {
        case "text":
          return "Sample Text"
        case "number":
          return "123"
        case "date":
          return "2024-01-01"
        case "email":
          return "email@example.com"
        case "phone":
          return "1234567890"
        case "boolean":
          return "true"
        case "url":
          return "https://example.com/file.pdf"
        default:
          return ""
      }
    }).join(",")

    const csvContent = `${headers}\n${sampleRow}`
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${csvName.replace(/ /g, "_").toLowerCase()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleSaveConfig = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/csv/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: csvName,
          fields,
        }),
      })

      if (response.ok) {
        alert("CSV configuration saved successfully!")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to save configuration")
      }
    } catch (error) {
      console.error("Error saving CSV config:", error)
      alert("An error occurred")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">CSV Creator</h1>
              <p className="text-sm text-gray-600">
                Create custom CSV templates for student data import
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
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Configure Fields</CardTitle>
              <CardDescription>
                Define the structure of your CSV file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CSV Name */}
              <div className="space-y-2">
                <Label htmlFor="csvName">CSV Template Name</Label>
                <Input
                  id="csvName"
                  value={csvName}
                  onChange={(e) => setCsvName(e.target.value)}
                  placeholder="e.g., Student Data Template"
                />
              </div>

              {/* Existing Fields */}
              <div className="space-y-2">
                <Label>Current Fields</Label>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{field.name}</div>
                        <div className="text-sm text-gray-600">
                          Type: {field.type} {field.required && "(Required)"}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveField(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Field */}
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold">Add New Field</h3>
                <div className="space-y-2">
                  <Label htmlFor="fieldName">Field Name</Label>
                  <Input
                    id="fieldName"
                    value={newField.name}
                    onChange={(e) =>
                      setNewField({ ...newField, name: e.target.value })
                    }
                    placeholder="e.g., father_name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldType">Field Type</Label>
                  <select
                    id="fieldType"
                    value={newField.type}
                    onChange={(e) =>
                      setNewField({ ...newField, type: e.target.value })
                    }
                    className="w-full h-10 px-3 border rounded-md"
                  >
                    {fieldTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="fieldRequired"
                    checked={newField.required}
                    onChange={(e) =>
                      setNewField({ ...newField, required: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="fieldRequired">Required Field</Label>
                </div>
                <Button onClick={handleAddField} className="w-full">
                  + Add Field
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>CSV template preview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CSV Preview */}
              <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                <div className="whitespace-nowrap">
                  {fields.map((f) => f.name).join(",")}
                </div>
                <div className="whitespace-nowrap text-gray-500">
                  {fields.map(() => "...").join(",")}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button onClick={handleDownloadTemplate} className="w-full">
                  Download CSV Template
                </Button>
                <Button
                  onClick={handleSaveConfig}
                  variant="outline"
                  className="w-full"
                >
                  Save Configuration
                </Button>
              </div>

              {/* Info */}
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-semibold mb-2">How to use</h4>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Add all required fields for your students</li>
                  <li>Download the CSV template</li>
                  <li>Fill in student data in the downloaded file</li>
                  <li>Upload the completed CSV in the Students section</li>
                  <li>Documents will be auto-generated for all students</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
