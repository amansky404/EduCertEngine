"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { fabric } from "fabric"
import { HexColorPicker } from "react-colorful"
import { Type, Image as ImageIcon, Square, Circle, Minus, QrCode, Palette, Sparkles } from "lucide-react"
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

  // Canvas dimensions state
  const [canvasWidth, setCanvasWidth] = useState(1200)
  const [canvasHeight, setCanvasHeight] = useState(900)

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: "#ffffff",
        preserveObjectStacking: true,
      })

      // Improve selection handling
      fabricCanvas.on("selection:created", (e) => {
        const selected = e.selected?.[0] || null
        setSelectedObject(selected)
        updatePropertiesFromSelection(selected)
      })

      fabricCanvas.on("selection:updated", (e) => {
        const selected = e.selected?.[0] || null
        setSelectedObject(selected)
        updatePropertiesFromSelection(selected)
      })

      fabricCanvas.on("selection:cleared", () => {
        setSelectedObject(null)
      })

      // Maintain canvas focus
      fabricCanvas.on("mouse:down", () => {
        if (canvasRef.current) {
          canvasRef.current.focus()
        }
      })

      setCanvas(fabricCanvas)
    }
  }, [canvasRef, canvas, canvasWidth, canvasHeight])

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

  // Load template configuration when both canvas and template are ready
  useEffect(() => {
    if (canvas && template && template.htmlConfig) {
      try {
        const config = JSON.parse(template.htmlConfig)
        canvas.loadFromJSON(config, () => {
          canvas.renderAll()
        })
      } catch (error) {
        console.error("Error loading template configuration:", error)
      }
    }
  }, [canvas, template])

  const [customVariables, setCustomVariables] = useState<string[]>([])
  const [newVariableName, setNewVariableName] = useState("")
  const [history, setHistory] = useState<any[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [canvasScale, setCanvasScale] = useState(1)
  const [layers, setLayers] = useState<fabric.Object[]>([])
  const [showRulers, setShowRulers] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [gridSize, setGridSize] = useState(20)
  const [darkMode, setDarkMode] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  const [googleFonts, setGoogleFonts] = useState<string[]>([
    "Arial", "Times New Roman", "Courier New", "Georgia", "Verdana",
    "Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", 
    "Playfair Display", "Raleway", "Poppins", "Inter", "Dancing Script"
  ])
  const [collapsedPanels, setCollapsedPanels] = useState<{[key: string]: boolean}>({
    elements: false,
    effects: false,
    variables: false,
    alignment: false,
    layer: false,
    canvas: false,
    properties: false,
    layers: false,
    shortcuts: false
  })

  // Load Google Fonts dynamically
  useEffect(() => {
    const loadGoogleFont = (fontName: string) => {
      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700&display=swap`
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }

    // Load Google Fonts
    const googleFontNames = ["Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", 
                             "Playfair Display", "Raleway", "Poppins", "Inter", "Dancing Script"]
    googleFontNames.forEach(loadGoogleFont)
  }, [])

  // Update layers when canvas objects change
  useEffect(() => {
    if (canvas) {
      const updateLayers = () => {
        const objects = canvas.getObjects()
        setLayers([...objects])
      }

      canvas.on('object:added', updateLayers)
      canvas.on('object:removed', updateLayers)
      canvas.on('object:modified', updateLayers)

      return () => {
        canvas.off('object:added', updateLayers)
        canvas.off('object:removed', updateLayers)
        canvas.off('object:modified', updateLayers)
      }
    }
  }, [canvas])

  const saveState = () => {
    if (!canvas) return
    const state = canvas.toJSON()
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(state)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (!canvas || historyIndex <= 0) return
    const newIndex = historyIndex - 1
    canvas.loadFromJSON(history[newIndex], () => {
      canvas.renderAll()
      setHistoryIndex(newIndex)
    })
  }

  const redo = () => {
    if (!canvas || historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    canvas.loadFromJSON(history[newIndex], () => {
      canvas.renderAll()
      setHistoryIndex(newIndex)
    })
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
    saveState()
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
    saveState()
  }

  const addCustomVariable = () => {
    if (!newVariableName.trim()) return
    if (customVariables.includes(newVariableName)) {
      alert("Variable already exists")
      return
    }
    setCustomVariables([...customVariables, newVariableName])
    setNewVariableName("")
  }

  const removeCustomVariable = (name: string) => {
    setCustomVariables(customVariables.filter(v => v !== name))
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
    saveState()
  }

  const addCircle = () => {
    if (!canvas) return

    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: "#e0e0e0",
      stroke: "#000000",
      strokeWidth: 2,
    })

    canvas.add(circle)
    canvas.setActiveObject(circle)
    canvas.renderAll()
    saveState()
  }

  const addLine = () => {
    if (!canvas) return

    const line = new fabric.Line([50, 50, 200, 50], {
      stroke: "#000000",
      strokeWidth: 2,
      left: 100,
      top: 100,
    })

    canvas.add(line)
    canvas.setActiveObject(line)
    canvas.renderAll()
    saveState()
  }

  const addImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !canvas) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const imgObj = new Image()
        imgObj.src = event.target?.result as string
        imgObj.onload = () => {
          const image = new fabric.Image(imgObj)
          image.scaleToWidth(200)
          image.set({ left: 100, top: 100 })
          canvas.add(image)
          canvas.setActiveObject(image)
          canvas.renderAll()
          saveState()
        }
      }
      reader.readAsDataURL(file)
    }
    input.click()
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
    saveState()
  }

  const alignLeft = () => {
    if (!canvas || !selectedObject) return
    selectedObject.set({ left: 0 })
    canvas.renderAll()
    saveState()
  }

  const alignRight = () => {
    if (!canvas || !selectedObject) return
    selectedObject.set({ left: canvasWidth - (selectedObject.width || 0) * (selectedObject.scaleX || 1) })
    canvas.renderAll()
    saveState()
  }

  const alignCenter = () => {
    if (!canvas || !selectedObject) return
    selectedObject.set({ left: (canvasWidth - (selectedObject.width || 0) * (selectedObject.scaleX || 1)) / 2 })
    canvas.renderAll()
    saveState()
  }

  const alignTop = () => {
    if (!canvas || !selectedObject) return
    selectedObject.set({ top: 0 })
    canvas.renderAll()
    saveState()
  }

  const alignMiddle = () => {
    if (!canvas || !selectedObject) return
    selectedObject.set({ top: (canvasHeight - (selectedObject.height || 0) * (selectedObject.scaleY || 1)) / 2 })
    canvas.renderAll()
    saveState()
  }

  const alignBottom = () => {
    if (!canvas || !selectedObject) return
    selectedObject.set({ top: canvasHeight - (selectedObject.height || 0) * (selectedObject.scaleY || 1) })
    canvas.renderAll()
    saveState()
  }

  const bringToFront = () => {
    if (!canvas || !selectedObject) return
    canvas.bringToFront(selectedObject)
    canvas.renderAll()
    saveState()
  }

  const sendToBack = () => {
    if (!canvas || !selectedObject) return
    canvas.sendToBack(selectedObject)
    canvas.renderAll()
    saveState()
  }

  const duplicateObject = () => {
    if (!canvas || !selectedObject) return
    selectedObject.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      })
      canvas.add(cloned)
      canvas.setActiveObject(cloned)
      canvas.renderAll()
      saveState()
    })
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
      saveState()
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if ((e.target as HTMLElement).tagName === 'INPUT' || 
          (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return
      }

      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault()
        redo()
      }

      // Delete key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObject && canvas) {
          e.preventDefault()
          deleteSelected()
        }
      }

      // Ctrl/Cmd + D for duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        duplicateObject()
      }

      // Ctrl/Cmd + S for save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveTemplate()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canvas, selectedObject, historyIndex, history])

  const deleteSelected = () => {
    if (!canvas || !selectedObject) return

    canvas.remove(selectedObject)
    canvas.renderAll()
    saveState()
  }

  const clearCanvas = () => {
    if (!canvas) return

    if (confirm("Are you sure you want to clear the canvas?")) {
      canvas.clear()
      canvas.backgroundColor = "#ffffff"
      canvas.renderAll()
      saveState()
    }
  }

  const setCanvasBgColor = (color: string) => {
    if (!canvas) return
    canvas.backgroundColor = color
    canvas.renderAll()
    saveState()
  }

  const zoomIn = () => {
    const newScale = Math.min(canvasScale + 0.1, 2)
    setCanvasScale(newScale)
    if (canvas) {
      canvas.setZoom(newScale)
      canvas.renderAll()
    }
  }

  const zoomOut = () => {
    const newScale = Math.max(canvasScale - 0.1, 0.5)
    setCanvasScale(newScale)
    if (canvas) {
      canvas.setZoom(newScale)
      canvas.renderAll()
    }
  }

  const resetZoom = () => {
    setCanvasScale(1)
    if (canvas) {
      canvas.setZoom(1)
      canvas.renderAll()
    }
  }

  const resizeCanvas = (width: number, height: number) => {
    if (!canvas) return
    setCanvasWidth(width)
    setCanvasHeight(height)
    canvas.setDimensions({ width, height })
    canvas.renderAll()
  }

  const toggleGrid = () => {
    setShowGrid(!showGrid)
    if (canvas) {
      canvas.renderAll()
    }
  }

  const togglePanel = (panelName: string) => {
    setCollapsedPanels(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }))
  }

  // Advanced filter effects
  const applyFilter = (filterType: string) => {
    if (!canvas || !selectedObject || selectedObject.type !== 'image') return
    
    const imgObj = selectedObject as fabric.Image
    
    switch(filterType) {
      case 'grayscale':
        imgObj.filters = [new fabric.Image.filters.Grayscale()]
        break
      case 'sepia':
        imgObj.filters = [new fabric.Image.filters.Sepia()]
        break
      case 'brightness':
        imgObj.filters = [new fabric.Image.filters.Brightness({ brightness: 0.3 })]
        break
      case 'contrast':
        imgObj.filters = [new fabric.Image.filters.Contrast({ contrast: 0.3 })]
        break
      case 'blur':
        imgObj.filters = [new fabric.Image.filters.Blur({ blur: 0.5 })]
        break
      case 'invert':
        imgObj.filters = [new fabric.Image.filters.Invert()]
        break
      case 'none':
        imgObj.filters = []
        break
    }
    
    imgObj.applyFilters()
    canvas.renderAll()
    saveState()
  }

  // Add shadow effect
  const addShadow = () => {
    if (!canvas || !selectedObject) return
    
    selectedObject.set({
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.3)',
        blur: 10,
        offsetX: 5,
        offsetY: 5
      })
    })
    
    canvas.renderAll()
    saveState()
  }

  // Remove shadow
  const removeShadow = () => {
    if (!canvas || !selectedObject) return
    selectedObject.set({ shadow: undefined })
    canvas.renderAll()
    saveState()
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
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border-b`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Enhanced HTML Template Builder</h1>
              <p className="text-sm text-gray-600">
                {template?.name || "Untitled Template"}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => setDarkMode(!darkMode)} 
                variant="outline" 
                size="sm"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? "☀️" : "🌙"}
              </Button>
              <Button onClick={undo} variant="outline" disabled={historyIndex <= 0} size="sm">
                ↶ Undo
              </Button>
              <Button onClick={redo} variant="outline" disabled={historyIndex >= history.length - 1} size="sm">
                ↷ Redo
              </Button>
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
        <div className="flex gap-4 h-[calc(100vh-140px)]">
          {/* Left Sidebar - Tools */}
          <div className="w-64 flex-shrink-0 overflow-y-auto space-y-4 pr-2"
            style={{ scrollbarWidth: 'thin' }}>
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="cursor-pointer" onClick={() => togglePanel('elements')}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Elements</CardTitle>
                  <span className="text-sm">{collapsedPanels.elements ? '▼' : '▲'}</span>
                </div>
              </CardHeader>
              {!collapsedPanels.elements && (
                <CardContent className="space-y-2">
                  <Button onClick={addText} className="w-full justify-start" variant="outline">
                    <Type className="mr-2 h-4 w-4" />
                    Add Text
                  </Button>
                  <Button onClick={addRectangle} className="w-full justify-start" variant="outline">
                    <Square className="mr-2 h-4 w-4" />
                    Add Rectangle
                  </Button>
                  <Button onClick={addCircle} className="w-full justify-start" variant="outline">
                    <Circle className="mr-2 h-4 w-4" />
                    Add Circle
                  </Button>
                  <Button onClick={addLine} className="w-full justify-start" variant="outline">
                    <Minus className="mr-2 h-4 w-4" />
                    Add Line
                  </Button>
                  <Button onClick={addImage} className="w-full justify-start" variant="outline">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Add Image
                  </Button>
                  <Button onClick={addQRCodePlaceholder} className="w-full justify-start" variant="outline">
                    <QrCode className="mr-2 h-4 w-4" />
                    Add QR Code
                  </Button>
                </CardContent>
              )}
            </Card>

            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="cursor-pointer" onClick={() => togglePanel('effects')}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Effects
                  </CardTitle>
                  <span className="text-sm">{collapsedPanels.effects ? '▼' : '▲'}</span>
                </div>
              </CardHeader>
              {!collapsedPanels.effects && (
                <CardContent className="space-y-2">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Image Filters</div>
                  <div className="grid grid-cols-2 gap-1">
                    <Button 
                      onClick={() => applyFilter('grayscale')} 
                      variant="outline" 
                      size="sm"
                      disabled={!selectedObject || selectedObject.type !== 'image'}
                    >
                      Grayscale
                    </Button>
                    <Button 
                      onClick={() => applyFilter('sepia')} 
                      variant="outline" 
                      size="sm"
                      disabled={!selectedObject || selectedObject.type !== 'image'}
                    >
                      Sepia
                    </Button>
                    <Button 
                      onClick={() => applyFilter('brightness')} 
                      variant="outline" 
                      size="sm"
                      disabled={!selectedObject || selectedObject.type !== 'image'}
                    >
                      Brighten
                    </Button>
                    <Button 
                      onClick={() => applyFilter('contrast')} 
                      variant="outline" 
                      size="sm"
                      disabled={!selectedObject || selectedObject.type !== 'image'}
                    >
                      Contrast
                    </Button>
                    <Button 
                      onClick={() => applyFilter('blur')} 
                      variant="outline" 
                      size="sm"
                      disabled={!selectedObject || selectedObject.type !== 'image'}
                    >
                      Blur
                    </Button>
                    <Button 
                      onClick={() => applyFilter('invert')} 
                      variant="outline" 
                      size="sm"
                      disabled={!selectedObject || selectedObject.type !== 'image'}
                    >
                      Invert
                    </Button>
                  </div>
                  <Button 
                    onClick={() => applyFilter('none')} 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    disabled={!selectedObject || selectedObject.type !== 'image'}
                  >
                    Remove Filters
                  </Button>
                  <div className="text-xs font-semibold text-gray-600 mt-3 mb-2 border-t pt-2">Shadow Effects</div>
                  <Button 
                    onClick={addShadow} 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    disabled={!selectedObject}
                  >
                    Add Shadow
                  </Button>
                  <Button 
                    onClick={removeShadow} 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    disabled={!selectedObject}
                  >
                    Remove Shadow
                  </Button>
                </CardContent>
              )}
            </Card>

            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="cursor-pointer" onClick={() => togglePanel('variables')}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Variables</CardTitle>
                  <span className="text-sm">{collapsedPanels.variables ? '▼' : '▲'}</span>
                </div>
              </CardHeader>
              {!collapsedPanels.variables && (
                <CardContent className="space-y-2">
                <div className="text-xs font-semibold text-gray-600 mb-2">Standard Variables</div>
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
                
                {customVariables.length > 0 && (
                  <>
                    <div className="text-xs font-semibold text-gray-600 mt-3 mb-2">Custom Variables</div>
                    <div className="space-y-1">
                      {customVariables.map((varName) => (
                        <div key={varName} className="flex gap-1">
                          <Button
                            onClick={() => addVariable(varName)}
                            className="flex-1 text-xs"
                            variant="outline"
                            size="sm"
                          >
                            {varName}
                          </Button>
                          <Button
                            onClick={() => removeCustomVariable(varName)}
                            variant="outline"
                            size="sm"
                            className="px-2"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                <div className="pt-3 border-t">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Add Custom Variable</div>
                  <div className="flex gap-1">
                    <Input
                      placeholder="variableName"
                      value={newVariableName}
                      onChange={(e) => setNewVariableName(e.target.value)}
                      className="text-xs"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') addCustomVariable()
                      }}
                    />
                    <Button
                      onClick={addCustomVariable}
                      size="sm"
                      className="px-2"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </CardContent>
              )}
            </Card>

            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="cursor-pointer" onClick={() => togglePanel('alignment')}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Alignment</CardTitle>
                  <span className="text-sm">{collapsedPanels.alignment ? '▼' : '▲'}</span>
                </div>
              </CardHeader>
              {!collapsedPanels.alignment && (
                <CardContent className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">Horizontal</div>
                  <div className="grid grid-cols-3 gap-1">
                    <Button onClick={alignLeft} variant="outline" size="sm" disabled={!selectedObject}>
                      ←
                    </Button>
                    <Button onClick={alignCenter} variant="outline" size="sm" disabled={!selectedObject}>
                      ↔
                    </Button>
                    <Button onClick={alignRight} variant="outline" size="sm" disabled={!selectedObject}>
                      →
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">Vertical</div>
                  <div className="grid grid-cols-3 gap-1">
                    <Button onClick={alignTop} variant="outline" size="sm" disabled={!selectedObject}>
                      ↑
                    </Button>
                    <Button onClick={alignMiddle} variant="outline" size="sm" disabled={!selectedObject}>
                      ↕
                    </Button>
                    <Button onClick={alignBottom} variant="outline" size="sm" disabled={!selectedObject}>
                      ↓
                    </Button>
                  </div>
                </div>
              </CardContent>
              )}
            </Card>

            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="cursor-pointer" onClick={() => togglePanel('layer')}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Layer</CardTitle>
                  <span className="text-sm">{collapsedPanels.layer ? '▼' : '▲'}</span>
                </div>
              </CardHeader>
              {!collapsedPanels.layer && (
                <CardContent className="space-y-2">
                <Button onClick={bringToFront} variant="outline" className="w-full" size="sm" disabled={!selectedObject}>
                  Bring to Front
                </Button>
                <Button onClick={sendToBack} variant="outline" className="w-full" size="sm" disabled={!selectedObject}>
                  Send to Back
                </Button>
                <Button onClick={duplicateObject} variant="outline" className="w-full" size="sm" disabled={!selectedObject}>
                  Duplicate
                </Button>
              </CardContent>
              )}
            </Card>

            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="cursor-pointer" onClick={() => togglePanel('canvas')}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Canvas</CardTitle>
                  <span className="text-sm">{collapsedPanels.canvas ? '▼' : '▲'}</span>
                </div>
              </CardHeader>
              {!collapsedPanels.canvas && (
                <CardContent className="space-y-2">
                <div className="space-y-2">
                  <Label>Canvas Size</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Width</Label>
                      <Input
                        type="number"
                        value={canvasWidth}
                        onChange={(e) => resizeCanvas(Number(e.target.value), canvasHeight)}
                        min="400"
                        max="3000"
                        step="50"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Height</Label>
                      <Input
                        type="number"
                        value={canvasHeight}
                        onChange={(e) => resizeCanvas(canvasWidth, Number(e.target.value))}
                        min="400"
                        max="3000"
                        step="50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <Button 
                      onClick={() => resizeCanvas(1200, 900)} 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                    >
                      1200×900
                    </Button>
                    <Button 
                      onClick={() => resizeCanvas(1920, 1080)} 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                    >
                      1920×1080
                    </Button>
                    <Button 
                      onClick={() => resizeCanvas(2480, 3508)} 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                    >
                      A4
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 border-t pt-2">
                  <Label className="flex items-center">
                    <Palette className="mr-2 h-4 w-4" />
                    Background Color
                  </Label>
                  <div className="space-y-2">
                    <div 
                      className="w-full h-10 rounded border-2 cursor-pointer"
                      style={{ backgroundColor: bgColor }}
                      onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                    />
                    {showBgColorPicker && (
                      <div className="p-2 bg-white dark:bg-gray-800 rounded border shadow-lg">
                        <HexColorPicker 
                          color={bgColor} 
                          onChange={(color) => {
                            setBgColor(color)
                            setCanvasBgColor(color)
                          }}
                        />
                        <Input
                          type="text"
                          value={bgColor}
                          onChange={(e) => {
                            setBgColor(e.target.value)
                            setCanvasBgColor(e.target.value)
                          }}
                          className="mt-2"
                          placeholder="#ffffff"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 border-t pt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={toggleGrid}
                      className="w-4 h-4"
                    />
                    <Label>Show Grid</Label>
                  </div>
                  {showGrid && (
                    <div>
                      <Label className="text-xs">Grid Size: {gridSize}px</Label>
                      <Input
                        type="range"
                        value={gridSize}
                        onChange={(e) => setGridSize(Number(e.target.value))}
                        min="10"
                        max="100"
                        step="10"
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2 border-t pt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showRulers}
                      onChange={() => setShowRulers(!showRulers)}
                      className="w-4 h-4"
                    />
                    <Label>Show Rulers</Label>
                  </div>
                </div>
                <div className="space-y-2 border-t pt-2">
                  <Label>Zoom: {Math.round(canvasScale * 100)}%</Label>
                  <div className="grid grid-cols-3 gap-1">
                    <Button onClick={zoomOut} variant="outline" size="sm">
                      −
                    </Button>
                    <Button onClick={resetZoom} variant="outline" size="sm">
                      100%
                    </Button>
                    <Button onClick={zoomIn} variant="outline" size="sm">
                      +
                    </Button>
                  </div>
                </div>
                <Button onClick={clearCanvas} className="w-full" variant="outline">
                  Clear Canvas
                </Button>
              </CardContent>
              )}
            </Card>
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 flex flex-col min-w-0">
            <Card className={`h-full flex flex-col ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Design Area</CardTitle>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {canvasWidth}×{canvasHeight} • {Math.round(canvasScale * 100)}% • {canvas?.getObjects().length || 0} objects
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div className={`flex-1 relative border-2 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'} rounded-lg shadow-inner overflow-auto`}>
                  {showRulers && (
                    <>
                      {/* Horizontal ruler */}
                      <div className="absolute top-0 left-8 right-0 h-8 bg-gray-200 border-b border-gray-400 flex items-end overflow-hidden z-10">
                        {Array.from({ length: Math.ceil(canvasWidth / 50) + 1 }).map((_, i) => (
                          <div key={i} className="relative" style={{ width: `${50 * canvasScale}px` }}>
                            <div className="absolute bottom-0 left-0 w-px h-2 bg-gray-600"></div>
                            <div className="absolute bottom-2 left-1 text-[8px] text-gray-600">{i * 50}</div>
                          </div>
                        ))}
                      </div>
                      {/* Vertical ruler */}
                      <div className="absolute top-8 left-0 bottom-0 w-8 bg-gray-200 border-r border-gray-400 flex flex-col items-end overflow-hidden z-10">
                        {Array.from({ length: Math.ceil(canvasHeight / 50) + 1 }).map((_, i) => (
                          <div key={i} className="relative" style={{ height: `${50 * canvasScale}px` }}>
                            <div className="absolute top-0 right-0 h-px w-2 bg-gray-600"></div>
                            <div className="absolute top-1 right-2 text-[8px] text-gray-600 -rotate-90 origin-top-right">{i * 50}</div>
                          </div>
                        ))}
                      </div>
                      {/* Corner square */}
                      <div className="absolute top-0 left-0 w-8 h-8 bg-gray-300 border-r border-b border-gray-400 z-20"></div>
                    </>
                  )}
                  <div 
                    className="absolute p-4"
                    style={{
                      top: showRulers ? '32px' : '0',
                      left: showRulers ? '32px' : '0',
                      right: '0',
                      bottom: '0'
                    }}
                  >
                    <div className="relative inline-block">
                      {showGrid && (
                        <div 
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            backgroundImage: `
                              linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
                            `,
                            backgroundSize: `${gridSize * canvasScale}px ${gridSize * canvasScale}px`,
                            width: `${canvasWidth * canvasScale}px`,
                            height: `${canvasHeight * canvasScale}px`
                          }}
                        />
                      )}
                      <canvas 
                        ref={canvasRef} 
                        className="shadow-lg" 
                        style={{ 
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          backgroundColor: '#fff'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Properties */}
          <div className="w-80 flex-shrink-0 overflow-y-auto space-y-4 pl-2"
            style={{ scrollbarWidth: 'thin' }}>
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="cursor-pointer" onClick={() => togglePanel('properties')}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Properties</CardTitle>
                  <span className="text-sm">{collapsedPanels.properties ? '▼' : '▲'}</span>
                </div>
              </CardHeader>
              {!collapsedPanels.properties && (
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
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateSelectedText()
                              }
                            }}
                            onBlur={updateSelectedText}
                            placeholder="Enter text..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <Input
                            type="number"
                            value={fontSize}
                            onChange={(e) => {
                              const newSize = Number(e.target.value)
                              setFontSize(newSize)
                              if (canvas && selectedObject && (selectedObject.type === "text" || selectedObject.type === "i-text")) {
                                const textObj = selectedObject as fabric.IText
                                textObj.set({ fontSize: newSize })
                                canvas.renderAll()
                              }
                            }}
                            min="8"
                            max="200"
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
                            className={`w-full border rounded px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                          >
                            <optgroup label="System Fonts">
                              <option value="Arial">Arial</option>
                              <option value="Times New Roman">Times New Roman</option>
                              <option value="Courier New">Courier New</option>
                              <option value="Georgia">Georgia</option>
                              <option value="Verdana">Verdana</option>
                              <option value="Comic Sans MS">Comic Sans MS</option>
                              <option value="Impact">Impact</option>
                              <option value="Trebuchet MS">Trebuchet MS</option>
                            </optgroup>
                            <optgroup label="Google Fonts (Internet)">
                              <option value="Roboto">Roboto</option>
                              <option value="Open Sans">Open Sans</option>
                              <option value="Lato">Lato</option>
                              <option value="Montserrat">Montserrat</option>
                              <option value="Oswald">Oswald</option>
                              <option value="Playfair Display">Playfair Display</option>
                              <option value="Raleway">Raleway</option>
                              <option value="Poppins">Poppins</option>
                              <option value="Inter">Inter</option>
                              <option value="Dancing Script">Dancing Script</option>
                            </optgroup>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center">
                            <Palette className="mr-2 h-4 w-4" />
                            Text Color
                          </Label>
                          <div className="space-y-2">
                            <div 
                              className="w-full h-10 rounded border-2 cursor-pointer"
                              style={{ backgroundColor: textColor }}
                              onClick={() => setShowColorPicker(!showColorPicker)}
                            />
                            {showColorPicker && (
                              <div className="p-2 bg-white dark:bg-gray-800 rounded border shadow-lg">
                                <HexColorPicker 
                                  color={textColor} 
                                  onChange={(color) => {
                                    setTextColor(color)
                                    if (canvas && selectedObject && (selectedObject.type === "text" || selectedObject.type === "i-text")) {
                                      const textObj = selectedObject as fabric.IText
                                      textObj.set({ fill: color })
                                      canvas.renderAll()
                                    }
                                  }}
                                />
                                <Input
                                  type="text"
                                  value={textColor}
                                  onChange={(e) => {
                                    setTextColor(e.target.value)
                                    updateSelectedText()
                                  }}
                                  className="mt-2"
                                  placeholder="#000000"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    <Button onClick={deleteSelected} variant="outline" className="w-full">
                      Delete Selected
                    </Button>
                  </div>
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select an element to edit its properties
                  </p>
                )}
              </CardContent>
              )}
            </Card>

            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="cursor-pointer" onClick={() => togglePanel('layers')}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Layers</CardTitle>
                  <span className="text-sm">{collapsedPanels.layers ? '▼' : '▲'}</span>
                </div>
              </CardHeader>
              {!collapsedPanels.layers && (
                <CardContent>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {layers.length === 0 ? (
                    <p className="text-sm text-gray-600">No layers yet</p>
                  ) : (
                    layers.slice().reverse().map((layer, index) => {
                      const actualIndex = layers.length - 1 - index
                      const isSelected = selectedObject === layer
                      const layerType = layer.type || 'object'
                      const layerName = (layer as any).text || 
                                       (layer.type === 'rect' ? 'Rectangle' :
                                        layer.type === 'circle' ? 'Circle' :
                                        layer.type === 'line' ? 'Line' :
                                        layer.type === 'image' ? 'Image' :
                                        layer.type === 'group' ? 'QR Code' : 'Object')
                      
                      return (
                        <div
                          key={actualIndex}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                            isSelected ? 'bg-blue-100 border border-blue-500' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            if (canvas) {
                              canvas.setActiveObject(layer)
                              canvas.renderAll()
                            }
                          }}
                        >
                          <div className="flex-1 text-sm truncate">
                            <span className="font-medium">{layerName}</span>
                            <span className="text-gray-500 ml-2 text-xs">({layerType})</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (canvas) {
                                  canvas.setActiveObject(layer)
                                  duplicateObject()
                                }
                              }}
                              className="p-1 hover:bg-gray-200 rounded text-xs"
                              title="Duplicate"
                            >
                              ⎘
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (canvas) {
                                  canvas.remove(layer)
                                  canvas.renderAll()
                                  saveState()
                                }
                              }}
                              className="p-1 hover:bg-red-100 rounded text-xs"
                              title="Delete"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
              )}
            </Card>

            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="cursor-pointer" onClick={() => togglePanel('shortcuts')}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
                  <span className="text-sm">{collapsedPanels.shortcuts ? '▼' : '▲'}</span>
                </div>
              </CardHeader>
              {!collapsedPanels.shortcuts && (
                <CardContent>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• <kbd className={`px-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded`}>Ctrl/Cmd+Z</kbd> Undo</p>
                  <p>• <kbd className={`px-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded`}>Ctrl/Cmd+Shift+Z</kbd> Redo</p>
                  <p>• <kbd className={`px-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded`}>Ctrl/Cmd+D</kbd> Duplicate</p>
                  <p>• <kbd className={`px-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded`}>Ctrl/Cmd+S</kbd> Save</p>
                  <p>• <kbd className={`px-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded`}>Delete</kbd> Delete selected</p>
                  <p>• Double-click text to edit inline</p>
                  <p>• Drag to move, corners to resize</p>
                </div>
              </CardContent>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
