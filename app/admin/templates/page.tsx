"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [templateType, setTemplateType] = useState<"HTML" | "PDF_MAPPER" | "DIRECT_UPLOAD">("HTML")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    qrEnabled: true,
  })
  const router = useRouter()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/admin/login")
        return
      }

      const response = await fetch("/api/template/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/template/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          type: templateType,
        }),
      })

      if (response.ok) {
        setShowCreateForm(false)
        setFormData({ name: "", description: "", qrEnabled: true })
        fetchTemplates()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to create template")
      }
    } catch (error) {
      console.error("Error creating template:", error)
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
              <h1 className="text-2xl font-bold">Templates</h1>
              <p className="text-sm text-gray-600">
                Manage document templates
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
        <div className="mb-6">
          <Button onClick={() => setShowCreateForm(true)} size="lg">
            + Create New Template
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Template</CardTitle>
              <CardDescription>
                Choose a template type and configure it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <Tabs value={templateType} onValueChange={(v: any) => setTemplateType(v)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="HTML">HTML Builder</TabsTrigger>
                    <TabsTrigger value="PDF_MAPPER">PDF Mapper</TabsTrigger>
                    <TabsTrigger value="DIRECT_UPLOAD">Direct Upload</TabsTrigger>
                  </TabsList>
                  <TabsContent value="HTML" className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded">
                      <h4 className="font-semibold mb-2">HTML Template Builder</h4>
                      <p className="text-sm text-gray-600">
                        Drag and drop interface to create custom document templates
                        with dynamic variables, images, QR codes, and signatures.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="PDF_MAPPER" className="space-y-4">
                    <div className="bg-green-50 p-4 rounded">
                      <h4 className="font-semibold mb-2">PDF/JPEG Field Mapper</h4>
                      <p className="text-sm text-gray-600">
                        Upload a background PDF or image and map dynamic fields to
                        specific positions on the document.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="DIRECT_UPLOAD" className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded">
                      <h4 className="font-semibold mb-2">Direct Document Upload</h4>
                      <p className="text-sm text-gray-600">
                        Upload a ZIP file containing pre-made PDFs and map them to
                        students using CSV.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Degree Certificate 2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of this template"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="qrEnabled"
                    checked={formData.qrEnabled}
                    onChange={(e) =>
                      setFormData({ ...formData, qrEnabled: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="qrEnabled">Enable QR Code on Documents</Label>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit">Create Template</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Templates List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Templates</CardTitle>
            <CardDescription>All document templates</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No templates created yet. Create your first template to get started.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {template.type.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {template.description || "No description"}
                    </p>
                    <div className="flex space-x-2">
                      <Link href={`/admin/templates/${
                        template.type === 'HTML' ? 'html-builder' :
                        template.type === 'PDF_MAPPER' ? 'pdf-mapper' :
                        'direct-upload'
                      }/${template.id}`}>
                        <Button size="sm" variant="outline" className="flex-1">
                          Edit
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" className="flex-1">
                        Preview
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
