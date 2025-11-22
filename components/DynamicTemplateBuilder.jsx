'use client';

import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text, Image, Rect, Circle, Line, Transformer } from 'react-konva';
import useImage from 'use-image';

export default function DynamicTemplateBuilder() {
  const [templateType, setTemplateType] = useState('html');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  
  // HTML Template State
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  
  // Canvas Template State (for PDF/JPEG mapping)
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [canvasElements, setCanvasElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1130 }); // A4 size
  
  // Variables System
  const [variables, setVariables] = useState([
    { id: 'studentName', label: 'Student Name', type: 'text', required: true, validation: 'required|min:3' },
    { id: 'rollNo', label: 'Roll Number', type: 'text', required: true, validation: 'required|alphanumeric' },
    { id: 'regNo', label: 'Registration Number', type: 'text', required: true, validation: 'required' },
    { id: 'issueDate', label: 'Issue Date', type: 'date', required: true, validation: 'required|date' },
    { id: 'program', label: 'Program', type: 'text', required: false, validation: '' },
    { id: 'grade', label: 'Grade', type: 'text', required: false, validation: 'alpha' },
    { id: 'percentage', label: 'Percentage', type: 'number', required: false, validation: 'numeric|min:0|max:100' }
  ]);
  
  // Validation Rules
  const [validationRules, setValidationRules] = useState({
    rollNo: {
      pattern: '^[A-Z0-9]{6,12}$',
      message: 'Roll number must be 6-12 alphanumeric characters'
    },
    regNo: {
      pattern: '^REG[0-9]{8,10}$',
      message: 'Registration number must start with REG followed by 8-10 digits'
    },
    email: {
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      message: 'Invalid email format'
    }
  });
  
  // Mapping Configuration
  const [mappingConfig, setMappingConfig] = useState({
    source: 'student', // student, module, custom
    fieldMappings: {
      studentName: 'name',
      rollNo: 'rollNo',
      regNo: 'regNo',
      issueDate: 'createdAt'
    },
    transformations: {
      studentName: 'uppercase',
      issueDate: 'formatDate:DD/MM/YYYY'
    }
  });
  
  // Preview State
  const [previewData, setPreviewData] = useState({
    studentName: 'JOHN DOE',
    rollNo: 'CS2024001',
    regNo: 'REG2024001',
    issueDate: '20/11/2024',
    program: 'Computer Science',
    grade: 'A+',
    percentage: '95.5'
  });
  
  const [activeTab, setActiveTab] = useState('design');
  const stageRef = useRef(null);
  const transformerRef = useRef(null);

  const tabs = [
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'variables', label: 'Variables', icon: '📝' },
    { id: 'mapping', label: 'Mapping', icon: '🔗' },
    { id: 'validation', label: 'Validation', icon: '✅' },
    { id: 'preview', label: 'Preview', icon: '👁️' },
    { id: 'export', label: 'Export', icon: '💾' }
  ];

  useEffect(() => {
    if (selectedElement && transformerRef.current) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#${selectedElement.id}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedElement]);

  const addTextElement = () => {
    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      text: 'Sample Text',
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
      draggable: true,
      variable: null
    };
    setCanvasElements([...canvasElements, newElement]);
  };

  const addVariableText = (variable) => {
    const newElement = {
      id: `var-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      text: `{{${variable.id}}}`,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
      draggable: true,
      variable: variable.id
    };
    setCanvasElements([...canvasElements, newElement]);
  };

  const addShape = (shapeType) => {
    const newElement = {
      id: `shape-${Date.now()}`,
      type: shapeType,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: '#cccccc',
      stroke: '#000000',
      strokeWidth: 2,
      draggable: true
    };
    setCanvasElements([...canvasElements, newElement]);
  };

  const updateElement = (id, updates) => {
    setCanvasElements(canvasElements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id) => {
    setCanvasElements(canvasElements.filter(el => el.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportTemplate = () => {
    const template = {
      name: templateName,
      description: templateDescription,
      type: templateType,
      variables,
      validationRules,
      mappingConfig,
      qrEnabled: true
    };

    if (templateType === 'html') {
      template.htmlContent = htmlContent;
      template.cssContent = cssContent;
    } else if (templateType === 'canvas') {
      template.canvasSize = canvasSize;
      template.backgroundImage = backgroundImage;
      template.elements = canvasElements;
    }

    return template;
  };

  const saveTemplate = async () => {
    const template = exportTemplate();
    
    try {
      const response = await fetch('/api/template/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(template)
      });

      if (response.ok) {
        alert('Template saved successfully!');
      } else {
        alert('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    }
  };

  const renderDesignTab = () => {
    if (templateType === 'html') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">HTML Content</label>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="w-full h-64 px-3 py-2 border rounded font-mono text-sm"
              placeholder="Enter HTML content..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">CSS Styles</label>
            <textarea
              value={cssContent}
              onChange={(e) => setCssContent(e.target.value)}
              className="w-full h-32 px-3 py-2 border rounded font-mono text-sm"
              placeholder="Enter CSS styles..."
            />
          </div>
          <div className="bg-blue-50 p-4 rounded">
            <h4 className="font-semibold mb-2">Available Variables:</h4>
            <div className="flex flex-wrap gap-2">
              {variables.map(v => (
                <code key={v.id} className="bg-white px-2 py-1 rounded text-sm">
                  {`{{${v.id}}}`}
                </code>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Background Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundUpload}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={addTextElement}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ➕ Add Text
          </button>
          <button
            onClick={() => addShape('rect')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            ◻️ Rectangle
          </button>
          <button
            onClick={() => addShape('circle')}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            ⚫ Circle
          </button>
        </div>

        {selectedElement && (
          <div className="border p-4 rounded bg-gray-50">
            <h4 className="font-semibold mb-3">Element Properties</h4>
            
            {selectedElement.type === 'text' && (
              <>
                <div className="mb-3">
                  <label className="block text-sm mb-1">Text Content</label>
                  <input
                    type="text"
                    value={selectedElement.text}
                    onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm mb-1">Font Size</label>
                    <input
                      type="number"
                      value={selectedElement.fontSize}
                      onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Color</label>
                    <input
                      type="color"
                      value={selectedElement.fill}
                      onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                      className="w-full h-8 rounded"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1">Link to Variable</label>
                  <select
                    value={selectedElement.variable || ''}
                    onChange={(e) => updateElement(selectedElement.id, { 
                      variable: e.target.value,
                      text: e.target.value ? `{{${e.target.value}}}` : selectedElement.text
                    })}
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="">No variable</option>
                    {variables.map(v => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <button
              onClick={() => deleteElement(selectedElement.id)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              🗑️ Delete Element
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderVariablesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Template Variables</h3>
        <button
          onClick={() => {
            const newVar = {
              id: `var${Date.now()}`,
              label: 'New Variable',
              type: 'text',
              required: false,
              validation: ''
            };
            setVariables([...variables, newVar]);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ➕ Add Variable
        </button>
      </div>

      <div className="space-y-3">
        {variables.map((variable, index) => (
          <div key={variable.id} className="border p-4 rounded">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm mb-1">Variable ID</label>
                <input
                  type="text"
                  value={variable.id}
                  onChange={(e) => {
                    const newVars = [...variables];
                    newVars[index].id = e.target.value;
                    setVariables(newVars);
                  }}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Label</label>
                <input
                  type="text"
                  value={variable.label}
                  onChange={(e) => {
                    const newVars = [...variables];
                    newVars[index].label = e.target.value;
                    setVariables(newVars);
                  }}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1">Type</label>
                <select
                  value={variable.type}
                  onChange={(e) => {
                    const newVars = [...variables];
                    newVars[index].type = e.target.value;
                    setVariables(newVars);
                  }}
                  className="w-full px-2 py-1 border rounded"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    checked={variable.required}
                    onChange={(e) => {
                      const newVars = [...variables];
                      newVars[index].required = e.target.checked;
                      setVariables(newVars);
                    }}
                    className="mr-2"
                  />
                  Required
                </label>
              </div>
              <div>
                <label className="block text-sm mb-1">Validation</label>
                <input
                  type="text"
                  value={variable.validation}
                  onChange={(e) => {
                    const newVars = [...variables];
                    newVars[index].validation = e.target.value;
                    setVariables(newVars);
                  }}
                  placeholder="e.g. required|min:3"
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setVariables(variables.filter((_, i) => i !== index));
              }}
              className="mt-2 text-red-600 text-sm hover:underline"
            >
              Remove Variable
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded">
        <h4 className="font-semibold mb-2">Validation Rules:</h4>
        <ul className="text-sm space-y-1">
          <li><code>required</code> - Field must not be empty</li>
          <li><code>min:n</code> - Minimum length</li>
          <li><code>max:n</code> - Maximum length</li>
          <li><code>email</code> - Valid email format</li>
          <li><code>numeric</code> - Numbers only</li>
          <li><code>alphanumeric</code> - Letters and numbers only</li>
          <li><code>date</code> - Valid date format</li>
        </ul>
      </div>
    </div>
  );

  const renderMappingTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Field Mapping Configuration</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Data Source</label>
          <select
            value={mappingConfig.source}
            onChange={(e) => setMappingConfig({ ...mappingConfig, source: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="student">Student Data</option>
            <option value="module">Module Data</option>
            <option value="custom">Custom Data</option>
          </select>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Field Mappings</h4>
          <div className="space-y-3">
            {variables.map(variable => (
              <div key={variable.id} className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Template Variable</label>
                  <input
                    type="text"
                    value={variable.label}
                    disabled
                    className="w-full px-2 py-1 border rounded bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Maps to</label>
                  <input
                    type="text"
                    value={mappingConfig.fieldMappings[variable.id] || ''}
                    onChange={(e) => {
                      setMappingConfig({
                        ...mappingConfig,
                        fieldMappings: {
                          ...mappingConfig.fieldMappings,
                          [variable.id]: e.target.value
                        }
                      });
                    }}
                    placeholder="e.g. student.name"
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 mt-6">
          <h4 className="font-semibold mb-3">Transformations</h4>
          <div className="space-y-3">
            {variables.map(variable => (
              <div key={variable.id} className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">{variable.label}</label>
                </div>
                <div>
                  <select
                    value={mappingConfig.transformations[variable.id] || 'none'}
                    onChange={(e) => {
                      setMappingConfig({
                        ...mappingConfig,
                        transformations: {
                          ...mappingConfig.transformations,
                          [variable.id]: e.target.value
                        }
                      });
                    }}
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="none">No transformation</option>
                    <option value="uppercase">UPPERCASE</option>
                    <option value="lowercase">lowercase</option>
                    <option value="capitalize">Capitalize</option>
                    <option value="formatDate:DD/MM/YYYY">Format Date (DD/MM/YYYY)</option>
                    <option value="formatDate:MM/DD/YYYY">Format Date (MM/DD/YYYY)</option>
                    <option value="truncate:50">Truncate (50 chars)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderValidationTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Validation Rules</h3>

      <div className="space-y-4">
        {Object.entries(validationRules).map(([field, rule]) => (
          <div key={field} className="border p-4 rounded">
            <div className="font-semibold mb-2">{field}</div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm mb-1">Pattern (Regex)</label>
                <input
                  type="text"
                  value={rule.pattern}
                  onChange={(e) => {
                    setValidationRules({
                      ...validationRules,
                      [field]: { ...rule, pattern: e.target.value }
                    });
                  }}
                  className="w-full px-2 py-1 border rounded font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Error Message</label>
                <input
                  type="text"
                  value={rule.message}
                  onChange={(e) => {
                    setValidationRules({
                      ...validationRules,
                      [field]: { ...rule, message: e.target.value }
                    });
                  }}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            const newField = prompt('Enter field name:');
            if (newField) {
              setValidationRules({
                ...validationRules,
                [newField]: {
                  pattern: '',
                  message: ''
                }
              });
            }
          }}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ➕ Add Validation Rule
        </button>
      </div>

      <div className="bg-green-50 p-4 rounded">
        <h4 className="font-semibold mb-2">Test Validation</h4>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Test Roll No (e.g., CS2024001)"
            className="w-full px-3 py-2 border rounded"
            onChange={(e) => {
              const pattern = new RegExp(validationRules.rollNo?.pattern || '');
              const isValid = pattern.test(e.target.value);
              e.target.className = `w-full px-3 py-2 border rounded ${
                isValid ? 'border-green-500' : 'border-red-500'
              }`;
            }}
          />
          <input
            type="text"
            placeholder="Test Reg No (e.g., REG2024001)"
            className="w-full px-3 py-2 border rounded"
            onChange={(e) => {
              const pattern = new RegExp(validationRules.regNo?.pattern || '');
              const isValid = pattern.test(e.target.value);
              e.target.className = `w-full px-3 py-2 border rounded ${
                isValid ? 'border-green-500' : 'border-red-500'
              }`;
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderPreviewTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Live Preview with Sample Data</h3>

      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Preview Data</h4>
        <div className="grid grid-cols-2 gap-3">
          {variables.map(variable => (
            <div key={variable.id}>
              <label className="block text-sm mb-1">{variable.label}</label>
              <input
                type={variable.type}
                value={previewData[variable.id] || ''}
                onChange={(e) => setPreviewData({
                  ...previewData,
                  [variable.id]: e.target.value
                })}
                className="w-full px-2 py-1 border rounded"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border p-4 rounded bg-gray-50">
        <h4 className="font-semibold mb-3">Certificate Preview</h4>
        {templateType === 'html' ? (
          <div className="bg-white p-8 border rounded">
            <div dangerouslySetInnerHTML={{
              __html: htmlContent.replace(/\{\{(\w+)\}\}/g, (match, key) => previewData[key] || match)
            }} />
          </div>
        ) : (
          <div className="bg-white border rounded">
            <Stage
              width={canvasSize.width}
              height={canvasSize.height}
              style={{ border: '1px solid #ccc' }}
            >
              <Layer>
                {backgroundImage && (
                  <Image
                    image={backgroundImage}
                    width={canvasSize.width}
                    height={canvasSize.height}
                  />
                )}
                {canvasElements.map(element => {
                  if (element.type === 'text') {
                    const displayText = element.variable 
                      ? previewData[element.variable] || element.text
                      : element.text;
                    
                    return (
                      <Text
                        key={element.id}
                        id={element.id}
                        x={element.x}
                        y={element.y}
                        text={displayText}
                        fontSize={element.fontSize}
                        fontFamily={element.fontFamily}
                        fill={element.fill}
                      />
                    );
                  } else if (element.type === 'rect') {
                    return (
                      <Rect
                        key={element.id}
                        id={element.id}
                        x={element.x}
                        y={element.y}
                        width={element.width}
                        height={element.height}
                        fill={element.fill}
                        stroke={element.stroke}
                        strokeWidth={element.strokeWidth}
                      />
                    );
                  }
                  return null;
                })}
              </Layer>
            </Stage>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Dynamic Template Builder</h2>
          <p className="text-sm text-gray-600">Create smart certificates</p>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Template Name</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter template name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Template Type</label>
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="html">HTML Template</option>
              <option value="canvas">Canvas (PDF Mapping)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              placeholder="Template description"
            />
          </div>
        </div>

        <div className="flex flex-col">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-left border-b transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-l-blue-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mr-3">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t space-y-2">
          <button
            onClick={saveTemplate}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            💾 Save Template
          </button>
          <button
            onClick={() => {
              const template = exportTemplate();
              const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${templateName || 'template'}.json`;
              a.click();
            }}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            📥 Export JSON
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeTab === 'design' && renderDesignTab()}
          {activeTab === 'variables' && renderVariablesTab()}
          {activeTab === 'mapping' && renderMappingTab()}
          {activeTab === 'validation' && renderValidationTab()}
          {activeTab === 'preview' && renderPreviewTab()}
          
          {activeTab === 'export' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Export Template</h3>
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(exportTemplate(), null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Canvas Preview */}
      {templateType === 'canvas' && activeTab === 'design' && (
        <div className="w-1/2 bg-gray-50 p-8 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Canvas Editor</h3>
          <div className="bg-white rounded shadow-lg inline-block">
            <Stage
              ref={stageRef}
              width={canvasSize.width}
              height={canvasSize.height}
              onClick={(e) => {
                if (e.target === e.target.getStage()) {
                  setSelectedElement(null);
                }
              }}
            >
              <Layer>
                {backgroundImage && (
                  <Image
                    image={backgroundImage}
                    width={canvasSize.width}
                    height={canvasSize.height}
                  />
                )}
                {canvasElements.map(element => {
                  if (element.type === 'text') {
                    return (
                      <Text
                        key={element.id}
                        id={element.id}
                        {...element}
                        onClick={() => setSelectedElement(element)}
                        onDragEnd={(e) => {
                          updateElement(element.id, {
                            x: e.target.x(),
                            y: e.target.y()
                          });
                        }}
                      />
                    );
                  } else if (element.type === 'rect') {
                    return (
                      <Rect
                        key={element.id}
                        id={element.id}
                        {...element}
                        onClick={() => setSelectedElement(element)}
                        onDragEnd={(e) => {
                          updateElement(element.id, {
                            x: e.target.x(),
                            y: e.target.y()
                          });
                        }}
                      />
                    );
                  }
                  return null;
                })}
                {selectedElement && <Transformer ref={transformerRef} />}
              </Layer>
            </Stage>
          </div>
        </div>
      )}
    </div>
  );
}
