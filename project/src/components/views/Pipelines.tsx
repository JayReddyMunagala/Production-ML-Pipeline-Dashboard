import React, { useState } from 'react';
import { Play, Pause, RefreshCw, Settings, Eye, Trash2, Copy, MoreVertical, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { CreatePipelineForm } from '../forms/CreatePipelineForm';
import { PipelineSettingsModal } from '../modals/PipelineSettingsModal';
import { DeleteConfirmModal } from '../ui/DeleteConfirmModal';
import { useMockData } from '../../hooks/useMockData';
import { useAuth } from '../../context/AuthContext';
import { Pipeline } from '../../types';

export function Pipelines() {
  const { pipelines, setPipelines, deletePipeline, updatePipelineSettings, datasets } = useMockData();
  const { user } = useAuth();
  
  // Force re-render when pipelines change
  React.useEffect(() => {
    // This effect will run whenever pipelines array changes
    console.log('Pipelines updated:', pipelines.length);
  }, [pipelines]);
  
  // Sort pipelines by creation date (newest first) and mark recent ones
  const sortedPipelines = pipelines
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(pipeline => ({
      ...pipeline,
      isNew: (new Date().getTime() - new Date(pipeline.created_at).getTime()) < 24 * 60 * 60 * 1000 // Less than 24 hours old
    }));

  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pipelineToEdit, setPipelineToEdit] = useState<Pipeline | null>(null);
  const [pipelineToDelete, setPipelineToDelete] = useState<string | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

  const handleStartPipeline = (id: string) => {
    const pipeline = pipelines.find(p => p.id === id);
    if (!pipeline) return;
    
    setPipelines(prev => prev.map(p => 
      p.id === id ? { 
        ...p, 
        status: 'running' as const, 
        progress: 0,
        model_accuracy: undefined // Clear previous accuracy while training
      } : p
    ));
    
    // Simulate training progress with accuracy updates
    const interval = setInterval(() => {
      setPipelines(prev => prev.map(p => {
        if (p.id === id && p.status === 'running') {
          const newProgress = Math.min(100, p.progress + Math.random() * 10);
          
          // Update accuracy gradually during training
          let newAccuracy = p.model_accuracy;
          if (newProgress > 20) {
            // Start showing accuracy after 20% progress
            const baseAccuracy = {
              'random_forest': 0.85,
              'logistic_regression': 0.78,
              'svm': 0.82,
              'gradient_boosting': 0.87,
              'neural_network': 0.89,
              'decision_tree': 0.76,
              'naive_bayes': 0.73,
            }[p.algorithm || 'random_forest'] || 0.8;
            
            // Gradually improve accuracy as training progresses
            const progressFactor = (newProgress - 20) / 80; // 0 to 1 as progress goes from 20% to 100%
            const variability = (Math.random() - 0.5) * 0.1; // Random variation
            newAccuracy = Math.max(0.5, Math.min(0.98, 
              baseAccuracy * (0.7 + 0.3 * progressFactor) + variability
            ));
          }
          
          if (newProgress >= 100) {
            clearInterval(interval);
            
            // Final accuracy calculation
            const finalBaseAccuracy = {
              'random_forest': 0.89,
              'logistic_regression': 0.82,
              'svm': 0.85,
              'gradient_boosting': 0.91,
              'neural_network': 0.93,
              'decision_tree': 0.79,
              'naive_bayes': 0.76,
            }[p.algorithm || 'random_forest'] || 0.85;
            
            const finalAccuracy = Math.max(0.75, Math.min(0.98, 
              finalBaseAccuracy + (Math.random() - 0.5) * 0.08
            ));
            
            // Update data drift score as well
            const driftScore = Math.max(0.02, Math.min(0.35, Math.random() * 0.25));
            
            return { 
              ...p, 
              progress: 100, 
              status: 'completed' as const,
              model_accuracy: finalAccuracy,
              data_drift_score: driftScore,
              last_run: new Date().toISOString()
            };
          }
          return { 
            ...p, 
            progress: newProgress,
            model_accuracy: newAccuracy
          };
        }
        return p;
      }));
    }, 1500); // Slightly slower updates for better UX
  };

  const handleStopPipeline = (id: string) => {
    setPipelines(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'idle' as const } : p
    ));
  };

  const handleCreateSuccess = () => {
    // Add a small delay to ensure the state has been updated
    setTimeout(() => {
      console.log('Pipeline creation completed, current count:', pipelines.length);
    }, 200);
    setShowCreateModal(false);
  };

  const handleEditPipeline = (pipeline: Pipeline) => {
    setPipelineToEdit(pipeline);
    setShowSettingsModal(true);
    setShowActionsMenu(null);
  };

  const handleSaveSettings = (settings: any) => {
    if (pipelineToEdit) {
      updatePipelineSettings(pipelineToEdit.id, settings);
    }
    setShowSettingsModal(false);
    setPipelineToEdit(null);
  };

  const handleDeletePipeline = (pipelineId: string, pipelineName: string) => {
    setPipelineToDelete(pipelineId);
    setShowDeleteModal(true);
    setShowActionsMenu(null);
  };

  const confirmDelete = () => {
    if (pipelineToDelete) {
      deletePipeline(pipelineToDelete);
      setPipelineToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleDuplicatePipeline = (pipeline: Pipeline) => {
    const duplicatedPipeline = {
      ...pipeline,
      id: `pipeline_${Date.now()}`,
      name: `${pipeline.name} (Copy)`,
      status: 'idle' as const,
      progress: 0,
      created_at: new Date().toISOString(),
      last_run: undefined,
    };
    
    setPipelines(prev => [duplicatedPipeline, ...prev]);
    setShowActionsMenu(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">ML Pipelines</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-slate-400">
            {pipelines.length} total pipeline{pipelines.length !== 1 ? 's' : ''}
            {sortedPipelines.filter(p => p.isNew).length > 0 && (
              <span className="ml-2 text-green-400">
                • {sortedPipelines.filter(p => p.isNew).length} new
              </span>
            )}
          </div>
          
        {user?.role === 'admin' && (
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            Create New Pipeline
          </Button>
        )}
        </div>
      </div>

      {/* Create Pipeline Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Pipeline"
        size="lg"
      >
        <CreatePipelineForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Pipeline Settings Modal */}
      {pipelineToEdit && (
        <PipelineSettingsModal
          isOpen={showSettingsModal}
          onClose={() => {
            setShowSettingsModal(false);
            setPipelineToEdit(null);
          }}
          onSave={handleSaveSettings}
          pipeline={pipelineToEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Pipeline"
        message="Are you sure you want to delete this pipeline? This action cannot be undone and will remove all associated data and history."
        confirmText="Delete Pipeline"
      />

      <div className="grid gap-6">
        {sortedPipelines.map((pipeline) => (
          <Card key={pipeline.id} hover>
            {(() => {
              // Get associated dataset for real metrics - fallback to first dataset if not found
              let associatedDataset = pipeline.dataset_id 
                ? datasets.find(d => d.id === pipeline.dataset_id)
                : null;
              
              // If no dataset found but datasets exist, use the first one as fallback
              if (!associatedDataset && datasets.length > 0) {
                associatedDataset = datasets[0];
              }
              
              const sampleCount = associatedDataset 
                ? associatedDataset.size.toLocaleString()
                : '125,000'; // Default fallback
              
              const featureCount = associatedDataset 
                ? associatedDataset.columns
                : 18; // Default fallback
              
              return (
            <>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <CardTitle>{pipeline.name}</CardTitle>
                    {pipeline.isNew && (
                      <Badge variant="success" size="sm">New</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {pipeline.description && (
                      <span className="block">{pipeline.description}</span>
                    )}
                    Created: {new Date(pipeline.created_at).toLocaleDateString()}
                    {pipeline.last_run && (
                      <span className="ml-4">
                        Last run: {new Date(pipeline.last_run).toLocaleString()}
                      </span>
                    )}
                    {pipeline.algorithm && (
                      <span className="ml-4">
                        Algorithm: {pipeline.algorithm.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    )}
                  </p>
                </div>
                <Badge
                  variant={
                    pipeline.status === 'completed' ? 'success' :
                    pipeline.status === 'running' ? 'info' :
                    pipeline.status === 'failed' ? 'danger' : 'default'
                  }
                >
                  {pipeline.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress */}
              {pipeline.status === 'running' && (
                <ProgressBar value={pipeline.progress} />
              )}

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    {pipeline.model_accuracy ? `${(pipeline.model_accuracy * 100).toFixed(1)}%` : 
                     pipeline.status === 'running' ? (
                       <span className="animate-pulse">Training...</span>
                     ) : 'N/A'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {pipeline.status === 'running' ? 'Current Accuracy' : 'Model Accuracy'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {pipeline.data_drift_score ? pipeline.data_drift_score.toFixed(3) : 
                     pipeline.status === 'running' ? (
                       <span className="animate-pulse">Analyzing...</span>
                     ) : 'N/A'}
                  </p>
                  <p className="text-xs text-slate-400">Drift Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{sampleCount}</p>
                  <p className="text-xs text-slate-400">
                    Training Samples
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{featureCount}</p>
                  <p className="text-xs text-slate-400">
                    Features
                  </p>
                </div>
              </div>
              
              {/* Training Progress Details */}
              {pipeline.status === 'running' && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                    <span className="text-sm text-blue-300">
                      Training {pipeline.algorithm?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} model...
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Algorithm:</span>
                      <span className="text-slate-200 ml-2">
                        {pipeline.algorithm?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Dataset:</span>
                      <span className="text-slate-200 ml-2">
                        {(() => {
                          const dataset = pipeline.dataset_id 
                            ? datasets.find(d => d.id === pipeline.dataset_id)
                            : null;
                          return dataset ? dataset.name : 'Unknown';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Completed Training Summary */}
              {pipeline.status === 'completed' && pipeline.model_accuracy && (
                <div className="text-center">
                  <div className="mt-4 p-3 bg-green-900/20 border border-green-800 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-sm text-green-300">Training completed successfully</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="text-center">
                        <p className="text-green-400 font-medium">{(pipeline.model_accuracy * 100).toFixed(1)}%</p>
                        <p className="text-slate-400">Final Accuracy</p>
                      </div>
                      <div className="text-center">
                        <p className="text-purple-400 font-medium">
                          {pipeline.data_drift_score ? pipeline.data_drift_score.toFixed(3) : 'N/A'}
                        </p>
                          {associatedDataset ? associatedDataset.name : 'Customer Data'}
                        <p className="text-slate-400">Completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <div className="flex space-x-2">
                  {user?.role === 'admin' && (
                    <>
                      {pipeline.status === 'running' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStopPipeline(pipeline.id)}
                        >
                          <Pause size={16} className="mr-1" />
                          Stop
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStartPipeline(pipeline.id)}
                        >
                          <Play size={16} className="mr-1" />
                          Start
                        </Button>
                      )}
                      
                      <Button variant="secondary" size="sm">
                        <RefreshCw size={16} className="mr-1" />
                        Retrain
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPipeline(pipeline.id)}
                  >
                    <Eye size={16} className="mr-1" />
                    View Details
                  </Button>
                </div>

                {user?.role === 'admin' && (
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowActionsMenu(showActionsMenu === pipeline.id ? null : pipeline.id)}
                    >
                      <MoreVertical size={16} />
                    </Button>
                    
                    {showActionsMenu === pipeline.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                        <div className="py-1">
                          <button
                            onClick={() => handleEditPipeline(pipeline)}
                            className="flex items-center w-full px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                          >
                            <Settings size={16} className="mr-2" />
                            Edit Settings
                          </button>
                          <button
                            onClick={() => handleDuplicatePipeline(pipeline)}
                            className="flex items-center w-full px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                          >
                            <Copy size={16} className="mr-2" />
                            Duplicate
                          </button>
                          <div className="border-t border-slate-700 my-1" />
                          <button
                            onClick={() => handleDeletePipeline(pipeline.id, pipeline.name)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete Pipeline
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            </>
              );
            })()}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {pipelines.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="p-4 bg-slate-700 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <RefreshCw size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">No ML Pipelines Yet</h3>
            <p className="text-slate-400 mb-6">Create your first pipeline to start training machine learning models</p>
            {user?.role === 'admin' && (
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create Your First Pipeline
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}