import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import prisma from "@/lib/prisma"

interface UniversityLandingPageProps {
  subdomain: string
}

export default async function UniversityLandingPage({ subdomain }: UniversityLandingPageProps) {
  // Fetch university data
  const university = await prisma.university.findUnique({
    where: { subdomain },
    select: {
      id: true,
      name: true,
      subdomain: true,
      logo: true,
      primaryColor: true,
      secondaryColor: true,
      headerImage: true,
      seoTitle: true,
      seoDescription: true,
      landingPageData: true,
      isActive: true,
    },
  })

  // If university doesn't exist or is inactive
  if (!university || !university.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>University Not Found</CardTitle>
            <CardDescription>
              The university you're looking for doesn't exist or is not active.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Go to Main Site</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Parse landing page data if exists
  let landingData: any = null
  if (university.landingPageData) {
    try {
      landingData = JSON.parse(university.landingPageData)
    } catch (e) {
      console.error("Failed to parse landing page data:", e)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header 
        className="border-b bg-white/80 backdrop-blur-sm"
        style={{ 
          backgroundColor: university.primaryColor ? `${university.primaryColor}15` : undefined 
        }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {university.logo ? (
              <img 
                src={university.logo} 
                alt={university.name} 
                className="h-12 w-12 object-contain"
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: university.primaryColor }}
              >
                {university.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-xl font-bold">{university.name}</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/result" className="text-gray-600 hover:text-gray-900">Search Documents</Link>
            <Link href="/verify" className="text-gray-600 hover:text-gray-900">Verify</Link>
          </nav>
          <div className="space-x-4">
            <Link href="/admin/login">
              <Button 
                variant="outline"
                style={{ 
                  borderColor: university.primaryColor,
                  color: university.primaryColor
                }}
              >
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        {university.headerImage && (
          <div className="mb-8">
            <img 
              src={university.headerImage} 
              alt={university.name}
              className="mx-auto max-h-32 object-contain"
            />
          </div>
        )}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          {landingData?.heroTitle || `Welcome to ${university.name}`}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {landingData?.heroSubtitle || university.seoDescription || 
           "Access your academic documents, certificates, and marksheets online"}
        </p>
        <div className="space-x-4">
          <Link href="/result">
            <Button 
              size="lg" 
              className="text-lg px-8"
              style={{ backgroundColor: university.primaryColor }}
            >
              Search Your Documents
            </Button>
          </Link>
          <Link href="/verify">
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8"
              style={{ 
                borderColor: university.primaryColor,
                color: university.primaryColor
              }}
            >
              Verify Document
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Quick Access</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Search Documents</CardTitle>
              <CardDescription>
                Find your certificates and marksheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Search using your roll number, registration number, mobile number, or date of birth.
              </p>
              <Link href="/result">
                <Button 
                  className="w-full"
                  style={{ backgroundColor: university.primaryColor }}
                >
                  Search Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Verify Documents</CardTitle>
              <CardDescription>
                Authenticate certificates using QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Scan the QR code on your document or enter the verification code to check authenticity.
              </p>
              <Link href="/verify">
                <Button 
                  variant="outline"
                  className="w-full"
                  style={{ 
                    borderColor: university.primaryColor,
                    color: university.primaryColor
                  }}
                >
                  Verify Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Download & Print</CardTitle>
              <CardDescription>
                Get your documents anytime, anywhere
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Download your documents in PDF format and print them whenever needed.
              </p>
              <Link href="/result">
                <Button 
                  variant="outline"
                  className="w-full"
                  style={{ 
                    borderColor: university.primaryColor,
                    color: university.primaryColor
                  }}
                >
                  Get Documents
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      {landingData?.aboutSection && (
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-8">
                {landingData.aboutSection.title || "About Us"}
              </h2>
              <div className="prose prose-lg mx-auto text-gray-600">
                <p>{landingData.aboutSection.content}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer 
        className="bg-gray-900 text-white py-12"
        style={{ 
          backgroundColor: university.primaryColor ? `${university.primaryColor}ee` : undefined 
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">{university.name}</h4>
              <p className="text-gray-300 text-sm">
                {university.seoDescription || "Official document portal"}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/result" className="hover:text-white">Search Documents</Link></li>
                <li><Link href="/verify" className="hover:text-white">Verify</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/admin/login" className="hover:text-white">Admin Login</Link></li>
                <li>Help & FAQ</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300 text-sm">
            © {new Date().getFullYear()} {university.name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
