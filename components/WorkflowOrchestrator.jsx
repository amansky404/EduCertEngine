/**
 * WorkflowOrchestrator.jsx
 * Advanced Workflow Orchestration System
 * Connects modules, manages execution, handles data flow
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  GitBranch, Play, Square, RotateCw, Save, Upload,
  Download, Settings, Zap, Clock, TrendingUp, AlertCircle,
  CheckCircle, XCircle, ArrowRight, Plus, Trash2, Edit2,
  Copy, Eye, Code, Database, FileJson, Link2
} from 'lucide-react';

// Canvas-based workflow builder
const WorkflowOrchestrator = () => {
  const [workflows, setWorkflows] = useState([]);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [executionState, setExecutionState] = useState('idle');
  const [executionLog, setExecutionLog] = useState([]);
  const [showNodePanel, setShowNodePanel] = useState(false);

  // Available node types
  const nodeTypes = [
    { type: 'start', name: 'Start', icon: Play, color: 'bg-green-500' },
    { type: 'import', name: 'Import Data', icon: Upload, color: 'bg-blue-500' },
    { type: 'process', name: 'Process', icon: Zap, color: 'bg-purple-500' },
    { type: 'validate', name: 'Validate', icon: CheckCircle, color: 'bg-yellow-500' },
    { type: 'generate', name: 'Generate', icon: FileJson, color: 'bg-orange-500' },
    { type: 'output', name: 'Output', icon: Download, color: 'bg-red-500' },
    { type: 'condition', name: 'Condition', icon: GitBranch, color: 'bg-indigo-500' },
    { type: 'end', name: 'End', icon: Square, color: 'bg-gray-500' }
  ];

  // Add new node
  const addNode = (type) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      name: nodeTypes.find(t => t.type === type)?.name || 'Node',
      position: { x: 100 + nodes.length * 50, y: 100 + nodes.length * 50 },
      config: {},
      inputs: [],
      outputs: []
    };
    setNodes([...nodes, newNode]);
    setShowNodePanel(false);
  };

  // Delete node
  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    if (selectedNode?.id === nodeId) setSelectedNode(null);
  };

  // Connect nodes
  const connectNodes = (fromId, toId) => {
    const existing = connections.find(c => c.from === fromId && c.to === toId);
    if (existing) return;

    setConnections([...connections, {
      id: `conn_${Date.now()}`,
      from: fromId,
      to: toId
    }]);
  };

  // Execute workflow
  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      alert('Please add nodes to the workflow');
      return;
    }

    setExecutionState('running');
    setExecutionLog([]);

    try {
      const startNode = nodes.find(n => n.type === 'start');
      if (!startNode) {
        throw new Error('No start node found');
      }

      await executeNode(startNode, {});
      setExecutionState('completed');
      addLog('success', 'Workflow completed successfully');
    } catch (error) {
      setExecutionState('failed');
      addLog('error', `Workflow failed: ${error.message}`);
    }
  };

  // Execute single node
  const executeNode = async (node, data) => {
    addLog('info', `Executing: ${node.name}`);

    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find next nodes
    const nextConnections = connections.filter(c => c.from === node.id);
    for (const conn of nextConnections) {
      const nextNode = nodes.find(n => n.id === conn.to);
      if (nextNode) {
        await executeNode(nextNode, data);
      }
    }
  };

  // Add log entry
  const addLog = (type, message) => {
    setExecutionLog(prev => [...prev, {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString()
    }]);
  };

  // Save workflow
  const saveWorkflow = () => {
    const workflow = {
      id: activeWorkflow?.id || `workflow_${Date.now()}`,
      name: activeWorkflow?.name || 'New Workflow',
      nodes,
      connections,
      createdAt: activeWorkflow?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (activeWorkflow) {
      setWorkflows(workflows.map(w => w.id === workflow.id ? workflow : w));
    } else {
      setWorkflows([...workflows, workflow]);
    }

    setActiveWorkflow(workflow);
    alert('Workflow saved successfully');
  };

  // Export workflow
  const exportWorkflow = () => {
    const workflow = {
      name: activeWorkflow?.name || 'Workflow',
      nodes,
      connections
    };

    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflow.name.replace(/\s+/g, '_')}.json`;
    link.click();
  };

  // Import workflow
  const importWorkflow = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workflow = JSON.parse(e.target.result);
        setNodes(workflow.nodes || []);
        setConnections(workflow.connections || []);
        setActiveWorkflow({ ...workflow, id: `workflow_${Date.now()}` });
      } catch (error) {
        alert('Failed to import workflow: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <GitBranch className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Workflow Orchestrator
              </h1>
              <p className="text-sm text-gray-600">
                {activeWorkflow?.name || 'Untitled Workflow'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNodePanel(!showNodePanel)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Node
            </button>

            <button
              onClick={saveWorkflow}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-5 h-5" />
              Save
            </button>

            <label className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer">
              <Upload className="w-5 h-5" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importWorkflow}
                className="hidden"
              />
            </label>

            <button
              onClick={exportWorkflow}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Download className="w-5 h-5" />
              Export
            </button>

            <button
              onClick={executeWorkflow}
              disabled={executionState === 'running'}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300"
            >
              <Play className="w-5 h-5" />
              Execute
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Canvas */}
        <div className="flex-1 relative bg-gray-100 overflow-auto">
          {/* Grid background */}
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />

          {/* Nodes */}
          <div className="relative">
            {nodes.map((node) => {
              const nodeType = nodeTypes.find(t => t.type === node.type);
              const Icon = nodeType?.icon || Code;
              const isSelected = selectedNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{
                    position: 'absolute',
                    left: node.position.x,
                    top: node.position.y,
                    cursor: 'move'
                  }}
                  className={`
                    bg-white rounded-lg shadow-lg p-4 min-w-[200px]
                    border-2 transition-all
                    ${isSelected ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-200'}
                  `}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${nodeType?.color || 'bg-gray-500'}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{node.name}</div>
                      <div className="text-xs text-gray-500">{node.type}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Connection points */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="w-4 h-4 bg-blue-500 rounded-full" title="Input" />
                    <div className="w-4 h-4 bg-green-500 rounded-full" title="Output" />
                  </div>
                </div>
              );
            })}

            {/* Connections */}
            <svg className="absolute inset-0 pointer-events-none">
              {connections.map((conn) => {
                const fromNode = nodes.find(n => n.id === conn.from);
                const toNode = nodes.find(n => n.id === conn.to);
                
                if (!fromNode || !toNode) return null;

                const x1 = fromNode.position.x + 200;
                const y1 = fromNode.position.y + 50;
                const x2 = toNode.position.x;
                const y2 = toNode.position.y + 50;

                return (
                  <g key={conn.id}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
                </marker>
              </defs>
            </svg>
          </div>

          {/* Node Panel */}
          {showNodePanel && (
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl p-4 z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Add Node</h3>
                <button
                  onClick={() => setShowNodePanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {nodeTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.type}
                      onClick={() => addNode(type.type)}
                      className="flex items-center gap-2 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <div className={`p-2 rounded ${type.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">{type.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
          {/* Node Config */}
          {selectedNode ? (
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Node Configuration
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Node Name
                  </label>
                  <input
                    type="text"
                    value={selectedNode.name}
                    onChange={(e) => {
                      setSelectedNode({ ...selectedNode, name: e.target.value });
                      setNodes(nodes.map(n => 
                        n.id === selectedNode.id ? { ...n, name: e.target.value } : n
                      ));
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Node Type
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                    {selectedNode.type}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Configuration (JSON)
                  </label>
                  <textarea
                    value={JSON.stringify(selectedNode.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        setSelectedNode({ ...selectedNode, config });
                        setNodes(nodes.map(n => 
                          n.id === selectedNode.id ? { ...n, config } : n
                        ));
                      } catch (err) {}
                    }}
                    className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
                    rows={8}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Execution Log */
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Execution Log
              </h3>

              <div className="space-y-2">
                {executionLog.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No execution logs yet
                  </p>
                ) : (
                  executionLog.map((log) => {
                    const icon = log.type === 'success' ? CheckCircle :
                                log.type === 'error' ? XCircle : AlertCircle;
                    const color = log.type === 'success' ? 'text-green-600' :
                                 log.type === 'error' ? 'text-red-600' : 'text-blue-600';
                    
                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        {React.createElement(icon, { className: `w-5 h-5 ${color} mt-0.5` })}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{log.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowOrchestrator;
