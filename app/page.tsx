import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { headers } from "next/headers"
import UniversityLandingPage from "@/components/UniversityLandingPage"

export default async function HomePage() {
  // Get subdomain from headers
  const headersList = await headers()
  const subdomain = headersList.get('x-subdomain')

  // If subdomain exists, show university-specific landing page
  if (subdomain) {
    return <UniversityLandingPage subdomain={subdomain} />
  }

  // Otherwise show main platform landing page
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              EC
            </div>
            <span className="text-xl font-bold">EduCertSuite</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
          </nav>
          <div className="space-x-4">
            <Link href="/admin/login">
              <Button variant="outline">Admin Login</Button>
            </Link>
            <Link href="/superadmin/login">
              <Button>Super Admin</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Multi-University Document
          <br />
          <span className="text-blue-600">Generation Platform</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Generate, manage, verify, and distribute certificates, marksheets, and academic documents at scale with custom branding and QR verification.
        </p>
        <div className="space-x-4">
          <Link href="/superadmin/register">
            <Button size="lg" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
          <Link href="#demo">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Watch Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Tenant Architecture</CardTitle>
              <CardDescription>
                Create unlimited universities with custom subdomains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Auto subdomain routing</li>
                <li>✓ Custom branding per university</li>
                <li>✓ Isolated data management</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Builder</CardTitle>
              <CardDescription>
                Three powerful ways to create documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ HTML drag & drop builder</li>
                <li>✓ PDF/JPEG field mapper</li>
                <li>✓ Direct upload mode</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Verification</CardTitle>
              <CardDescription>
                Secure document verification system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Toggle ON/OFF per university</li>
                <li>✓ Template-level control</li>
                <li>✓ Instant verification</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CSV Import</CardTitle>
              <CardDescription>
                Bulk student data management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Dynamic CSV creator</li>
                <li>✓ Unlimited custom fields</li>
                <li>✓ Auto document generation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Portal</CardTitle>
              <CardDescription>
                Self-service document access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Search by roll/mobile/DOB</li>
                <li>✓ Download & print</li>
                <li>✓ Share functionality</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO & Landing Pages</CardTitle>
              <CardDescription>
                Build custom university pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Drag & drop page builder</li>
                <li>✓ SEO optimization</li>
                <li>✓ Custom branding</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Create University</h3>
                <p className="text-gray-600">
                  Super admin creates a new university with subdomain and branding
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Design Templates</h3>
                <p className="text-gray-600">
                  Build document templates using HTML builder, PDF mapper, or direct upload
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Import Students</h3>
                <p className="text-gray-600">
                  Upload CSV with student data and auto-generate documents
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Students Access Documents</h3>
                <p className="text-gray-600">
                  Students search and download their documents via the university portal
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">EduCertSuite</h4>
              <p className="text-gray-400 text-sm">
                Modern multi-university document management platform
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About</li>
                <li>Contact</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2024 EduCertSuite. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
