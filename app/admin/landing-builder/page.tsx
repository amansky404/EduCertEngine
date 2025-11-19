"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Section {
  id: string
  name: string
  type: string
  enabled: boolean
  order: number
  config: any
}

interface Notice {
  id: string
  text: string
  date: string
}

interface Link {
  id: string
  title: string
  url: string
}

const SECTION_TYPES = [
  { value: "hero", label: "Hero Banner" },
  { value: "notice", label: "Notice Board" },
  { value: "features", label: "Features Grid" },
  { value: "gallery", label: "Image Gallery" },
  { value: "links", label: "Important Links" },
  { value: "text", label: "Text Content" },
  { value: "contact", label: "Contact Information" },
  { value: "stats", label: "Statistics Counter" },
  { value: "testimonials", label: "Testimonials" },
  { value: "custom", label: "Custom HTML" },
]

export default function LandingBuilderPage() {
  const [sections, setSections] = useState<Section[]>([
    { 
      id: "hero-1", 
      name: "Hero Section", 
      type: "hero",
      enabled: true, 
      order: 0,
      config: {
        title: "Welcome to Our University",
        subtitle: "Excellence in Education",
        bgColor: "#1e40af",
        textColor: "#ffffff",
        image: null,
      }
    },
    { 
      id: "notice-1", 
      name: "Notice Board", 
      type: "notice",
      enabled: true, 
      order: 1,
      config: {
        title: "Latest Announcements",
        notices: [] as Notice[],
      }
    },
    { 
      id: "links-1", 
      name: "Important Links", 
      type: "links",
      enabled: true, 
      order: 2,
      config: {
        title: "Important Links",
        links: [] as Link[],
      }
    },
  ])

  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [newSectionType, setNewSectionType] = useState("hero")
  const [draggedSection, setDraggedSection] = useState<string | null>(null)
  const [dragOverSection, setDragOverSection] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverSection(sectionId)
  }

  const handleDragLeave = () => {
    setDragOverSection(null)
  }

  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault()
    setDragOverSection(null)

    if (!draggedSection || draggedSection === targetSectionId) {
      return
    }

    const draggedIndex = sections.findIndex(s => s.id === draggedSection)
    const targetIndex = sections.findIndex(s => s.id === targetSectionId)

    if (draggedIndex === -1 || targetIndex === -1) {
      return
    }

    const newSections = [...sections]
    const [removed] = newSections.splice(draggedIndex, 1)
    newSections.splice(targetIndex, 0, removed)

    // Update order
    newSections.forEach((s, i) => s.order = i)
    setSections(newSections)
    setDraggedSection(null)
  }

  const handleDragEnd = () => {
    setDraggedSection(null)
    setDragOverSection(null)
  }

  const handleSave = () => {
    // TODO: Implement API call to save landing page configuration
    console.log("Saving landing page:", sections)
    alert("Landing page configuration saved successfully!")
  }

  const addSection = () => {
    const newSection: Section = {
      id: `${newSectionType}-${Date.now()}`,
      name: `${SECTION_TYPES.find(t => t.value === newSectionType)?.label || "New Section"} ${sections.length + 1}`,
      type: newSectionType,
      enabled: true,
      order: sections.length,
      config: getDefaultConfig(newSectionType),
    }
    setSections([...sections, newSection])
    setSelectedSection(newSection)
  }

  const getDefaultConfig = (type: string) => {
    switch (type) {
      case "hero":
        return { title: "Title", subtitle: "Subtitle", bgColor: "#1e40af", textColor: "#ffffff", image: null }
      case "notice":
        return { title: "Notices", notices: [] }
      case "links":
        return { title: "Links", links: [] }
      case "features":
        return { title: "Features", items: [] }
      case "text":
        return { title: "Content", content: "", alignment: "left" }
      case "contact":
        return { title: "Contact Us", email: "", phone: "", address: "" }
      case "stats":
        return { title: "Statistics", items: [] }
      case "gallery":
        return { title: "Gallery", images: [] }
      case "testimonials":
        return { title: "Testimonials", items: [] }
      case "custom":
        return { html: "<div>Custom HTML</div>" }
      default:
        return {}
    }
  }

  const deleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id))
    if (selectedSection?.id === id) setSelectedSection(null)
  }

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s))
    if (selectedSection?.id === id) {
      setSelectedSection({ ...selectedSection, ...updates })
    }
  }

  const moveSection = (id: string, direction: "up" | "down") => {
    const index = sections.findIndex(s => s.id === id)
    if (index === -1) return
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === sections.length - 1) return

    const newSections = [...sections]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    ;[newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]]
    
    // Update order
    newSections.forEach((s, i) => s.order = i)
    setSections(newSections)
  }

  const addNotice = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section || section.type !== "notice") return

    const notice: Notice = {
      id: `notice-${Date.now()}`,
      text: "New announcement",
      date: new Date().toISOString().split('T')[0],
    }

    updateSection(sectionId, {
      config: {
        ...section.config,
        notices: [...(section.config.notices || []), notice],
      }
    })
  }

  const removeNotice = (sectionId: string, noticeId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    updateSection(sectionId, {
      config: {
        ...section.config,
        notices: section.config.notices.filter((n: Notice) => n.id !== noticeId),
      }
    })
  }

  const updateNotice = (sectionId: string, noticeId: string, text: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    updateSection(sectionId, {
      config: {
        ...section.config,
        notices: section.config.notices.map((n: Notice) => 
          n.id === noticeId ? { ...n, text } : n
        ),
      }
    })
  }

  const addLink = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section || section.type !== "links") return

    const link: Link = {
      id: `link-${Date.now()}`,
      title: "New Link",
      url: "#",
    }

    updateSection(sectionId, {
      config: {
        ...section.config,
        links: [...(section.config.links || []), link],
      }
    })
  }

  const removeLink = (sectionId: string, linkId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    updateSection(sectionId, {
      config: {
        ...section.config,
        links: section.config.links.filter((l: Link) => l.id !== linkId),
      }
    })
  }

  const updateLink = (sectionId: string, linkId: string, updates: Partial<Link>) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    updateSection(sectionId, {
      config: {
        ...section.config,
        links: section.config.links.map((l: Link) => 
          l.id === linkId ? { ...l, ...updates } : l
        ),
      }
    })
  }

  const renderSectionPreview = (section: Section) => {
    if (!section.enabled) return null

    switch (section.type) {
      case "hero":
        return (
          <div
            className="p-12 text-center"
            style={{
              backgroundColor: section.config.bgColor,
              color: section.config.textColor,
            }}
          >
            <h1 className="text-4xl font-bold mb-4">{section.config.title}</h1>
            <p className="text-xl">{section.config.subtitle}</p>
          </div>
        )
      case "notice":
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">{section.config.title}</h2>
            <div className="space-y-2">
              {section.config.notices?.length > 0 ? (
                section.config.notices.map((notice: Notice) => (
                  <div key={notice.id} className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                    <p className="text-sm">{notice.text}</p>
                    <p className="text-xs text-gray-600 mt-1">{notice.date}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                  <p className="text-sm">Sample notice item</p>
                </div>
              )}
            </div>
          </div>
        )
      case "links":
        return (
          <div className="p-8 bg-gray-50">
            <h2 className="text-2xl font-bold mb-4">{section.config.title}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {section.config.links?.length > 0 ? (
                section.config.links.map((link: Link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    className="p-4 bg-white border rounded hover:shadow-md"
                  >
                    {link.title}
                  </a>
                ))
              ) : (
                <>
                  <a href="#" className="p-4 bg-white border rounded hover:shadow-md">
                    University Website
                  </a>
                  <a href="#" className="p-4 bg-white border rounded hover:shadow-md">
                    Contact Us
                  </a>
                </>
              )}
            </div>
          </div>
        )
      case "text":
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">{section.config.title}</h2>
            <div 
              className="prose max-w-none"
              style={{ textAlign: section.config.alignment }}
              dangerouslySetInnerHTML={{ __html: section.config.content || "Text content goes here..." }}
            />
          </div>
        )
      default:
        return (
          <div className="p-8 bg-gray-100 border-2 border-dashed border-gray-300">
            <p className="text-center text-gray-600">{section.name} - Preview coming soon</p>
          </div>
        )
    }
  }

  const renderSectionEditor = (section: Section) => {
    switch (section.type) {
      case "hero":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={section.config.title}
                onChange={(e) => updateSection(section.id, {
                  config: { ...section.config, title: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={section.config.subtitle}
                onChange={(e) => updateSection(section.id, {
                  config: { ...section.config, subtitle: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={section.config.bgColor}
                  onChange={(e) => updateSection(section.id, {
                    config: { ...section.config, bgColor: e.target.value }
                  })}
                  className="w-20"
                />
                <Input
                  value={section.config.bgColor}
                  onChange={(e) => updateSection(section.id, {
                    config: { ...section.config, bgColor: e.target.value }
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={section.config.textColor}
                  onChange={(e) => updateSection(section.id, {
                    config: { ...section.config, textColor: e.target.value }
                  })}
                  className="w-20"
                />
                <Input
                  value={section.config.textColor}
                  onChange={(e) => updateSection(section.id, {
                    config: { ...section.config, textColor: e.target.value }
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Hero Image</Label>
              <Input type="file" accept="image/*" />
            </div>
          </div>
        )
      case "notice":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input
                value={section.config.title}
                onChange={(e) => updateSection(section.id, {
                  config: { ...section.config, title: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notices</Label>
              {section.config.notices?.map((notice: Notice) => (
                <div key={notice.id} className="flex gap-2 items-start">
                  <Textarea
                    value={notice.text}
                    onChange={(e) => updateNotice(section.id, notice.id, e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeNotice(section.id, notice.id)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => addNotice(section.id)}
                className="w-full"
              >
                + Add Notice
              </Button>
            </div>
          </div>
        )
      case "links":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input
                value={section.config.title}
                onChange={(e) => updateSection(section.id, {
                  config: { ...section.config, title: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Links</Label>
              {section.config.links?.map((link: Link) => (
                <div key={link.id} className="space-y-2 p-3 border rounded">
                  <Input
                    placeholder="Link Title"
                    value={link.title}
                    onChange={(e) => updateLink(section.id, link.id, { title: e.target.value })}
                  />
                  <Input
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => updateLink(section.id, link.id, { url: e.target.value })}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeLink(section.id, link.id)}
                    className="w-full"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => addLink(section.id)}
                className="w-full"
              >
                + Add Link
              </Button>
            </div>
          </div>
        )
      case "text":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input
                value={section.config.title}
                onChange={(e) => updateSection(section.id, {
                  config: { ...section.config, title: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Content (HTML supported)</Label>
              <Textarea
                value={section.config.content}
                onChange={(e) => updateSection(section.id, {
                  config: { ...section.config, content: e.target.value }
                })}
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Text Alignment</Label>
              <select
                value={section.config.alignment}
                onChange={(e) => updateSection(section.id, {
                  config: { ...section.config, alignment: e.target.value }
                })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>
          </div>
        )
      default:
        return (
          <div className="text-sm text-gray-600">
            Editor for {section.type} coming soon...
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Dynamic Landing Page Builder</h1>
              <p className="text-sm text-gray-600">
                Create and customize your university&apos;s public portal with drag-and-drop sections
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save Landing Page</Button>
              <Link href="/admin/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6 h-[calc(100vh-180px)]">
          {/* Left Sidebar - Section Management */}
          <div className="w-72 flex-shrink-0 overflow-y-auto space-y-4 pr-2" style={{ scrollbarWidth: 'thin' }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Section</CardTitle>
                <CardDescription>Choose a section type to add</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <select
                  value={newSectionType}
                  onChange={(e) => setNewSectionType(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  {SECTION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <Button onClick={addSection} className="w-full">
                  + Add Section
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sections</CardTitle>
                <CardDescription>{sections.length} sections • Drag to reorder</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, section.id)}
                    onDragOver={(e) => handleDragOver(e, section.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, section.id)}
                    onDragEnd={handleDragEnd}
                    className={`p-3 border rounded cursor-move transition-all ${
                      selectedSection?.id === section.id
                        ? "bg-blue-50 border-blue-500"
                        : dragOverSection === section.id
                        ? "bg-green-50 border-green-500 border-2"
                        : draggedSection === section.id
                        ? "opacity-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedSection(section)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 cursor-move">⋮⋮</span>
                        <span className="font-medium text-sm">{section.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={section.enabled}
                          onChange={(e) => {
                            e.stopPropagation()
                            updateSection(section.id, { enabled: e.target.checked })
                          }}
                          className="w-4 h-4"
                        />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveSection(section.id, "up")
                        }}
                        disabled={index === 0}
                        className="text-xs px-2 py-1"
                      >
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveSection(section.id, "down")
                        }}
                        disabled={index === sections.length - 1}
                        className="text-xs px-2 py-1"
                      >
                        ↓
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm("Delete this section?")) {
                            deleteSection(section.id)
                          }
                        }}
                        className="text-xs px-2 py-1 ml-auto"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center - Section Editor */}
          <div className="flex-1 min-w-0 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>
                  {selectedSection ? `Edit: ${selectedSection.name}` : "Select a Section"}
                </CardTitle>
                <CardDescription>
                  {selectedSection
                    ? `Configure ${selectedSection.type} section properties`
                    : "Click on a section from the list to edit it"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedSection ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Section Name</Label>
                      <Input
                        value={selectedSection.name}
                        onChange={(e) => updateSection(selectedSection.id, { name: e.target.value })}
                      />
                    </div>
                    <div className="border-t pt-4">
                      {renderSectionEditor(selectedSection)}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-600">
                    <p>No section selected</p>
                    <p className="text-sm mt-2">Select a section from the left to edit its properties</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Live Preview */}
          <div className="w-96 flex-shrink-0 overflow-y-auto pl-2" style={{ scrollbarWidth: 'thin' }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  Preview your landing page in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-white overflow-y-auto">
                  {sections.length === 0 ? (
                    <div className="p-12 text-center text-gray-600">
                      <p>No sections added yet</p>
                      <p className="text-sm mt-2">Add sections to see the preview</p>
                    </div>
                  ) : (
                    <>
                      {sections.map((section) => (
                        <div key={section.id}>
                          {renderSectionPreview(section)}
                        </div>
                      ))}
                      {/* Always show search section */}
                      <div className="p-8 bg-gray-50">
                        <div className="max-w-md mx-auto">
                          <h2 className="text-2xl font-bold mb-4 text-center">
                            Search Your Document
                          </h2>
                          <div className="bg-white p-4 rounded-lg shadow">
                            <input
                              type="text"
                              placeholder="Enter Roll Number"
                              className="w-full px-4 py-2 border rounded mb-2"
                              disabled
                            />
                            <button className="w-full bg-blue-600 text-white py-2 rounded">
                              Search
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
