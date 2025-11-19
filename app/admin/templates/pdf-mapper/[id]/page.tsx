"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FieldMapping {
  id: string
  name: string
  label: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  fontFamily: string
  color: string
  type: "text" | "image" | "qr"
}

export default function PdfMapperPage() {
  const params = useParams()
  const templateId = params.id as string
  const router = useRouter()
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [backgroundUrl, setBackgroundUrl] = useState<string>("")
  const [fields, setFields] = useState<FieldMapping[]>([])
  const [selectedField, setSelectedField] = useState<FieldMapping | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [uploadingBg, setUploadingBg] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

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
        
        if (data.template.backgroundUrl) {
          setBackgroundUrl(data.template.backgroundUrl)
        }

        if (data.template.mappingConfig) {
          const config = JSON.parse(data.template.mappingConfig)
          setFields(config.fields || [])
        }
      }
    } catch (error) {
      console.error("Error fetching template:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingBg(true)
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("file", file)
      formData.append("templateId", templateId)

      const response = await fetch("/api/template/upload-background", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setBackgroundUrl(data.url)
        alert("Background uploaded successfully!")
      } else {
        alert("Failed to upload background")
      }
    } catch (error) {
      console.error("Error uploading background:", error)
      alert("An error occurred while uploading")
    } finally {
      setUploadingBg(false)
    }
  }

  const addField = (type: "text" | "image" | "qr") => {
    const newField: FieldMapping = {
      id: `field-${Date.now()}`,
      name: `${type}_${fields.length + 1}`,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field ${fields.length + 1}`,
      x: 100,
      y: 100,
      width: type === "qr" ? 100 : 200,
      height: type === "qr" ? 100 : 30,
      fontSize: 16,
      fontFamily: "Arial",
      color: "#000000",
      type: type,
    }

    setFields([...fields, newField])
    setSelectedField(newField)
  }

  const updateField = (fieldId: string, updates: Partial<FieldMapping>) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f))
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates })
    }
  }

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId))
    if (selectedField?.id === fieldId) {
      setSelectedField(null)
    }
  }

  const handleFieldMouseDown = (field: FieldMapping, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedField(field)
    setIsDragging(true)
    setDragStart({ x: e.clientX - field.x, y: e.clientY - field.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedField || !imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragStart.x, rect.width - selectedField.width))
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragStart.y, rect.height - selectedField.height))

    updateField(selectedField.id, { x, y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const saveTemplate = async () => {
    try {
      const token = localStorage.getItem("token")
      const config = {
        fields: fields,
        backgroundUrl: backgroundUrl,
      }
      
      const response = await fetch(`/api/template/update/${templateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mappingConfig: JSON.stringify(config),
          backgroundUrl: backgroundUrl,
        }),
      })

      if (response.ok) {
        alert("Template saved successfully!")
      } else {
        alert("Failed to save template")
      }
    } catch (error) {
      console.error("Error saving template:", error)
      alert("An error occurred while saving")
    }
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
              <h1 className="text-2xl font-bold">PDF/JPEG Field Mapper</h1>
              <p className="text-sm text-gray-600">
                {template?.name || "Untitled Template"}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={saveTemplate} variant="default">
                Save Mapping
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
          {/* Left Sidebar - Tools */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="background">Upload PDF/Image</Label>
                  <Input
                    id="background"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleBackgroundUpload}
                    disabled={uploadingBg}
                  />
                  {uploadingBg && (
                    <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Add Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={() => addField("text")} className="w-full" variant="outline">
                  + Add Text Field
                </Button>
                <Button onClick={() => addField("image")} className="w-full" variant="outline">
                  + Add Image Field
                </Button>
                <Button onClick={() => addField("qr")} className="w-full" variant="outline">
                  + Add QR Code
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Fields List</CardTitle>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <p className="text-sm text-gray-600">No fields added yet</p>
                ) : (
                  <div className="space-y-2">
                    {fields.map((field) => (
                      <div
                        key={field.id}
                        className={`p-2 border rounded cursor-pointer ${
                          selectedField?.id === field.id ? "bg-blue-50 border-blue-500" : ""
                        }`}
                        onClick={() => setSelectedField(field)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{field.label}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteField(field.id)
                            }}
                          >
                            ×
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {field.type} • {Math.round(field.x)}, {Math.round(field.y)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center - Canvas */}
          <div className="col-span-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mapping Area</CardTitle>
                <CardDescription>
                  Click and drag fields to position them on the document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-gray-300 bg-gray-100 p-4">
                  {backgroundUrl ? (
                    <div
                      ref={imageRef}
                      className="relative inline-block"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <img
                        src={backgroundUrl}
                        alt="Template background"
                        className="max-w-full"
                        draggable={false}
                      />
                      {fields.map((field) => (
                        <div
                          key={field.id}
                          className={`absolute border-2 cursor-move ${
                            selectedField?.id === field.id
                              ? "border-blue-500 bg-blue-100/50"
                              : "border-green-500 bg-green-100/50"
                          }`}
                          style={{
                            left: `${field.x}px`,
                            top: `${field.y}px`,
                            width: `${field.width}px`,
                            height: `${field.height}px`,
                          }}
                          onMouseDown={(e) => handleFieldMouseDown(field, e)}
                        >
                          <div className="text-xs p-1 bg-white/80">
                            {field.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-gray-600">
                      Please upload a background image or PDF first
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Properties */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Field Properties</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedField ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Field Name</Label>
                      <Input
                        value={selectedField.name}
                        onChange={(e) => updateField(selectedField.id, { name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        value={selectedField.label}
                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>X Position</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedField.x)}
                          onChange={(e) => updateField(selectedField.id, { x: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Y Position</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedField.y)}
                          onChange={(e) => updateField(selectedField.id, { y: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Width</Label>
                        <Input
                          type="number"
                          value={selectedField.width}
                          onChange={(e) => updateField(selectedField.id, { width: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Height</Label>
                        <Input
                          type="number"
                          value={selectedField.height}
                          onChange={(e) => updateField(selectedField.id, { height: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    {selectedField.type === "text" && (
                      <>
                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <Input
                            type="number"
                            value={selectedField.fontSize}
                            onChange={(e) => updateField(selectedField.id, { fontSize: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Font Family</Label>
                          <select
                            value={selectedField.fontFamily}
                            onChange={(e) => updateField(selectedField.id, { fontFamily: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Text Color</Label>
                          <div className="flex space-x-2">
                            <Input
                              type="color"
                              value={selectedField.color}
                              onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                              className="w-20"
                            />
                            <Input
                              type="text"
                              value={selectedField.color}
                              onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    <Button onClick={() => deleteField(selectedField.id)} variant="outline" className="w-full">
                      Delete Field
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Select a field to edit its properties
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Help</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Upload a background PDF or image</p>
                  <p>• Add fields for dynamic content</p>
                  <p>• Drag fields to position them</p>
                  <p>• Configure field properties</p>
                  <p>• Save when done</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
