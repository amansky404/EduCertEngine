"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import "quill/dist/quill.snow.css"

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

interface HtmlEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  theme?: "snow" | "bubble"
  height?: number
}

/**
 * HtmlEditor - A WYSIWYG rich text editor component using Quill.js
 * 
 * Features:
 * - Rich text editing with formatting options
 * - HTML content support
 * - Image upload and embedding
 * - Link insertion
 * - Code blocks and syntax highlighting
 * - Tables, lists, and more
 * 
 * @param value - The HTML content to display/edit
 * @param onChange - Callback function when content changes
 * @param placeholder - Placeholder text when editor is empty
 * @param readOnly - Whether the editor is read-only
 * @param theme - Editor theme ('snow' or 'bubble')
 * @param height - Editor height in pixels (default: 300)
 */
export function HtmlEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  readOnly = false,
  theme = "snow",
  height = 300,
}: HtmlEditorProps) {
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Quill editor configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false,
    },
  }

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "list",
    "bullet",
    "indent",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ]

  // Don't render on server side
  if (!mounted) {
    return (
      <div
        className="border rounded p-4 bg-gray-50"
        style={{ minHeight: `${height}px` }}
      >
        <p className="text-gray-500 text-sm">Loading editor...</p>
      </div>
    )
  }

  return (
    <div className="html-editor-wrapper">
      <ReactQuill
        theme={theme}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={modules}
        formats={formats}
        style={{ height: `${height}px` }}
      />
      <style jsx global>{`
        .html-editor-wrapper .ql-container {
          min-height: ${height - 42}px;
          font-family: inherit;
        }
        .html-editor-wrapper .ql-editor {
          min-height: ${height - 42}px;
          font-size: 14px;
        }
        .html-editor-wrapper .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
        .html-editor-wrapper .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          background-color: #f9fafb;
        }
        .html-editor-wrapper .ql-container {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
        .html-editor-wrapper .ql-editor p,
        .html-editor-wrapper .ql-editor ol,
        .html-editor-wrapper .ql-editor ul,
        .html-editor-wrapper .ql-editor pre,
        .html-editor-wrapper .ql-editor blockquote,
        .html-editor-wrapper .ql-editor h1,
        .html-editor-wrapper .ql-editor h2,
        .html-editor-wrapper .ql-editor h3,
        .html-editor-wrapper .ql-editor h4,
        .html-editor-wrapper .ql-editor h5,
        .html-editor-wrapper .ql-editor h6 {
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  )
}
