import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "EduCertSuite - Multi-University Document Management",
  description: "Generate, manage, and verify academic documents at scale",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
