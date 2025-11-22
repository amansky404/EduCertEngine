/**
 * DynamicModuleSystem.jsx
 * Advanced Dynamic Module System for Certificate Generation
 * Provides pluggable, configurable modules for workflow customization
 */

import React, { useState, useEffect } from 'react';
import {
  Package, Settings, Code, Database, Zap, Shield,
  Download, Upload, Mail, FileText, Users, CheckCircle,
  AlertTriangle, Info, Plus, Trash2, Edit, Save, X,
  Copy, RefreshCw, Eye, EyeOff, Lock, Unlock, ArrowRight
} from 'lucide-react';

// Module Types
const MODULE_TYPES = {
  INPUT: 'input',
  PROCESSOR: 'processor',
  VALIDATOR: 'validator',
  GENERATOR: 'generator',
  OUTPUT: 'output',
  NOTIFIER: 'notifier'
};

// Pre-built Modules
const SYSTEM_MODULES = {
  csv_import: {
    id: 'csv_import',
    name: 'CSV Import',
    type: MODULE_TYPES.INPUT,
    version: '1.0.0',
    icon: Upload,
    description: 'Import student data from CSV files',
    config: {
      delimiter: ',',
      encoding: 'utf-8',
      hasHeader: true,
      skipEmptyLines: true,
      trimFields: true
    },
    inputs: [],
    outputs: ['students'],
    code: `async function execute(config, inputs) {
  const students = await parseCSV(config.file, {
    delimiter: config.delimiter,
    hasHeader: config.hasHeader
  });
  return { students };
}`
  },
  excel_import: {
    id: 'excel_import',
    name: 'Excel Import',
    type: MODULE_TYPES.INPUT,
    version: '1.0.0',
    icon: Upload,
    description: 'Import student data from Excel files',
    config: {
      sheet: 0,
      startRow: 1,
      endRow: null
    },
    inputs: [],
    outputs: ['students'],
    code: `async function execute(config, inputs) {
  const students = await parseExcel(config.file, {
    sheet: config.sheet,
    startRow: config.startRow
  });
  return { students };
}`
  },
  api_import: {
    id: 'api_import',
    name: 'API Import',
    type: MODULE_TYPES.INPUT,
    version: '1.0.0',
    icon: Database,
    description: 'Fetch student data from external API',
    config: {
      endpoint: '',
      method: 'GET',
      headers: {},
      authentication: 'none'
    },
    inputs: [],
    outputs: ['students'],
    code: `async function execute(config, inputs) {
  const response = await fetch(config.endpoint, {
    method: config.method,
    headers: config.headers
  });
  const students = await response.json();
  return { students };
}`
  },
  field_mapper: {
    id: 'field_mapper',
    name: 'Field Mapper',
    type: MODULE_TYPES.PROCESSOR,
    version: '1.0.0',
    icon: Code,
    description: 'Map and transform data fields',
    config: {
      mappings: [],
      transformations: []
    },
    inputs: ['students'],
    outputs: ['mapped_students'],
    code: `async function execute(config, inputs) {
  const mapped = inputs.students.map(student => {
    const result = {};
    config.mappings.forEach(mapping => {
      result[mapping.target] = student[mapping.source];
    });
    return result;
  });
  return { mapped_students: mapped };
}`
  },
  data_validator: {
    id: 'data_validator',
    name: 'Data Validator',
    type: MODULE_TYPES.VALIDATOR,
    version: '1.0.0',
    icon: Shield,
    description: 'Validate student data against rules',
    config: {
      rules: [],
      strictMode: false,
      autoFix: false
    },
    inputs: ['students'],
    outputs: ['valid_students', 'invalid_students'],
    code: `async function execute(config, inputs) {
  const valid = [];
  const invalid = [];
  inputs.students.forEach(student => {
    const isValid = validateStudent(student, config.rules);
    if (isValid) valid.push(student);
    else invalid.push(student);
  });
  return { valid_students: valid, invalid_students: invalid };
}`
  },
  duplicate_checker: {
    id: 'duplicate_checker',
    name: 'Duplicate Checker',
    type: MODULE_TYPES.VALIDATOR,
    version: '1.0.0',
    icon: Copy,
    description: 'Check and remove duplicate records',
    config: {
      uniqueFields: ['rollNo'],
      keepFirst: true,
      markDuplicates: false
    },
    inputs: ['students'],
    outputs: ['unique_students', 'duplicates'],
    code: `async function execute(config, inputs) {
  const seen = new Set();
  const unique = [];
  const duplicates = [];
  inputs.students.forEach(student => {
    const key = config.uniqueFields.map(f => student[f]).join('-');
    if (seen.has(key)) {
      duplicates.push(student);
    } else {
      seen.add(key);
      unique.push(student);
    }
  });
  return { unique_students: unique, duplicates };
}`
  },
  certificate_generator: {
    id: 'certificate_generator',
    name: 'Certificate Generator',
    type: MODULE_TYPES.GENERATOR,
    version: '1.0.0',
    icon: FileText,
    description: 'Generate certificates from template',
    config: {
      templateId: null,
      format: 'pdf',
      quality: 'high',
      includeQR: true,
      batchSize: 50
    },
    inputs: ['students', 'template'],
    outputs: ['certificates'],
    code: `async function execute(config, inputs) {
  const certificates = [];
  for (const student of inputs.students) {
    const cert = await generateCertificate(student, inputs.template, config);
    certificates.push(cert);
  }
  return { certificates };
}`
  },
  qr_generator: {
    id: 'qr_generator',
    name: 'QR Code Generator',
    type: MODULE_TYPES.GENERATOR,
    version: '1.0.0',
    icon: Code,
    description: 'Generate QR codes for certificates',
    config: {
      size: 200,
      errorCorrection: 'M',
      includeUrl: true
    },
    inputs: ['certificates'],
    outputs: ['certificates_with_qr'],
    code: `async function execute(config, inputs) {
  const withQR = await Promise.all(
    inputs.certificates.map(async cert => {
      const qr = await generateQR(cert.id, config);
      return { ...cert, qrCode: qr };
    })
  );
  return { certificates_with_qr: withQR };
}`
  },
  pdf_exporter: {
    id: 'pdf_exporter',
    name: 'PDF Exporter',
    type: MODULE_TYPES.OUTPUT,
    version: '1.0.0',
    icon: Download,
    description: 'Export certificates as PDF files',
    config: {
      destination: 'local',
      path: '/certificates',
      naming: '{rollNo}_{name}.pdf',
      compress: false
    },
    inputs: ['certificates'],
    outputs: ['exported_files'],
    code: `async function execute(config, inputs) {
  const files = [];
  for (const cert of inputs.certificates) {
    const filename = formatFilename(config.naming, cert);
    const path = await savePDF(cert, config.path + '/' + filename);
    files.push(path);
  }
  return { exported_files: files };
}`
  },
  email_sender: {
    id: 'email_sender',
    name: 'Email Sender',
    type: MODULE_TYPES.NOTIFIER,
    version: '1.0.0',
    icon: Mail,
    description: 'Send certificates via email',
    config: {
      smtp: {},
      from: '',
      subject: 'Your Certificate',
      template: '',
      attachCertificate: true,
      batchSize: 100
    },
    inputs: ['certificates', 'students'],
    outputs: ['sent_emails', 'failed_emails'],
    code: `async function execute(config, inputs) {
  const sent = [];
  const failed = [];
  for (let i = 0; i < inputs.students.length; i++) {
    try {
      await sendEmail({
        to: inputs.students[i].email,
        subject: config.subject,
        body: config.template,
        attachments: config.attachCertificate ? [inputs.certificates[i]] : []
      });
      sent.push(inputs.students[i]);
    } catch (error) {
      failed.push({ student: inputs.students[i], error: error.message });
    }
  }
  return { sent_emails: sent, failed_emails: failed };
}`
  },
  sms_sender: {
    id: 'sms_sender',
    name: 'SMS Sender',
    type: MODULE_TYPES.NOTIFIER,
    version: '1.0.0',
    icon: Users,
    description: 'Send SMS notifications to students',
    config: {
      provider: 'twilio',
      apiKey: '',
      from: '',
      template: 'Your certificate is ready!'
    },
    inputs: ['students'],
    outputs: ['sent_sms', 'failed_sms'],
    code: `async function execute(config, inputs) {
  const sent = [];
  const failed = [];
  for (const student of inputs.students) {
    try {
      await sendSMS({
        to: student.phone,
        from: config.from,
        body: config.template
      });
      sent.push(student);
    } catch (error) {
      failed.push({ student, error: error.message });
    }
  }
  return { sent_sms: sent, failed_sms: failed };
}`
  }
};

const DynamicModuleSystem = () => {
  const [modules, setModules] = useState({ ...SYSTEM_MODULES });
  const [selectedModule, setSelectedModule] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New module form state
  const [newModule, setNewModule] = useState({
    id: '',
    name: '',
    type: MODULE_TYPES.PROCESSOR,
    version: '1.0.0',
    icon: 'Code',
    description: '',
    config: {},
    inputs: [],
    outputs: [],
    code: ''
  });

  // Filter modules
  const filteredModules = Object.values(modules).filter(module => {
    const matchesType = filterType === 'all' || module.type === filterType;
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Create new module
  const handleCreateModule = () => {
    if (!newModule.id || !newModule.name) {
      alert('Please provide module ID and name');
      return;
    }

    if (modules[newModule.id]) {
      alert('Module with this ID already exists');
      return;
    }

    setModules(prev => ({
      ...prev,
      [newModule.id]: { ...newModule }
    }));

    setIsCreating(false);
    resetNewModule();
  };

  // Update module
  const handleUpdateModule = () => {
    if (!selectedModule) return;

    setModules(prev => ({
      ...prev,
      [selectedModule.id]: { ...selectedModule }
    }));

    setEditMode(false);
  };

  // Delete module
  const handleDeleteModule = (moduleId) => {
    if (!confirm('Are you sure you want to delete this module?')) return;

    const newModules = { ...modules };
    delete newModules[moduleId];
    setModules(newModules);

    if (selectedModule?.id === moduleId) {
      setSelectedModule(null);
    }
  };

  // Duplicate module
  const handleDuplicateModule = (module) => {
    const newId = `${module.id}_copy_${Date.now()}`;
    const duplicated = {
      ...module,
      id: newId,
      name: `${module.name} (Copy)`,
      version: '1.0.0'
    };

    setModules(prev => ({
      ...prev,
      [newId]: duplicated
    }));
  };

  // Export module
  const handleExportModule = (module) => {
    const dataStr = JSON.stringify(module, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${module.id}_module.json`;
    link.click();
  };

  // Import module
  const handleImportModule = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (modules[imported.id]) {
          imported.id = `${imported.id}_imported_${Date.now()}`;
          imported.name = `${imported.name} (Imported)`;
        }
        setModules(prev => ({
          ...prev,
          [imported.id]: imported
        }));
      } catch (error) {
        alert('Failed to import module: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  // Reset new module form
  const resetNewModule = () => {
    setNewModule({
      id: '',
      name: '',
      type: MODULE_TYPES.PROCESSOR,
      version: '1.0.0',
      icon: 'Code',
      description: '',
      config: {},
      inputs: [],
      outputs: [],
      code: ''
    });
  };

  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case MODULE_TYPES.INPUT: return 'bg-blue-100 text-blue-800';
      case MODULE_TYPES.PROCESSOR: return 'bg-purple-100 text-purple-800';
      case MODULE_TYPES.VALIDATOR: return 'bg-green-100 text-green-800';
      case MODULE_TYPES.GENERATOR: return 'bg-orange-100 text-orange-800';
      case MODULE_TYPES.OUTPUT: return 'bg-red-100 text-red-800';
      case MODULE_TYPES.NOTIFIER: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get icon component
  const getIconComponent = (iconName) => {
    const icons = {
      Upload, Download, Code, Database, Zap, Shield,
      Mail, FileText, Users, CheckCircle, Copy, Package
    };
    return icons[iconName] || Code;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Package className="w-10 h-10 text-purple-600" />
          Dynamic Module System
        </h1>
        <p className="text-lg text-gray-600">
          Create, configure, and manage workflow modules
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Module List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Search & Filter */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {Object.entries(MODULE_TYPES).map(([key, value]) => (
                  <option key={value} value={value}>
                    {key.charAt(0) + key.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setIsCreating(true)}
              className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Module
            </button>

            {/* Import Button */}
            <label className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
              <Upload className="w-5 h-5" />
              Import Module
              <input
                type="file"
                accept=".json"
                onChange={handleImportModule}
                className="hidden"
              />
            </label>

            {/* Module List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredModules.map((module) => {
                const Icon = getIconComponent(module.icon);
                return (
                  <div
                    key={module.id}
                    onClick={() => setSelectedModule(module)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedModule?.id === module.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-gray-900">{module.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(module.type)}`}>
                        {module.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>v{module.version}</span>
                      <span>•</span>
                      <span>{module.inputs.length} inputs</span>
                      <span>•</span>
                      <span>{module.outputs.length} outputs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Module Details/Editor */}
        <div className="lg:col-span-2">
          {isCreating ? (
            /* Create Module Form */
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Module</h2>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    resetNewModule();
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module ID *
                  </label>
                  <input
                    type="text"
                    value={newModule.id}
                    onChange={(e) => setNewModule({ ...newModule, id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., custom_processor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module Name *
                  </label>
                  <input
                    type="text"
                    value={newModule.name}
                    onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Custom Data Processor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module Type *
                  </label>
                  <select
                    value={newModule.type}
                    onChange={(e) => setNewModule({ ...newModule, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {Object.entries(MODULE_TYPES).map(([key, value]) => (
                      <option key={value} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newModule.description}
                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Describe what this module does..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Input Variables (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newModule.inputs.join(', ')}
                    onChange={(e) => setNewModule({ 
                      ...newModule, 
                      inputs: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., students, template"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Variables (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newModule.outputs.join(', ')}
                    onChange={(e) => setNewModule({ 
                      ...newModule, 
                      outputs: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., processed_students"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Execution Code
                  </label>
                  <textarea
                    value={newModule.code}
                    onChange={(e) => setNewModule({ ...newModule, code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    rows={10}
                    placeholder="async function execute(config, inputs) { ... }"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateModule}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    Create Module
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      resetNewModule();
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : selectedModule ? (
            /* Module Details */
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {React.createElement(getIconComponent(selectedModule.icon), {
                    className: "w-8 h-8 text-purple-600"
                  })}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedModule.name}</h2>
                    <p className="text-sm text-gray-600">v{selectedModule.version}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                    title="Edit Module"
                  >
                    {editMode ? <EyeOff className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleDuplicateModule(selectedModule)}
                    className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                    title="Duplicate Module"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleExportModule(selectedModule)}
                    className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                    title="Export Module"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteModule(selectedModule.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete Module"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Type Badge */}
                <div>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getTypeColor(selectedModule.type)}`}>
                    {selectedModule.type.toUpperCase()}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedModule.description}</p>
                </div>

                {/* Inputs/Outputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Inputs</h3>
                    <div className="space-y-1">
                      {selectedModule.inputs.length > 0 ? (
                        selectedModule.inputs.map((input, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-700">
                            <ArrowRight className="w-4 h-4 text-blue-500" />
                            <code className="text-sm bg-blue-50 px-2 py-1 rounded">{input}</code>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No inputs</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Outputs</h3>
                    <div className="space-y-1">
                      {selectedModule.outputs.length > 0 ? (
                        selectedModule.outputs.map((output, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-700">
                            <ArrowRight className="w-4 h-4 text-green-500" />
                            <code className="text-sm bg-green-50 px-2 py-1 rounded">{output}</code>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No outputs</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Configuration */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Default Configuration</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 overflow-x-auto">
                      {JSON.stringify(selectedModule.config, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Code */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Execution Code</h3>
                  {editMode ? (
                    <div>
                      <textarea
                        value={selectedModule.code}
                        onChange={(e) => setSelectedModule({ ...selectedModule, code: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                        rows={15}
                      />
                      <button
                        onClick={handleUpdateModule}
                        className="mt-3 flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        Save Changes
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-green-400 font-mono">
                        {selectedModule.code}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* No Selection */
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Module Selected
              </h3>
              <p className="text-gray-600 mb-6">
                Select a module from the list or create a new one
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create New Module
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicModuleSystem;
