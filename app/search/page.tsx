"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Download, Eye, CheckCircle } from "lucide-react"

export default function StudentSearchPage() {
  const [searchType, setSearchType] = useState<"roll" | "reg" | "mobile" | "dob">("roll")
  const [searchValue, setSearchValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const subdomain = window.location.hostname.split(".")[0]
      const response = await fetch(
        `/api/student/search?type=${searchType}&value=${encodeURIComponent(searchValue)}&subdomain=${subdomain}`
      )

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        const data = await response.json()
        setError(data.error || "Student not found")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (docId: string, title: string) => {
    try {
      // Placeholder for actual download functionality
      alert(`Download functionality for "${title}" will be implemented with PDF generation`)
    } catch (err) {
      alert("Failed to download document")
    }
  }

  const handleView = async (docId: string) => {
    try {
      // Placeholder for actual view functionality
      alert("View functionality will be implemented with PDF generation")
    } catch (err) {
      alert("Failed to view document")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Document Portal</h1>
              <p className="text-gray-600 mt-2">
                Search, view, and download your academic documents
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Search Card */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Search Your Documents
              </CardTitle>
              <CardDescription>
                Enter your details to find and access your academic documents
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-6">
                {/* Search Type Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Search By</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setSearchType("roll")}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        searchType === "roll"
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      Roll Number
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchType("reg")}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        searchType === "reg"
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      Reg Number
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchType("mobile")}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        searchType === "mobile"
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      Mobile
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchType("dob")}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        searchType === "dob"
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      Date of Birth
                    </button>
                  </div>
                </div>

                {/* Search Input */}
                <div className="space-y-2">
                  <Label htmlFor="searchValue" className="text-base font-semibold">
                    {searchType === "roll" && "Roll Number"}
                    {searchType === "reg" && "Registration Number"}
                    {searchType === "mobile" && "Mobile Number"}
                    {searchType === "dob" && "Date of Birth"}
                  </Label>
                  <Input
                    id="searchValue"
                    type={searchType === "dob" ? "date" : "text"}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={
                      searchType === "roll"
                        ? "Enter your roll number"
                        : searchType === "reg"
                        ? "Enter your registration number"
                        : searchType === "mobile"
                        ? "Enter your mobile number"
                        : "Select your date of birth"
                    }
                    className="h-12 text-base"
                    required
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold" 
                  disabled={loading}
                >
                  {loading ? "Searching..." : "Search Documents"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Result Display */}
          {result && (
            <div className="mt-8 space-y-6">
              {/* Student Information Card */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Student Found
                  </CardTitle>
                  <CardDescription>Your information on record</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Full Name</p>
                      <p className="font-semibold text-lg">{result.student.name}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Roll Number</p>
                      <p className="font-semibold text-lg">{result.student.rollNo}</p>
                    </div>
                    {result.student.regNo && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Registration Number</p>
                        <p className="font-semibold text-lg">{result.student.regNo}</p>
                      </div>
                    )}
                    {result.student.email && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="font-semibold text-lg">{result.student.email}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Documents Card */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Available Documents</CardTitle>
                  <CardDescription>
                    {result.documents && result.documents.length > 0
                      ? `You have ${result.documents.length} document(s) available`
                      : "No documents available yet"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result.documents && result.documents.length > 0 ? (
                    <div className="space-y-3">
                      {result.documents.map((doc: any) => (
                        <div
                          key={doc.id}
                          className="flex flex-col md:flex-row md:justify-between md:items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3 mb-3 md:mb-0">
                            <FileText className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-lg text-gray-900">{doc.title}</p>
                              <p className="text-sm text-gray-600">
                                Template: {doc.template?.name || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-500">
                                Generated: {new Date(doc.createdAt).toLocaleDateString()}
                              </p>
                              {doc.isPublished && (
                                <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  Published
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleView(doc.id)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleDownload(doc.id, doc.title)}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">No documents available yet</p>
                      <p className="text-sm">Your documents will appear here once they are generated</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} EduCertEngine. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center gap-4 text-sm text-gray-400">
            <Link href="/verify" className="hover:text-white">Verify Document</Link>
            <span>•</span>
            <Link href="/admin/login" className="hover:text-white">Admin Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
