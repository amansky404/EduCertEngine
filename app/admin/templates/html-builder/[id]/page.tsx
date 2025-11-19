"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { fabric } from "fabric"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function HtmlBuilderPage() {
  const params = useParams()
  const templateId = params.id as string
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [template, setTemplate] = useState<any>(null)
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null)
  const [loading, setLoading] = useState(true)

  // Element properties
  const [textValue, setTextValue] = useState("")
  const [fontSize, setFontSize] = useState(20)
  const [fontFamily, setFontFamily] = useState("Arial")
  const [textColor, setTextColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#ffffff")

  useEffect(() => {
    fetchTemplate()
  }, [templateId])

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
      })

      fabricCanvas.on("selection:created", (e) => {
        setSelectedObject(e.selected?.[0] || null)
        updatePropertiesFromSelection(e.selected?.[0])
      })

      fabricCanvas.on("selection:updated", (e) => {
        setSelectedObject(e.selected?.[0] || null)
        updatePropertiesFromSelection(e.selected?.[0])
      })

      fabricCanvas.on("selection:cleared", () => {
        setSelectedObject(null)
      })

      setCanvas(fabricCanvas)
    }
  }, [canvasRef, canvas])

  const fetchTemplate = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/admin/login")
        return
      }

      const response = await fetch(`/api/template/get/${templateId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTemplate(data.template)
        
        // Load existing configuration if available
        if (data.template.htmlConfig && canvas) {
          const config = JSON.parse(data.template.htmlConfig)
          canvas.loadFromJSON(config, () => {
            canvas.renderAll()
          })
        }
      }
    } catch (error) {
      console.error("Error fetching template:", error)
    } finally {
      setLoading(false)
    }
  }

  const updatePropertiesFromSelection = (obj: any) => {
    if (!obj) return

    if (obj.type === "text" || obj.type === "i-text") {
      setTextValue(obj.text || "")
      setFontSize(obj.fontSize || 20)
      setFontFamily(obj.fontFamily || "Arial")
      setTextColor(obj.fill || "#000000")
    }
  }

  const addText = () => {
    if (!canvas) return

    const text = new fabric.IText("Double-click to edit", {
      left: 100,
      top: 100,
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#000000",
    })

    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
  }

  const addVariable = (variableName: string) => {
    if (!canvas) return

    const text = new fabric.IText(`{{${variableName}}}`, {
      left: 100,
      top: 100,
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#0066cc",
    })

    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
  }

  const addRectangle = () => {
    if (!canvas) return

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 100,
      fill: "#e0e0e0",
      stroke: "#000000",
      strokeWidth: 2,
    })

    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.renderAll()
  }

  const addQRCodePlaceholder = () => {
    if (!canvas) return

    const qrPlaceholder = new fabric.Rect({
      left: 650,
      top: 450,
      width: 100,
      height: 100,
      fill: "#f0f0f0",
      stroke: "#000000",
      strokeWidth: 2,
    })

    const qrLabel = new fabric.Text("QR Code", {
      left: 660,
      top: 485,
      fontSize: 14,
      fill: "#666666",
    })

    const group = new fabric.Group([qrPlaceholder, qrLabel], {
      left: 650,
      top: 450,
    })

    canvas.add(group)
    canvas.setActiveObject(group)
    canvas.renderAll()
  }

  const updateSelectedText = () => {
    if (!canvas || !selectedObject) return

    if (selectedObject.type === "text" || selectedObject.type === "i-text") {
      const textObj = selectedObject as fabric.IText
      textObj.set({
        text: textValue,
        fontSize: fontSize,
        fontFamily: fontFamily,
        fill: textColor,
      })
      canvas.renderAll()
    }
  }

  const deleteSelected = () => {
    if (!canvas || !selectedObject) return

    canvas.remove(selectedObject)
    canvas.renderAll()
  }

  const clearCanvas = () => {
    if (!canvas) return

    if (confirm("Are you sure you want to clear the canvas?")) {
      canvas.clear()
      canvas.backgroundColor = "#ffffff"
      canvas.renderAll()
    }
  }

  const setCanvasBgColor = (color: string) => {
    if (!canvas) return
    canvas.backgroundColor = color
    canvas.renderAll()
  }

  const saveTemplate = async () => {
    if (!canvas) return

    try {
      const token = localStorage.getItem("token")
      const config = canvas.toJSON()
      
      const response = await fetch(`/api/template/update/${templateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          htmlConfig: JSON.stringify(config),
        }),
      })

      if (response.ok) {
        alert("Template saved successfully!")
      } else {
        alert("Failed to save template")
      }
    } catch (error) {
      console.error("Error saving template:", error)
      alert("An error occurred while saving")
    }
  }

  const exportTemplate = () => {
    if (!canvas) return

    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
    })

    const link = document.createElement("a")
    link.download = `template-${templateId}.png`
    link.href = dataURL
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading template...</div>
        </div>
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
              <h1 className="text-2xl font-bold">HTML Template Builder</h1>
              <p className="text-sm text-gray-600">
                {template?.name || "Untitled Template"}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={saveTemplate} variant="default">
                Save Template
              </Button>
              <Button onClick={exportTemplate} variant="outline">
                Export Preview
              </Button>
              <Link href="/admin/templates">
                <Button variant="outline">Back</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar - Tools */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={addText} className="w-full" variant="outline">
                  + Add Text
                </Button>
                <Button onClick={addRectangle} className="w-full" variant="outline">
                  + Add Rectangle
                </Button>
                <Button onClick={addQRCodePlaceholder} className="w-full" variant="outline">
                  + Add QR Code
                </Button>
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2 text-sm">Variables</h3>
                  <div className="space-y-1">
                    <Button
                      onClick={() => addVariable("studentName")}
                      className="w-full text-xs"
                      variant="outline"
                      size="sm"
                    >
                      Student Name
                    </Button>
                    <Button
                      onClick={() => addVariable("rollNo")}
                      className="w-full text-xs"
                      variant="outline"
                      size="sm"
                    >
                      Roll Number
                    </Button>
                    <Button
                      onClick={() => addVariable("courseName")}
                      className="w-full text-xs"
                      variant="outline"
                      size="sm"
                    >
                      Course Name
                    </Button>
                    <Button
                      onClick={() => addVariable("grade")}
                      className="w-full text-xs"
                      variant="outline"
                      size="sm"
                    >
                      Grade
                    </Button>
                    <Button
                      onClick={() => addVariable("date")}
                      className="w-full text-xs"
                      variant="outline"
                      size="sm"
                    >
                      Date
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Canvas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={bgColor}
                      onChange={(e) => {
                        setBgColor(e.target.value)
                        setCanvasBgColor(e.target.value)
                      }}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={bgColor}
                      onChange={(e) => {
                        setBgColor(e.target.value)
                        setCanvasBgColor(e.target.value)
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
                <Button onClick={clearCanvas} className="w-full" variant="outline">
                  Clear Canvas
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Center - Canvas */}
          <div className="col-span-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Design Area</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-gray-300 bg-gray-100 p-4">
                  <canvas ref={canvasRef} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Properties */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Properties</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedObject ? (
                  <div className="space-y-4">
                    {(selectedObject.type === "text" || selectedObject.type === "i-text") && (
                      <>
                        <div className="space-y-2">
                          <Label>Text</Label>
                          <Input
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            onBlur={updateSelectedText}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <Input
                            type="number"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            onBlur={updateSelectedText}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Font Family</Label>
                          <select
                            value={fontFamily}
                            onChange={(e) => {
                              setFontFamily(e.target.value)
                              setTimeout(updateSelectedText, 0)
                            }}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Text Color</Label>
                          <div className="flex space-x-2">
                            <Input
                              type="color"
                              value={textColor}
                              onChange={(e) => {
                                setTextColor(e.target.value)
                                updateSelectedText()
                              }}
                              className="w-20"
                            />
                            <Input
                              type="text"
                              value={textColor}
                              onChange={(e) => {
                                setTextColor(e.target.value)
                                updateSelectedText()
                              }}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    <Button onClick={deleteSelected} variant="outline" className="w-full">
                      Delete Selected
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Select an element to edit its properties
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Help</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Click elements to select them</p>
                  <p>• Drag to move elements</p>
                  <p>• Double-click text to edit</p>
                  <p>• Use variables like {`{{studentName}}`}</p>
                  <p>• Variables will be replaced with actual data</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
