"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function StudentPortalPage() {
  const [searchType, setSearchType] = useState<"roll" | "mobile" | "dob">("roll")
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">Student Portal</h1>
          <p className="text-center text-gray-600 mt-2">
            Search and download your documents
          </p>
        </div>
      </header>

      {/* Search Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Search Your Document</CardTitle>
              <CardDescription>
                Enter your details to find and download your document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Search Type Selection */}
                <div className="space-y-2">
                  <Label>Search By</Label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setSearchType("roll")}
                      className={`px-4 py-2 rounded border ${
                        searchType === "roll"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      Roll Number
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchType("mobile")}
                      className={`px-4 py-2 rounded border ${
                        searchType === "mobile"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      Mobile
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchType("dob")}
                      className={`px-4 py-2 rounded border ${
                        searchType === "dob"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      Date of Birth
                    </button>
                  </div>
                </div>

                {/* Search Input */}
                <div className="space-y-2">
                  <Label htmlFor="searchValue">
                    {searchType === "roll" && "Roll Number"}
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
                        : searchType === "mobile"
                        ? "Enter your mobile number"
                        : "Select your date of birth"
                    }
                    required
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Searching..." : "Search"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Result Display */}
          {result && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Document Found</CardTitle>
                <CardDescription>Your document details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{result.student.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Roll Number</p>
                    <p className="font-semibold">{result.student.rollNo}</p>
                  </div>
                  {result.student.regNo && (
                    <div>
                      <p className="text-sm text-gray-600">Registration Number</p>
                      <p className="font-semibold">{result.student.regNo}</p>
                    </div>
                  )}
                </div>

                {result.documents && result.documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Available Documents</h4>
                    {result.documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          <Button size="sm">Download</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
