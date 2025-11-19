"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function LandingBuilderPage() {
  const [sections, setSections] = useState([
    { id: "hero", name: "Hero Section", enabled: true },
    { id: "notice", name: "Notice Board", enabled: true },
    { id: "features", name: "Features", enabled: false },
    { id: "gallery", name: "Gallery", enabled: false },
    { id: "links", name: "Important Links", enabled: true },
  ])

  const [landingData, setLandingData] = useState({
    heroTitle: "Welcome to Our University",
    heroSubtitle: "Excellence in Education",
    noticeTitle: "Latest Announcements",
    notices: [] as string[],
  })

  const handleSave = () => {
    alert("Landing page configuration saved! (API integration needed)")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Landing Page Builder</h1>
              <p className="text-sm text-gray-600">
                Customize your university&apos;s public portal
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Sections</CardTitle>
                <CardDescription>
                  Enable/disable sections on your landing page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <span className="font-medium">{section.name}</span>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={(e) => {
                          setSections(
                            sections.map((s) =>
                              s.id === section.id
                                ? { ...s, enabled: e.target.checked }
                                : s
                            )
                          )
                        }}
                        className="w-4 h-4"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {section.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Main banner content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Title</Label>
                  <Input
                    id="heroTitle"
                    value={landingData.heroTitle}
                    onChange={(e) =>
                      setLandingData({
                        ...landingData,
                        heroTitle: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Subtitle</Label>
                  <Input
                    id="heroSubtitle"
                    value={landingData.heroSubtitle}
                    onChange={(e) =>
                      setLandingData({
                        ...landingData,
                        heroSubtitle: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroImage">Hero Image</Label>
                  <Input id="heroImage" type="file" accept="image/*" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notice Board</CardTitle>
                <CardDescription>Important announcements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="noticeTitle">Section Title</Label>
                  <Input
                    id="noticeTitle"
                    value={landingData.noticeTitle}
                    onChange={(e) =>
                      setLandingData({
                        ...landingData,
                        noticeTitle: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Add Notice</Label>
                  <Textarea
                    placeholder="Enter announcement text"
                    rows={3}
                  />
                  <Button size="sm">+ Add Notice</Button>
                </div>
                <div className="space-y-2">
                  <Label>Current Notices</Label>
                  <div className="text-sm text-gray-600">
                    No notices added yet
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSave} size="lg" className="w-full">
              Save Landing Page
            </Button>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  Preview how your landing page will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-white">
                  {/* Hero Preview */}
                  {sections.find((s) => s.id === "hero")?.enabled && (
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-12 text-center">
                      <h1 className="text-4xl font-bold mb-4">
                        {landingData.heroTitle}
                      </h1>
                      <p className="text-xl">{landingData.heroSubtitle}</p>
                    </div>
                  )}

                  {/* Search Section */}
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

                  {/* Notice Board Preview */}
                  {sections.find((s) => s.id === "notice")?.enabled && (
                    <div className="p-8">
                      <h2 className="text-2xl font-bold mb-4">
                        {landingData.noticeTitle}
                      </h2>
                      <div className="space-y-2">
                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                          <p className="text-sm">Sample notice item</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Links Preview */}
                  {sections.find((s) => s.id === "links")?.enabled && (
                    <div className="p-8 bg-gray-50">
                      <h2 className="text-2xl font-bold mb-4">
                        Important Links
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        <a
                          href="#"
                          className="p-4 bg-white border rounded hover:shadow-md"
                        >
                          University Website
                        </a>
                        <a
                          href="#"
                          className="p-4 bg-white border rounded hover:shadow-md"
                        >
                          Contact Us
                        </a>
                      </div>
                    </div>
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
