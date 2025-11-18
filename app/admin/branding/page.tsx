"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function BrandingPage() {
  const [branding, setBranding] = useState({
    logo: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    headerImage: "",
    footerImage: "",
    stampImage: "",
    signatureImage: "",
    watermark: "",
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchBranding()
  }, [])

  const fetchBranding = async () => {
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
          setBranding({
            logo: uni.logo || "",
            primaryColor: uni.primaryColor,
            secondaryColor: uni.secondaryColor,
            headerImage: uni.headerImage || "",
            footerImage: uni.footerImage || "",
            stampImage: uni.stampImage || "",
            signatureImage: uni.signatureImage || "",
            watermark: uni.watermark || "",
          })
        }
      }
    } catch (error) {
      console.error("Error fetching branding:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    alert("Branding settings saved! (API integration needed)")
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
              <h1 className="text-2xl font-bold">Branding</h1>
              <p className="text-sm text-gray-600">
                Customize your university's visual identity
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
        <form onSubmit={handleSave} className="space-y-6">
          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>
                Define your university's color scheme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) =>
                        setBranding({ ...branding, primaryColor: e.target.value })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={branding.primaryColor}
                      onChange={(e) =>
                        setBranding({ ...branding, primaryColor: e.target.value })
                      }
                      placeholder="#3b82f6"
                    />
                  </div>
                  <div
                    className="h-10 rounded border"
                    style={{ backgroundColor: branding.primaryColor }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) =>
                        setBranding({ ...branding, secondaryColor: e.target.value })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={branding.secondaryColor}
                      onChange={(e) =>
                        setBranding({ ...branding, secondaryColor: e.target.value })
                      }
                      placeholder="#1e40af"
                    />
                  </div>
                  <div
                    className="h-10 rounded border"
                    style={{ backgroundColor: branding.secondaryColor }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Assets</CardTitle>
              <CardDescription>
                Upload logos, stamps, and signatures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">University Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      // Handle file upload
                      console.log("Logo upload:", e.target.files)
                    }}
                  />
                  <p className="text-sm text-gray-600">
                    Recommended size: 200x200px
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stamp">Official Stamp</Label>
                  <Input
                    id="stamp"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      console.log("Stamp upload:", e.target.files)
                    }}
                  />
                  <p className="text-sm text-gray-600">
                    Transparent PNG recommended
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signature">Signature</Label>
                  <Input
                    id="signature"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      console.log("Signature upload:", e.target.files)
                    }}
                  />
                  <p className="text-sm text-gray-600">
                    Authority signature image
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="watermark">Watermark</Label>
                  <Input
                    id="watermark"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      console.log("Watermark upload:", e.target.files)
                    }}
                  />
                  <p className="text-sm text-gray-600">
                    Background watermark for documents
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Header & Footer */}
          <Card>
            <CardHeader>
              <CardTitle>Document Header & Footer</CardTitle>
              <CardDescription>
                Custom header and footer images for documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="header">Header Image</Label>
                  <Input
                    id="header"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      console.log("Header upload:", e.target.files)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer">Footer Image</Label>
                  <Input
                    id="footer"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      console.log("Footer upload:", e.target.files)
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg">
            Save Branding Settings
          </Button>
        </form>
      </main>
    </div>
  )
}
