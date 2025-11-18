"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface University {
  id: string
  name: string
  subdomain: string
  slug: string
  isActive: boolean
  createdAt: string
  _count: {
    admins: number
    students: number
    templates: number
    documents: number
  }
}

export default function SuperAdminDashboard() {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    slug: "",
    adminEmail: "",
    adminPassword: "",
    adminName: "",
  })
  const router = useRouter()

  useEffect(() => {
    fetchUniversities()
  }, [])

  const fetchUniversities = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/superadmin/login")
        return
      }

      const response = await fetch("/api/university/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUniversities(data.universities || [])
      } else {
        router.push("/superadmin/login")
      }
    } catch (error) {
      console.error("Error fetching universities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUniversity = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/university/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowCreateForm(false)
        setFormData({
          name: "",
          subdomain: "",
          slug: "",
          adminEmail: "",
          adminPassword: "",
          adminName: "",
        })
        fetchUniversities()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to create university")
      }
    } catch (error) {
      console.error("Error creating university:", error)
      alert("An error occurred")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/superadmin/login")
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
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Manage all universities</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Universities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{universities.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {universities.reduce((acc, u) => acc + u._count.students, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {universities.reduce((acc, u) => acc + u._count.templates, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {universities.reduce((acc, u) => acc + u._count.documents, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <Button onClick={() => setShowCreateForm(true)} size="lg">
            + Create New University
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New University</CardTitle>
              <CardDescription>
                Set up a new university with admin account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUniversity} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">University Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subdomain">Subdomain</Label>
                    <Input
                      id="subdomain"
                      value={formData.subdomain}
                      onChange={(e) =>
                        setFormData({ ...formData, subdomain: e.target.value })
                      }
                      placeholder="university"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Admin Name</Label>
                    <Input
                      id="adminName"
                      value={formData.adminName}
                      onChange={(e) =>
                        setFormData({ ...formData, adminName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, adminEmail: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Admin Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={formData.adminPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adminPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">Create University</Button>
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

        {/* Universities List */}
        <Card>
          <CardHeader>
            <CardTitle>Universities</CardTitle>
            <CardDescription>Manage all universities in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {universities.map((university) => (
                <div
                  key={university.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{university.name}</h3>
                      <p className="text-sm text-gray-600">
                        Subdomain: {university.subdomain}
                      </p>
                      <div className="flex space-x-4 mt-2 text-sm text-gray-600">
                        <span>{university._count.admins} Admins</span>
                        <span>{university._count.students} Students</span>
                        <span>{university._count.templates} Templates</span>
                        <span>{university._count.documents} Documents</span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          university.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {university.isActive ? "Active" : "Inactive"}
                      </span>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {universities.length === 0 && (
                <div className="text-center py-8 text-gray-600">
                  No universities created yet. Create your first university to get
                  started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
