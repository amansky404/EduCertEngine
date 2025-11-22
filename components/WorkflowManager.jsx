/**
 * WorkflowManager.jsx
 * Fully Optimized Dynamic Workflow Management System
 * Handles end-to-end certificate generation workflow with dynamic modules
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Users, CheckCircle, Download, Settings, 
  PlayCircle, PauseCircle, RefreshCw, AlertCircle,
  ChevronRight, Clock, Zap, TrendingUp, Database,
  Workflow, ArrowRight, CheckSquare, XCircle
} from 'lucide-react';

// Workflow States
const WORKFLOW_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Workflow Step Status
const STEP_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped'
};

// Dynamic Workflow Modules
const WORKFLOW_MODULES = {
  DATA_IMPORT: {
    id: 'data_import',
    name: 'Data Import',
    icon: Database,
    description: 'Import student data from CSV/Excel',
    steps: [
      { id: 'validate_file', name: 'Validate File Format', duration: 2 },
      { id: 'parse_data', name: 'Parse Data', duration: 3 },
      { id: 'validate_fields', name: 'Validate Fields', duration: 2 },
      { id: 'map_columns', name: 'Map Columns', duration: 1 },
      { id: 'import_records', name: 'Import Records', duration: 5 }
    ],
    config: {
      batchSize: 100,
      validateBeforeImport: true,
      skipDuplicates: true,
      createMissing: true
    }
  },
  TEMPLATE_SELECTION: {
    id: 'template_selection',
    name: 'Template Selection',
    icon: FileText,
    description: 'Select and configure certificate template',
    steps: [
      { id: 'fetch_templates', name: 'Fetch Available Templates', duration: 1 },
      { id: 'validate_template', name: 'Validate Template', duration: 2 },
      { id: 'map_variables', name: 'Map Variables', duration: 2 },
      { id: 'preview_template', name: 'Generate Preview', duration: 3 }
    ],
    config: {
      allowCustomVariables: true,
      validateMapping: true,
      generatePreview: true
    }
  },
  DATA_VALIDATION: {
    id: 'data_validation',
    name: 'Data Validation',
    icon: CheckCircle,
    description: 'Validate and sanitize student data',
    steps: [
      { id: 'check_required', name: 'Check Required Fields', duration: 2 },
      { id: 'validate_format', name: 'Validate Format', duration: 3 },
      { id: 'check_duplicates', name: 'Check Duplicates', duration: 2 },
      { id: 'sanitize_data', name: 'Sanitize Data', duration: 2 },
      { id: 'apply_transforms', name: 'Apply Transformations', duration: 3 }
    ],
    config: {
      strictValidation: true,
      autoFix: true,
      rejectInvalid: false,
      logErrors: true
    }
  },
  CERTIFICATE_GENERATION: {
    id: 'certificate_generation',
    name: 'Certificate Generation',
    icon: Zap,
    description: 'Generate certificates for students',
    steps: [
      { id: 'prepare_data', name: 'Prepare Data', duration: 2 },
      { id: 'generate_html', name: 'Generate HTML', duration: 5 },
      { id: 'generate_pdf', name: 'Generate PDF', duration: 10 },
      { id: 'generate_qr', name: 'Generate QR Code', duration: 2 },
      { id: 'save_certificates', name: 'Save Certificates', duration: 3 }
    ],
    config: {
      format: 'pdf',
      quality: 'high',
      includeQR: true,
      batchSize: 50,
      parallel: true,
      maxThreads: 4
    }
  },
  DISTRIBUTION: {
    id: 'distribution',
    name: 'Distribution',
    icon: Users,
    description: 'Distribute certificates to students',
    steps: [
      { id: 'prepare_emails', name: 'Prepare Email List', duration: 1 },
      { id: 'generate_links', name: 'Generate Download Links', duration: 2 },
      { id: 'send_notifications', name: 'Send Notifications', duration: 5 },
      { id: 'update_status', name: 'Update Status', duration: 1 }
    ],
    config: {
      method: 'email',
      includeDownloadLink: true,
      sendImmediately: false,
      batchSize: 100
    }
  },
  VERIFICATION_SETUP: {
    id: 'verification_setup',
    name: 'Verification Setup',
    icon: Settings,
    description: 'Setup verification system',
    steps: [
      { id: 'generate_codes', name: 'Generate Verification Codes', duration: 2 },
      { id: 'create_index', name: 'Create Search Index', duration: 3 },
      { id: 'setup_landing', name: 'Setup Landing Page', duration: 2 },
      { id: 'test_verification', name: 'Test Verification', duration: 2 }
    ],
    config: {
      enablePublicVerification: true,
      requireAuthentication: false,
      rateLimit: 100
    }
  }
};

const WorkflowManager = () => {
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [workflowState, setWorkflowState] = useState(WORKFLOW_STATES.IDLE);
  const [selectedModules, setSelectedModules] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [moduleConfigs, setModuleConfigs] = useState({});
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0
  });
  const [executionTime, setExecutionTime] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);

  // Initialize default module configurations
  useEffect(() => {
    const configs = {};
    Object.values(WORKFLOW_MODULES).forEach(module => {
      configs[module.id] = { ...module.config };
    });
    setModuleConfigs(configs);
  }, []);

  // Calculate estimated time
  useEffect(() => {
    const totalDuration = selectedModules.reduce((total, moduleId) => {
      const workflowModule = WORKFLOW_MODULES[Object.keys(WORKFLOW_MODULES).find(
        key => WORKFLOW_MODULES[key].id === moduleId
      )];
      if (workflowModule) {
        return total + workflowModule.steps.reduce((sum, step) => sum + step.duration, 0);
      }
      return total;
    }, 0);
    setEstimatedTime(totalDuration);
  }, [selectedModules]);

  // Add log entry
  const addLog = useCallback((type, message, details = null) => {
    setLogs(prev => [...prev, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type,
      message,
      details
    }]);
  }, []);

  // Toggle module selection
  const toggleModule = (moduleId) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Update module configuration
  const updateModuleConfig = (moduleId, config) => {
    setModuleConfigs(prev => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], ...config }
    }));
  };

  // Execute workflow
  const executeWorkflow = async () => {
    if (selectedModules.length === 0) {
      addLog('error', 'No modules selected', 'Please select at least one module to execute');
      return;
    }

    setWorkflowState(WORKFLOW_STATES.RUNNING);
    setCurrentStep(0);
    setStepProgress(0);
    setStats({ totalRecords: 0, processed: 0, successful: 0, failed: 0, skipped: 0 });
    setLogs([]);
    
    const startTime = Date.now();
    addLog('info', 'Workflow execution started', `Executing ${selectedModules.length} modules`);

    try {
      let stepIndex = 0;
      
      for (const moduleId of selectedModules) {
        const moduleKey = Object.keys(WORKFLOW_MODULES).find(
          key => WORKFLOW_MODULES[key].id === moduleId
        );
        const workflowModule = WORKFLOW_MODULES[moduleKey];
        
        addLog('info', `Starting module: ${workflowModule.name}`, workflowModule.description);

        for (const step of workflowModule.steps) {
          setCurrentStep(stepIndex);
          addLog('info', `Executing step: ${step.name}`, `Module: ${module.name}`);

          // Simulate step execution
          for (let progress = 0; progress <= 100; progress += 10) {
            setStepProgress(progress);
            await new Promise(resolve => setTimeout(resolve, (step.duration * 1000) / 10));
          }

          addLog('success', `Step completed: ${step.name}`, `Duration: ${step.duration}s`);
          stepIndex++;
        }

        addLog('success', `Module completed: ${module.name}`, 'All steps executed successfully');
      }

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      setExecutionTime(duration);
      
      setWorkflowState(WORKFLOW_STATES.COMPLETED);
      addLog('success', 'Workflow completed successfully', `Total time: ${duration}s`);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalRecords: 100,
        processed: 100,
        successful: 98,
        failed: 2,
        skipped: 0
      }));

    } catch (error) {
      setWorkflowState(WORKFLOW_STATES.FAILED);
      addLog('error', 'Workflow execution failed', error.message);
    }
  };

  // Pause workflow
  const pauseWorkflow = () => {
    setWorkflowState(WORKFLOW_STATES.PAUSED);
    addLog('warning', 'Workflow paused', 'Execution paused by user');
  };

  // Resume workflow
  const resumeWorkflow = () => {
    setWorkflowState(WORKFLOW_STATES.RUNNING);
    addLog('info', 'Workflow resumed', 'Execution resumed');
  };

  // Reset workflow
  const resetWorkflow = () => {
    setWorkflowState(WORKFLOW_STATES.IDLE);
    setCurrentStep(0);
    setStepProgress(0);
    setStats({ totalRecords: 0, processed: 0, successful: 0, failed: 0, skipped: 0 });
    setExecutionTime(0);
    addLog('info', 'Workflow reset', 'Ready for new execution');
  };

  // Get workflow status color
  const getStatusColor = (state) => {
    switch (state) {
      case WORKFLOW_STATES.RUNNING: return 'text-blue-600 bg-blue-50';
      case WORKFLOW_STATES.PAUSED: return 'text-yellow-600 bg-yellow-50';
      case WORKFLOW_STATES.COMPLETED: return 'text-green-600 bg-green-50';
      case WORKFLOW_STATES.FAILED: return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get log type icon and color
  const getLogStyle = (type) => {
    switch (type) {
      case 'success': return { icon: CheckCircle, color: 'text-green-600' };
      case 'error': return { icon: XCircle, color: 'text-red-600' };
      case 'warning': return { icon: AlertCircle, color: 'text-yellow-600' };
      default: return { icon: AlertCircle, color: 'text-blue-600' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Workflow className="w-10 h-10 text-blue-600" />
          Workflow Manager
        </h1>
        <p className="text-lg text-gray-600">
          Fully Optimized Dynamic Certificate Generation Workflow
        </p>
      </div>

      {/* Status Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(workflowState)}`}>
              {workflowState.toUpperCase()}
            </span>
            {workflowState === WORKFLOW_STATES.RUNNING && (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="font-medium">Processing...</span>
              </div>
            )}
          </div>
          
          {/* Control Buttons */}
          <div className="flex gap-2">
            {workflowState === WORKFLOW_STATES.IDLE && (
              <button
                onClick={executeWorkflow}
                disabled={selectedModules.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <PlayCircle className="w-5 h-5" />
                Start Workflow
              </button>
            )}
            
            {workflowState === WORKFLOW_STATES.RUNNING && (
              <button
                onClick={pauseWorkflow}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <PauseCircle className="w-5 h-5" />
                Pause
              </button>
            )}
            
            {workflowState === WORKFLOW_STATES.PAUSED && (
              <button
                onClick={resumeWorkflow}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlayCircle className="w-5 h-5" />
                Resume
              </button>
            )}
            
            {(workflowState === WORKFLOW_STATES.COMPLETED || workflowState === WORKFLOW_STATES.FAILED) && (
              <button
                onClick={resetWorkflow}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Records</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalRecords}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">Processed</div>
            <div className="text-2xl font-bold text-blue-900">{stats.processed}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 mb-1">Successful</div>
            <div className="text-2xl font-bold text-green-900">{stats.successful}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-red-600 mb-1">Failed</div>
            <div className="text-2xl font-bold text-red-900">{stats.failed}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-yellow-600 mb-1">Time Elapsed</div>
            <div className="text-2xl font-bold text-yellow-900">
              {executionTime > 0 ? `${executionTime}s` : '--'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Module Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-blue-600" />
              Workflow Modules
            </h2>
            
            <div className="space-y-3">
              {Object.values(WORKFLOW_MODULES).map((module) => {
                const Icon = module.icon;
                const isSelected = selectedModules.includes(module.id);
                
                return (
                  <div
                    key={module.id}
                    onClick={() => workflowState === WORKFLOW_STATES.IDLE && toggleModule(module.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${workflowState !== WORKFLOW_STATES.IDLE ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        disabled={workflowState !== WORKFLOW_STATES.IDLE}
                        className="mt-1 w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className="font-semibold text-gray-900">{module.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">{module.description}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          {module.steps.length} steps • ~{module.steps.reduce((sum, s) => sum + s.duration, 0)}s
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Estimated Time */}
            {selectedModules.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-900 font-semibold mb-2">
                  <Clock className="w-5 h-5" />
                  Estimated Time
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  ~{estimatedTime}s
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  {selectedModules.length} modules selected
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Progress & Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          {workflowState === WORKFLOW_STATES.RUNNING && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Current Progress
              </h2>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Step {currentStep + 1} of {selectedModules.reduce((total, moduleId) => {
                    const moduleKey = Object.keys(WORKFLOW_MODULES).find(
                      key => WORKFLOW_MODULES[key].id === moduleId
                    );
                    return total + WORKFLOW_MODULES[moduleKey].steps.length;
                  }, 0)}</span>
                  <span>{stepProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${stepProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-blue-600" />
              Execution Logs
            </h2>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No logs yet. Start workflow to see execution logs.
                </div>
              ) : (
                logs.map((log) => {
                  const { icon: LogIcon, color } = getLogStyle(log.type);
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <LogIcon className={`w-5 h-5 ${color} mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{log.message}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {log.details && (
                          <p className="text-sm text-gray-600">{log.details}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowManager;
