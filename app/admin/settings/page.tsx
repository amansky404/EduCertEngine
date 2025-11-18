"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    universityName: "",
    subdomain: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    qrEnabled: true,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
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
          setSettings({
            universityName: uni.name,
            subdomain: uni.subdomain,
            primaryColor: uni.primaryColor,
            secondaryColor: uni.secondaryColor,
            qrEnabled: uni.qrEnabled,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/university/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert("Settings updated successfully!")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update settings")
      }
    } catch (error) {
      console.error("Error updating settings:", error)
      alert("An error occurred")
    }
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
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-sm text-gray-600">
                Manage university settings
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
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure your university settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* University Name */}
              <div className="space-y-2">
                <Label htmlFor="universityName">University Name</Label>
                <Input
                  id="universityName"
                  value={settings.universityName}
                  onChange={(e) =>
                    setSettings({ ...settings, universityName: e.target.value })
                  }
                  required
                />
              </div>

              {/* Subdomain (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <Input
                  id="subdomain"
                  value={settings.subdomain}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-600">
                  Your university is accessible at: {settings.subdomain}.educertsuite.com
                </p>
              </div>

              {/* Colors */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) =>
                        setSettings({ ...settings, primaryColor: e.target.value })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) =>
                        setSettings({ ...settings, primaryColor: e.target.value })
                      }
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) =>
                        setSettings({ ...settings, secondaryColor: e.target.value })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) =>
                        setSettings({ ...settings, secondaryColor: e.target.value })
                      }
                      placeholder="#1e40af"
                    />
                  </div>
                </div>
              </div>

              {/* QR Settings */}
              <div className="space-y-2">
                <Label>QR Code Verification</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="qrEnabled"
                    checked={settings.qrEnabled}
                    onChange={(e) =>
                      setSettings({ ...settings, qrEnabled: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="qrEnabled">
                    Enable QR code verification for all documents
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  When enabled, documents will include QR codes for verification.
                  You can still disable QR codes for specific templates.
                </p>
              </div>

              <Button type="submit">Save Settings</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
