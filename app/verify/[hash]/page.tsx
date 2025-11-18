"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [document, setDocument] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params?.hash) {
      verifyDocument(params.hash as string)
    }
  }, [params])

  const verifyDocument = async (hash: string) => {
    try {
      const response = await fetch(`/api/verify/${hash}`)

      if (response.ok) {
        const data = await response.json()
        setDocument(data)
      } else {
        const data = await response.json()
        setError(data.error || "Document not found or invalid")
      }
    } catch (err) {
      setError("An error occurred while verifying the document")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verifying document...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Verification Failed</CardTitle>
            <CardDescription>Unable to verify this document</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-red-800">{error}</p>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              This could be due to:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside mt-2">
              <li>Invalid or expired verification code</li>
              <li>Document has been revoked</li>
              <li>Incorrect QR code scan</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (document) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              Document Verified ✓
            </h1>
            <p className="text-gray-600">
              This document is authentic and issued by {document.university?.name || "the institution"}
            </p>
          </div>

          {/* Document Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
              <CardDescription>Verified document details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Document Type</p>
                  <p className="font-semibold">{document.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Issue Date</p>
                  <p className="font-semibold">
                    {document.publishedAt ? new Date(document.publishedAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Student Name</p>
                  <p className="font-semibold">{document.student?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Roll Number</p>
                  <p className="font-semibold">{document.student?.rollNo || "N/A"}</p>
                </div>
                {document.student?.regNo && (
                  <div>
                    <p className="text-sm text-gray-600">Registration Number</p>
                    <p className="font-semibold">{document.student.regNo}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Verification Code</p>
                  <p className="font-mono text-sm">{params?.hash}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* University Details */}
          {document.university && (
            <Card>
              <CardHeader>
                <CardTitle>Issuing Institution</CardTitle>
                <CardDescription>Verified by</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  {document.university.logo && (
                    <img
                      src={document.university.logo}
                      alt={document.university.name}
                      className="w-16 h-16 object-contain"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-lg">{document.university.name}</p>
                    <p className="text-sm text-gray-600">
                      {document.university.subdomain}.educertsuite.com
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer Note */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              This verification was performed on{" "}
              {new Date().toLocaleString()}
            </p>
            <p className="mt-2">
              For any queries, please contact the issuing institution
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
