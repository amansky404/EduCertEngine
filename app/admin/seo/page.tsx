"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SeoPage() {
  const [seoData, setSeoData] = useState({
    title: "",
    description: "",
    keywords: "",
    ogImage: "",
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchSeoData()
  }, [])

  const fetchSeoData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/admin/login")
        return
      }

      const response = await fetch("/api/university/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.universities && data.universities.length > 0) {
          const uni = data.universities[0]
          setSeoData({
            title: uni.seoTitle || "",
            description: uni.seoDescription || "",
            keywords: uni.seoKeywords || "",
            ogImage: uni.seoOgImage || "",
          })
        }
      }
    } catch (error) {
      console.error("Error fetching SEO data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    alert("SEO settings saved! (API integration needed)")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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
              <h1 className="text-2xl font-bold">SEO Settings</h1>
              <p className="text-sm text-gray-600">
                Optimize your university portal for search engines
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
        <div className="max-w-3xl">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Basic SEO */}
            <Card>
              <CardHeader>
                <CardTitle>Basic SEO</CardTitle>
                <CardDescription>
                  Configure title, description, and keywords
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    value={seoData.title}
                    onChange={(e) =>
                      setSeoData({ ...seoData, title: e.target.value })
                    }
                    placeholder="University Name - Student Portal"
                    maxLength={60}
                  />
                  <p className="text-sm text-gray-600">
                    {seoData.title.length}/60 characters (recommended: 50-60)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Meta Description</Label>
                  <Textarea
                    id="description"
                    value={seoData.description}
                    onChange={(e) =>
                      setSeoData({ ...seoData, description: e.target.value })
                    }
                    placeholder="Access your academic documents, certificates, and marksheets online"
                    maxLength={160}
                    rows={3}
                  />
                  <p className="text-sm text-gray-600">
                    {seoData.description.length}/160 characters (recommended: 150-160)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={seoData.keywords}
                    onChange={(e) =>
                      setSeoData({ ...seoData, keywords: e.target.value })
                    }
                    placeholder="university, certificates, marksheets, degrees, documents"
                  />
                  <p className="text-sm text-gray-600">
                    Comma-separated keywords
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Open Graph */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media (Open Graph)</CardTitle>
                <CardDescription>
                  Configure how your site appears when shared on social media
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ogImage">OG Image URL</Label>
                  <Input
                    id="ogImage"
                    value={seoData.ogImage}
                    onChange={(e) =>
                      setSeoData({ ...seoData, ogImage: e.target.value })
                    }
                    placeholder="https://example.com/og-image.jpg"
                  />
                  <p className="text-sm text-gray-600">
                    Recommended size: 1200x630px
                  </p>
                </div>

                {seoData.ogImage && (
                  <div className="border rounded p-4">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <div className="border rounded overflow-hidden max-w-md">
                      <img
                        src={seoData.ogImage}
                        alt="OG Preview"
                        className="w-full"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'%3E%3Crect fill='%23ddd' width='1200' height='630'/%3E%3Ctext fill='%23666' font-family='sans-serif' font-size='48' x='50%25' y='50%25' text-anchor='middle'%3EImage Not Found%3C/text%3E%3C/svg%3E"
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Robots.txt and sitemap configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-100 p-4 rounded">
                  <h4 className="font-semibold mb-2">Robots.txt</h4>
                  <code className="text-sm block whitespace-pre">
                    {`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://youruniversity.educertsuite.com/sitemap.xml`}
                  </code>
                </div>

                <div className="bg-gray-100 p-4 rounded">
                  <h4 className="font-semibold mb-2">Sitemap Generation</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Sitemap is automatically generated and includes:
                  </p>
                  <ul className="text-sm text-gray-700 list-disc list-inside">
                    <li>Homepage</li>
                    <li>Public student portal</li>
                    <li>All published documents (excluding private data)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg">
              Save SEO Settings
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
