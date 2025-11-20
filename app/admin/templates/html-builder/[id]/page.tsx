"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import Image from "@tiptap/extension-image"
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Undo, Undo2, Redo, Save, Eye, Plus, ImageIcon
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
export default function RichTextBuilderPage() {
  const params = useParams()
  const templateId = params.id as string
  const router = useRouter()
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedColor, setSelectedColor] = useState("#000000")
  const [showVariablePanel, setShowVariablePanel] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: '<p>Start editing your template...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-8',
      },
    },
  })

  useEffect(() => {
    fetchTemplate()
  }, [templateId])

  useEffect(() => {
    if (editor && template && template.htmlContent) {
      editor.commands.setContent(template.htmlContent)
    }
  }, [editor, template])

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
      }
    } catch (error) {
      console.error("Error fetching template:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editor) return

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const htmlContent = editor.getHTML()

      const response = await fetch(`/api/template/update/${templateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          htmlContent,
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
    } finally {
      setSaving(false)
    }
  }

  const insertVariable = (variableName: string) => {
    if (editor) {
      editor.chain().focus().insertContent(`{{${variableName}}}`).run()
    }
  }

  const insertImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const applyTextColor = (color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run()
    }
  }

  const commonVariables = [
    { name: 'studentName', label: 'Student Name' },
    { name: 'rollNo', label: 'Roll Number' },
    { name: 'regNo', label: 'Registration Number' },
    { name: 'fatherName', label: 'Father Name' },
    { name: 'dob', label: 'Date of Birth' },
    { name: 'email', label: 'Email' },
    { name: 'mobile', label: 'Mobile' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading template...</p>
        </div>
      </div>
    )
  }

  if (!editor) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{template?.name || 'Template Editor'}</h1>
              <p className="text-sm text-gray-600">Rich Text Template Builder</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Link href="/admin/templates">
                <Button variant="outline" size="sm">
                  Back to Templates
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Toolbar */}
          <div className="col-span-12 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Formatting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-col space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-gray-200' : ''}
                  >
                    <Bold className="w-4 h-4 mr-2" />
                    Bold
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-gray-200' : ''}
                  >
                    <Italic className="w-4 h-4 mr-2" />
                    Italic
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={editor.isActive('underline') ? 'bg-gray-200' : ''}
                  >
                    <UnderlineIcon className="w-4 h-4 mr-2" />
                    Underline
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={editor.isActive('strike') ? 'bg-gray-200' : ''}
                  >
                    <Strikethrough className="w-4 h-4 mr-2" />
                    Strike
                  </Button>
                </div>

                <div className="pt-2 border-t">
                  <Label className="text-xs">Headings</Label>
                  <div className="flex flex-col space-y-1 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                      className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}
                    >
                      <Heading1 className="w-4 h-4 mr-2" />
                      H1
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
                    >
                      <Heading2 className="w-4 h-4 mr-2" />
                      H2
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
                    >
                      <Heading3 className="w-4 h-4 mr-2" />
                      H3
                    </Button>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Label className="text-xs">Alignment</Label>
                  <div className="flex flex-col space-y-1 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().setTextAlign('left').run()}
                      className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
                    >
                      <AlignLeft className="w-4 h-4 mr-2" />
                      Left
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().setTextAlign('center').run()}
                      className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
                    >
                      <AlignCenter className="w-4 h-4 mr-2" />
                      Center
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().setTextAlign('right').run()}
                      className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
                    >
                      <AlignRight className="w-4 h-4 mr-2" />
                      Right
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                      className={editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}
                    >
                      <AlignJustify className="w-4 h-4 mr-2" />
                      Justify
                    </Button>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Label className="text-xs">Lists</Label>
                  <div className="flex flex-col space-y-1 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
                    >
                      <List className="w-4 h-4 mr-2" />
                      Bullet
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
                    >
                      <ListOrdered className="w-4 h-4 mr-2" />
                      Numbered
                    </Button>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Label className="text-xs">Color</Label>
                  <div className="space-y-1 mt-1">
                    <Input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => {
                        setSelectedColor(e.target.value)
                        applyTextColor(e.target.value)
                      }}
                      className="h-10 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={insertImage}
                    className="w-full"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Insert Image
                  </Button>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().undo()}
                    >
                      <Undo className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().redo()}
                    >
                      <Redo className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Editor */}
          <div className="col-span-12 lg:col-span-7">
            <Card>
              <CardContent className="p-0">
                {showPreview ? (
                  <div 
                    className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto p-8 min-h-[600px]"
                    dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
                  />
                ) : (
                  <EditorContent 
                    editor={editor}
                    className="border rounded-lg min-h-[600px]"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Variables */}
          <div className="col-span-12 lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dynamic Variables</CardTitle>
                <p className="text-xs text-gray-500">
                  Click to insert student data placeholders
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {commonVariables.map((variable) => (
                    <Button
                      key={variable.name}
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(variable.name)}
                      className="w-full justify-start text-left"
                    >
                      <Plus className="w-3 h-3 mr-2" />
                      <span className="text-xs">{variable.label}</span>
                    </Button>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800 font-semibold mb-2">
                    How to use variables:
                  </p>
                  <p className="text-xs text-blue-700">
                    Variables like <code className="bg-blue-100 px-1 rounded">{'{{'+'studentName'+'}}'}</code> will be automatically replaced with actual student data when generating documents.
                  </p>
                </div>

                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-800 font-semibold mb-2">
                    Example:
                  </p>
                  <p className="text-xs text-green-700">
                    &quot;This is to certify that <code className="bg-green-100 px-1 rounded">{'{{'+'studentName'+'}}'}</code> with Roll No. <code className="bg-green-100 px-1 rounded">{'{{'+'rollNo'+'}}'}</code> has successfully completed the course.&quot;
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Template Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Name:</span>
                    <p className="text-gray-600">{template?.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Type:</span>
                    <p className="text-gray-600">Rich Text (HTML)</p>
                  </div>
                  <div>
                    <span className="font-semibold">QR Enabled:</span>
                    <p className="text-gray-600">{template?.qrEnabled ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
