import React, { useState } from 'react';
import { Upload, Download, Database, FileText, AlertCircle, Globe, Activity, Link, Plus, Trash2, Merge, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { ConnectExternalDataForm } from '../forms/ConnectExternalDataForm';
import { DeleteConfirmModal } from '../ui/DeleteConfirmModal';
import { MergeDatasetModal } from '../modals/MergeDatasetModal';
import { useMockData } from '../../hooks/useMockData';
import { useAuth } from '../../context/AuthContext';

export function Data() {
  const { datasets, addDataset, deleteDataset, mergeDatasets, externalConnections, addExternalConnection, deleteExternalConnection, setAlerts } = useMockData();
  const { user } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExternalModal, setShowExternalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteConnectionModal, setShowDeleteConnectionModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedDatasets, setSelectedDatasets] = useState<Set<string>>(new Set());
  const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null);
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [processingDatasets, setProcessingDatasets] = useState<Set<string>>(new Set());
  const [uploadState, setUploadState] = useState({
    progress: 0,
    isUploading: false,
    file: null as File | null,
    analysis: null as any,
    error: '',
    processing: false,
    processingProgress: 0,
  });

  const analyzeFile = (file: File) => {
    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('File size must be less than 100MB');
    }

    // Validate file type
    const allowedTypes = ['csv', 'json', 'parquet', 'xlsx', 'xls'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      throw new Error('File type not supported. Please use CSV, JSON, Parquet, or Excel files.');
    }

    // Simulate file analysis
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockAnalysis = {
          rows: Math.floor(Math.random() * 1000000) + 10000,
          columns: Math.floor(Math.random() * 50) + 5,
          size: file.size,
          type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
          preview: [
            ['customer_id', 'age', 'income', 'churn'],
            ['C001', '25', '45000', '0'],
            ['C002', '34', '62000', '1'],
            ['C003', '45', '58000', '0'],
          ],
        };
        resolve(mockAnalysis);
      }, 1000);
    });
  };

  const processFile = async (file: File) => {
    if (!file) return;

    setUploadState(prev => ({ ...prev, file, isUploading: true, error: '' }));
    
    try {
      // Analyze the file
      const analysis = await analyzeFile(file);
      setUploadState(prev => ({ ...prev, analysis, isUploading: false }));
    } catch (error) {
      setUploadState(prev => ({ 
        ...prev, 
        isUploading: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze file'
      }));
    }
  };

  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadState.file || !uploadState.analysis) return;

    // Capture current values before starting the interval
    const currentFile = uploadState.file;
    const currentAnalysis = uploadState.analysis;

    setUploadState(prev => ({ ...prev, isUploading: true, progress: 0 }));

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadState(prev => {
        const newProgress = prev.progress + Math.random() * 20;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Add the dataset
          const newDataset = addDataset({
            name: currentFile.name,
            file: currentFile,
            size: currentAnalysis.rows,
            columns: currentAnalysis.columns,
          });
          
          // Start automatic preprocessing
          setTimeout(() => {
            startAutomaticProcessing(newDataset.id, currentFile.name);
          }, 1000);
          
          return { ...prev, progress: 100 };
        }
        return { ...prev, progress: newProgress };
      });
    }, 300);
  };

  const startAutomaticProcessing = (datasetId: string, datasetName: string) => {
    // Start processing
    setUploadState(prev => ({ 
      ...prev, 
      processing: true, 
      processingProgress: 0 
    }));
    setProcessingDatasets(prev => new Set([...prev, datasetId]));

    // Simulate preprocessing steps
    const processingSteps = [
      'Analyzing data quality...',
      'Detecting missing values...',
      'Identifying data types...',
      'Checking for duplicates...',
      'Generating statistical summary...',
      'Creating data profile...',
      'Preprocessing complete!'
    ];

    let stepIndex = 0;
    const processingInterval = setInterval(() => {
      setUploadState(prev => {
        const newProgress = prev.processingProgress + (100 / processingSteps.length);
        
        if (newProgress >= 100) {
          clearInterval(processingInterval);
          
          // Complete processing
          setTimeout(() => {
            setProcessingDatasets(prevSet => {
              const newSet = new Set(prevSet);
              newSet.delete(datasetId);
              return newSet;
            });
            
            // Reset upload state and close modal
            setUploadState({
              progress: 0,
              isUploading: false,
              file: null,
              analysis: null,
              error: '',
              processing: false,
              processingProgress: 0,
            });
            setShowUploadModal(false);
          }, 1000);
          
          return { ...prev, processingProgress: 100 };
        }
        
        stepIndex++;
        return { ...prev, processingProgress: newProgress };
      });
    }, 800);
  };

  const handleManualPreprocess = (datasetId: string) => {
    setProcessingDatasets(prev => new Set([...prev, datasetId]));
    
    // Simulate preprocessing
    setTimeout(() => {
      setProcessingDatasets(prev => {
        const newSet = new Set(prev);
        newSet.delete(datasetId);
        return newSet;
      });
    }, 5000);
  };

  const handleDownloadDataset = async (dataset: any) => {
    // Simulate download preparation
    const downloadButton = document.querySelector(`[data-download="${dataset.id}"]`) as HTMLButtonElement;
    if (downloadButton) {
      downloadButton.disabled = true;
      downloadButton.innerHTML = `<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>Preparing...`;
    }

    // Simulate API call to prepare download
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create and trigger download
    const blob = new Blob([`Dataset: ${dataset.name}\nRecords: ${dataset.size}\nColumns: ${dataset.columns}\nCreated: ${dataset.created_at}\n\n# This is a simulated download\n# In a real application, this would contain the actual dataset`], 
      { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Restore button state
    if (downloadButton) {
      downloadButton.disabled = false;
      downloadButton.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`;
    }

    // Add success alert
    setAlerts(prev => [{
      id: `alert_${Date.now()}`,
      type: 'performance' as const,
      severity: 'low' as const,
      message: `Dataset "${dataset.name}" downloaded successfully`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    }, ...prev]);
  };

  const handleExternalConnectionSuccess = () => {
    setShowExternalModal(false);
  };

  const handleDeleteDataset = (datasetId: string) => {
    setDatasetToDelete(datasetId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (datasetToDelete) {
      deleteDataset(datasetToDelete);
      setDatasetToDelete(null);
      setShowDeleteModal(false);
      // Remove from selected if it was selected
      setSelectedDatasets(prev => {
        const newSet = new Set(prev);
        newSet.delete(datasetToDelete);
        return newSet;
      });
    }
  };

  const handleDeleteConnection = (connectionId: string) => {
    setConnectionToDelete(connectionId);
    setShowDeleteConnectionModal(true);
  };

  const confirmDeleteConnection = () => {
    if (connectionToDelete) {
      deleteExternalConnection(connectionToDelete);
      setConnectionToDelete(null);
      setShowDeleteConnectionModal(false);
    }
  };

  const handleSelectDataset = (datasetId: string) => {
    setSelectedDatasets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(datasetId)) {
        newSet.delete(datasetId);
      } else {
        newSet.add(datasetId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedDatasets.size === datasets.length) {
      setSelectedDatasets(new Set());
    } else {
      setSelectedDatasets(new Set(datasets.map(d => d.id)));
    }
  };

  const handleMergeSuccess = () => {
    setSelectedDatasets(new Set());
    setShowMergeModal(false);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Data Management</h1>
        <div className="flex items-center space-x-2">
          {selectedDatasets.size > 0 && (
            <div className="flex items-center space-x-2 mr-4">
              <span className="text-sm text-slate-300">
                {selectedDatasets.size} selected
              </span>
              {selectedDatasets.size >= 2 && user?.role === 'admin' && (
                <Button variant="secondary" size="sm" onClick={() => setShowMergeModal(true)}>
                  <Merge size={16} className="mr-1" />
                  Merge ({selectedDatasets.size})
                </Button>
              )}
            </div>
          )}
          
          {user?.role === 'admin' && (
            <div className="flex space-x-2">
              <Button variant="secondary">
                <Globe size={16} className="mr-2" />
                Sync All
              </Button>
              <Button variant="secondary" onClick={() => setShowExternalModal(true)}>
                <Link size={16} className="mr-2" />
                Connect External
              </Button>
              <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                <Upload size={16} className="mr-2" />
                Upload Dataset
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Dataset"
        size="lg"
      >
        <div className="space-y-6">
          {!uploadState.file ? (
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Select File
              </label>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-slate-600 hover:border-slate-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload size={48} className="text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 mb-2">
                  {dragActive ? 'Drop your file here' : 'Drop your file here or click to browse'}
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  Supports CSV, JSON, Parquet, and Excel files (max 100MB)
                </p>
                <label htmlFor="file-input">
                  <Button variant="primary" as="span">
                    Choose File
                  </Button>
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept=".csv,.json,.parquet,.xlsx,.xls"
                  onChange={handleFileSelection}
                  className="hidden"
                />
              </div>
              
              {uploadState.error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-800 rounded-lg">
                  <p className="text-red-300 text-sm">{uploadState.error}</p>
                </div>
              )}
            </div>
          ) : uploadState.isUploading && !uploadState.analysis ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
              <p className="text-slate-300">Analyzing file...</p>
            </div>
          ) : uploadState.analysis ? (
            <div className="space-y-6">
              {/* File Info */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="font-semibold text-slate-200 mb-2">File Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Name:</span>
                    <span className="text-slate-200 ml-2">{uploadState.file.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Size:</span>
                    <span className="text-slate-200 ml-2">{formatFileSize(uploadState.file.size)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Rows:</span>
                    <span className="text-slate-200 ml-2">{uploadState.analysis.rows.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Columns:</span>
                    <span className="text-slate-200 ml-2">{uploadState.analysis.columns}</span>
                  </div>
                </div>
              </div>

              {/* Data Preview */}
              <div>
                <h3 className="font-semibold text-slate-200 mb-2">Data Preview</h3>
                <div className="bg-slate-700 rounded-lg p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-600">
                        {uploadState.analysis.preview[0].map((header: string, index: number) => (
                          <th key={index} className="text-left py-2 px-3 text-slate-300">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {uploadState.analysis.preview.slice(1).map((row: string[], index: number) => (
                        <tr key={index}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="py-2 px-3 text-slate-400">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Upload Progress */}
              {uploadState.isUploading && (
                <div>
                  <p className="text-sm text-slate-200 mb-2">
                    Uploading dataset... {Math.round(uploadState.progress)}%
                  </p>
                  <ProgressBar value={uploadState.progress} />
                </div>
              )}

              {/* Processing Progress */}
              {uploadState.processing && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                    <p className="text-sm text-slate-200">
                      Auto-processing dataset... {Math.round(uploadState.processingProgress)}%
                    </p>
                  </div>
                  <ProgressBar 
                    value={uploadState.processingProgress} 
                    variant="success"
                  />
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400">
                      🔍 Analyzing data quality and generating insights...
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  disabled={uploadState.isUploading || uploadState.processing}
                  isLoading={uploadState.isUploading || uploadState.processing}
                  className="flex-1"
                >
                  {uploadState.isUploading ? 'Uploading...' : 
                   uploadState.processing ? 'Processing...' : 'Upload Dataset'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setUploadState({ progress: 0, isUploading: false, file: null, analysis: null, error: '', processing: false, processingProgress: 0 })}
                  disabled={uploadState.isUploading || uploadState.processing}
                >
                  Choose Different File
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>

      {/* External Connection Modal */}
      <Modal
        isOpen={showExternalModal}
        onClose={() => setShowExternalModal(false)}
        title="Connect External Data Source"
        size="xl"
      >
        <ConnectExternalDataForm
          onSuccess={handleExternalConnectionSuccess}
          onCancel={() => setShowExternalModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Dataset"
        message="Are you sure you want to delete this dataset? This action cannot be undone and will remove all associated data."
        confirmText="Delete Dataset"
      />

      {/* Delete Connection Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConnectionModal}
        onClose={() => setShowDeleteConnectionModal(false)}
        onConfirm={confirmDeleteConnection}
        title="Delete External Connection"
        message="Are you sure you want to delete this external connection? This will also remove the associated dataset and cannot be undone."
        confirmText="Delete Connection"
      />

      {/* Merge Datasets Modal */}
      <MergeDatasetModal
        isOpen={showMergeModal}
        onClose={() => setShowMergeModal(false)}
        onSuccess={handleMergeSuccess}
        selectedDatasets={datasets.filter(d => selectedDatasets.has(d.id))}
        onMerge={mergeDatasets}
      />

      {/* External Connections Overview */}
      {externalConnections.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-100">External Connections</h2>
            <Badge variant="info" size="sm">
              {externalConnections.length} Active
            </Badge>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {externalConnections.map((connection) => (
              <Card key={connection.id} hover>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-slate-700 rounded-lg">
                        {connection.type === 'rest_api' ? (
                          <Globe size={16} className="text-blue-400" />
                        ) : connection.type === 'database' ? (
                          <Database size={16} className="text-green-400" />
                        ) : (
                          <Link size={16} className="text-purple-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-200">{connection.name}</h3>
                        <p className="text-xs text-slate-400 capitalize">{connection.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        connection.status === 'connected' ? 'success' :
                        connection.status === 'error' ? 'danger' : 'default'
                      }
                      size="sm"
                    >
                      {connection.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Records:</span>
                      <span className="text-slate-200">{connection.recordCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sync:</span>
                      <span className="text-slate-200 capitalize">{connection.syncFrequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last sync:</span>
                      <span className="text-slate-200">
                        {new Date(connection.lastSync).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {user?.role === 'admin' && (
                    <div className="flex space-x-2 mt-4 pt-3 border-t border-slate-700">
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Activity size={14} className="mr-1" />
                        Sync Now
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDeleteConnection(connection.id)}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {user?.role === 'admin' && (
              <Card hover>
                <CardContent className="p-4 flex flex-col items-center justify-center min-h-[180px] cursor-pointer" onClick={() => setShowExternalModal(true)}>
                  <div className="p-3 bg-slate-700 rounded-lg mb-3">
                    <Plus size={24} className="text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-300 mb-1">Add Connection</h3>
                  <p className="text-sm text-slate-400 text-center">Connect to external APIs, databases, or webhooks</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Data Quality Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Database size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{datasets.length}</p>
              <p className="text-sm text-slate-400">Total Datasets</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <FileText size={24} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">
                {datasets.reduce((sum, d) => sum + d.size, 0).toLocaleString()}
              </p>
              <p className="text-sm text-slate-400">Total Records</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <AlertCircle size={24} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">
                {datasets.length > 0 ? (datasets.reduce((sum, d) => sum + d.null_percentage, 0) / datasets.length).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-slate-400">Avg. Missing Data</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dataset List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100">Available Datasets</h2>
          {datasets.length > 0 && user?.role === 'admin' && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                <Check size={16} className="mr-1" />
                {selectedDatasets.size === datasets.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          )}
        </div>
        
        {datasets.map((dataset) => (
          <Card key={dataset.id} hover>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                {user?.role === 'admin' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedDatasets.has(dataset.id)}
                      onChange={() => handleSelectDataset(dataset.id)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                )}
                
                <div className={`p-2 rounded-lg ${processingDatasets.has(dataset.id) ? 'bg-blue-500/20' : 'bg-slate-700'}`}>
                  {processingDatasets.has(dataset.id) ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                  ) : (
                    <FileText size={20} className="text-slate-400" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-slate-200">{dataset.name}</h3>
                    {processingDatasets.has(dataset.id) && (
                      <Badge variant="info" size="sm">Processing</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">
                    {dataset.size.toLocaleString()} records • {dataset.columns} columns
                  </p>
                  <p className="text-xs text-slate-500">
                    Created: {new Date(dataset.created_at).toLocaleDateString()}
                  </p>
                  {processingDatasets.has(dataset.id) && (
                    <div className="mt-2">
                      <ProgressBar value={75} variant="info" showLabel={false} className="h-1" />
                      <p className="text-xs text-blue-400 mt-1">Analyzing data quality...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-200">
                    {formatFileSize(dataset.size * 100)} {/* Rough estimate */}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={dataset.null_percentage > 10 ? 'warning' : 'success'}
                      size="sm"
                    >
                      {dataset.null_percentage}% missing
                    </Badge>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDownloadDataset(dataset)}
                    data-download={dataset.id}
                  >
                    <Download size={16} />
                  </Button>
                  {user?.role === 'admin' && (
                    <>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleManualPreprocess(dataset.id)}
                        disabled={processingDatasets.has(dataset.id)}
                        isLoading={processingDatasets.has(dataset.id)}
                      >
                        {processingDatasets.has(dataset.id) ? 'Processing...' : 'Preprocess'}
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDeleteDataset(dataset.id)}
                        disabled={processingDatasets.has(dataset.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {datasets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Database size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">No datasets uploaded yet</h3>
            <p className="text-slate-500 mb-6">Upload your first dataset to get started with ML pipelines</p>
            {user?.role === 'admin' && (
              <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                <Upload size={16} className="mr-2" />
                Upload Dataset
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}