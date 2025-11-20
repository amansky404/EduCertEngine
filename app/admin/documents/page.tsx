"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { FileText, Download, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface Template {
  id: string
  name: string
  type: string
  description: string
}

interface Student {
  id: string
  rollNo: string
  name: string
  regNo: string
}

interface Document {
  id: string
  title: string
  pdfUrl: string
  isPublished: boolean
  createdAt: string
  student: {
    name: string
    rollNo: string
  }
  template: {
    name: string
  }
}

export default function DocumentsPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [generationResult, setGenerationResult] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectAll) {
      setSelectedStudents(students.map(s => s.id))
    } else {
      setSelectedStudents([])
    }
  }, [selectAll, students])

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/admin/login")
        return
      }

      // Fetch templates, students, and documents in parallel
      const [templatesRes, studentsRes, documentsRes] = await Promise.all([
        fetch("/api/template/list", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/student/list", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/document/list", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null), // Documents list endpoint might not exist yet
      ])

      if (templatesRes.ok) {
        const data = await templatesRes.json()
        setTemplates(data.templates || [])
      }

      if (studentsRes.ok) {
        const data = await studentsRes.json()
        setStudents(data.students || [])
      }

      if (documentsRes && documentsRes.ok) {
        const data = await documentsRes.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setFetchingData(false)
    }
  }

  const handleGenerateDocuments = async () => {
    if (!selectedTemplate) {
      alert("Please select a template")
      return
    }

    if (selectedStudents.length === 0) {
      alert("Please select at least one student")
      return
    }

    setLoading(true)
    setGenerationResult(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/document/generate-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          studentIds: selectedStudents,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGenerationResult(data)
        // Refresh documents list
        await fetchInitialData()
        // Reset selection
        setSelectedTemplate("")
        setSelectedStudents([])
        setSelectAll(false)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to generate documents")
      }
    } catch (error) {
      console.error("Error generating documents:", error)
      alert("An error occurred while generating documents")
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublish = async (documentId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/document/update/${documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isPublished: !currentStatus,
        }),
      })

      if (response.ok) {
        // Refresh documents list
        await fetchInitialData()
      } else {
        alert("Failed to update document status")
      }
    } catch (error) {
      console.error("Error updating document:", error)
      alert("An error occurred")
    }
  }

  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId))
    } else {
      setSelectedStudents([...selectedStudents, studentId])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Documents</h1>
              <p className="text-sm text-gray-600">
                Generate and manage student documents
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
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList>
            <TabsTrigger value="generate">Generate Documents</TabsTrigger>
            <TabsTrigger value="list">View All Documents</TabsTrigger>
          </TabsList>

          {/* Generate Documents Tab */}
          <TabsContent value="generate">
            <div className="grid gap-6">
              {/* Generation Result */}
              {generationResult && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      Documents Generated Successfully
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-700">
                          {generationResult.generated}
                        </div>
                        <div className="text-sm text-gray-600">Generated</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {generationResult.skipped}
                        </div>
                        <div className="text-sm text-gray-600">Skipped (Already Exists)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {generationResult.failed}
                        </div>
                        <div className="text-sm text-gray-600">Failed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Select Template</CardTitle>
                  <CardDescription>
                    Choose the template to use for document generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {fetchingData ? (
                    <div className="text-center py-4">Loading templates...</div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">No templates available</p>
                      <p className="text-sm mt-1">Create a template first to generate documents</p>
                      <Link href="/admin/templates">
                        <Button className="mt-4">Create Template</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedTemplate === template.id
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${
                              selectedTemplate === template.id ? "text-blue-600" : "text-gray-400"
                            }`}>
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{template.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">
                                {template.type.replace("_", " ")}
                              </p>
                              {template.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {template.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Student Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Select Students</CardTitle>
                  <CardDescription>
                    Choose which students to generate documents for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {fetchingData ? (
                    <div className="text-center py-4">Loading students...</div>
                  ) : students.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">No students available</p>
                      <p className="text-sm mt-1">Add students first to generate documents</p>
                      <Link href="/admin/students">
                        <Button className="mt-4">Add Students</Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={(e) => setSelectAll(e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="font-medium">
                            Select All ({students.length} students)
                          </span>
                        </label>
                      </div>
                      <div className="max-h-96 overflow-y-auto border rounded">
                        <table className="w-full">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr className="text-left border-b">
                              <th className="p-3 w-12"></th>
                              <th className="p-3 font-semibold">Roll No</th>
                              <th className="p-3 font-semibold">Name</th>
                              <th className="p-3 font-semibold">Reg No</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.map((student) => (
                              <tr
                                key={student.id}
                                className={`border-b hover:bg-gray-50 cursor-pointer ${
                                  selectedStudents.includes(student.id) ? "bg-blue-50" : ""
                                }`}
                                onClick={() => toggleStudentSelection(student.id)}
                              >
                                <td className="p-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedStudents.includes(student.id)}
                                    onChange={() => toggleStudentSelection(student.id)}
                                    className="w-4 h-4"
                                  />
                                </td>
                                <td className="p-3">{student.rollNo}</td>
                                <td className="p-3">{student.name}</td>
                                <td className="p-3">{student.regNo || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 text-sm text-gray-600">
                        Selected: {selectedStudents.length} student(s)
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={handleGenerateDocuments}
                    disabled={loading || !selectedTemplate || selectedStudents.length === 0}
                    className="w-full h-12 text-lg"
                  >
                    {loading ? (
                      <>
                        <Clock className="h-5 w-5 mr-2 animate-spin" />
                        Generating Documents...
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5 mr-2" />
                        Generate Documents
                      </>
                    )}
                  </Button>
                  {!selectedTemplate && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Please select a template and at least one student
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* View All Documents Tab */}
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>All Generated Documents</CardTitle>
                <CardDescription>
                  View and manage all generated documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fetchingData ? (
                  <div className="text-center py-8">Loading documents...</div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No documents generated yet</p>
                    <p className="text-sm mt-2">Generate documents using the form above</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="pb-3 font-semibold">Title</th>
                          <th className="pb-3 font-semibold">Student</th>
                          <th className="pb-3 font-semibold">Roll No</th>
                          <th className="pb-3 font-semibold">Template</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Created</th>
                          <th className="pb-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc) => (
                          <tr key={doc.id} className="border-b hover:bg-gray-50">
                            <td className="py-3">{doc.title}</td>
                            <td className="py-3">{doc.student.name}</td>
                            <td className="py-3">{doc.student.rollNo}</td>
                            <td className="py-3">{doc.template.name}</td>
                            <td className="py-3">
                              {doc.isPublished ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  <CheckCircle className="h-3 w-3" />
                                  Published
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                  <Clock className="h-3 w-3" />
                                  Draft
                                </span>
                              )}
                            </td>
                            <td className="py-3">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                {doc.pdfUrl && (
                                  <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="outline">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </a>
                                )}
                                <Button
                                  size="sm"
                                  variant={doc.isPublished ? "outline" : "default"}
                                  onClick={() => handleTogglePublish(doc.id, doc.isPublished)}
                                >
                                  {doc.isPublished ? "Unpublish" : "Publish"}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
