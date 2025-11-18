"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface University {
  id: string
  name: string
  subdomain: string
  qrEnabled: boolean
  _count: {
    students: number
    templates: number
    documents: number
  }
}

export default function AdminDashboard() {
  const [university, setUniversity] = useState<University | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUniversityData()
  }, [])

  const fetchUniversityData = async () => {
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
          setUniversity(data.universities[0])
        }
      } else {
        router.push("/admin/login")
      }
    } catch (error) {
      console.error("Error fetching university data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/admin/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!university) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">No university data found</div>
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
              <h1 className="text-2xl font-bold">{university.name}</h1>
              <p className="text-sm text-gray-600">Admin Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {university.subdomain}.educertsuite.com
              </span>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            <Link
              href="/admin/dashboard"
              className="py-4 border-b-2 border-blue-600 text-blue-600 font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/settings"
              className="py-4 text-gray-600 hover:text-gray-900"
            >
              Settings
            </Link>
            <Link
              href="/admin/branding"
              className="py-4 text-gray-600 hover:text-gray-900"
            >
              Branding
            </Link>
            <Link
              href="/admin/templates"
              className="py-4 text-gray-600 hover:text-gray-900"
            >
              Templates
            </Link>
            <Link
              href="/admin/csv-creator"
              className="py-4 text-gray-600 hover:text-gray-900"
            >
              CSV Creator
            </Link>
            <Link
              href="/admin/students"
              className="py-4 text-gray-600 hover:text-gray-900"
            >
              Students
            </Link>
            <Link
              href="/admin/seo"
              className="py-4 text-gray-600 hover:text-gray-900"
            >
              SEO
            </Link>
            <Link
              href="/admin/landing-builder"
              className="py-4 text-gray-600 hover:text-gray-900"
            >
              Landing Page
            </Link>
            <Link
              href="/admin/uploads"
              className="py-4 text-gray-600 hover:text-gray-900"
            >
              File Manager
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{university._count.students}</div>
              <p className="text-xs text-gray-500 mt-1">Registered students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{university._count.templates}</div>
              <p className="text-xs text-gray-500 mt-1">Document templates</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Documents Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{university._count.documents}</div>
              <p className="text-xs text-gray-500 mt-1">Total documents</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Link href="/admin/templates">
                <Button className="w-full" variant="outline">
                  Create Template
                </Button>
              </Link>
              <Link href="/admin/students">
                <Button className="w-full" variant="outline">
                  Import Students
                </Button>
              </Link>
              <Link href="/admin/csv-creator">
                <Button className="w-full" variant="outline">
                  CSV Creator
                </Button>
              </Link>
              <Link href="/admin/branding">
                <Button className="w-full" variant="outline">
                  Update Branding
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">System initialized</p>
                  <p className="text-sm text-gray-600">
                    University account created successfully
                  </p>
                </div>
                <span className="text-sm text-gray-500">Just now</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
