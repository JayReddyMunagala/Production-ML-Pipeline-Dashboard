import React, { useState } from 'react';
import { Plus, GitCompare, Play, Trash2, TrendingUp, Target, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { MetricsChart } from '../charts/MetricsChart';
import { CreateModelForm } from '../forms/CreateModelForm';
import { ModelComparisonModal } from '../modals/ModelComparisonModal';
import { DeleteConfirmModal } from '../ui/DeleteConfirmModal';
import { useMockData } from '../../hooks/useMockData';
import { useAuth } from '../../context/AuthContext';
import { Experiment } from '../../types';

export function Models() {
  const { experiments, addExperiment, deleteExperiment, startModelTraining } = useMockData();
  const { user } = useAuth();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  
  // Sort experiments by creation date (newest first)
  const sortedExperiments = experiments.sort((a, b) => 
    new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
  };

  const handleModelSelection = (modelId: string) => {
    setSelectedModels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedModels.size === experiments.length) {
      setSelectedModels(new Set());
    } else {
      setSelectedModels(new Set(experiments.map(e => e.id)));
    }
  };

  const handleCompareModels = () => {
    if (selectedModels.size >= 2) {
      setShowComparisonModal(true);
    }
  };

  const handleDeleteModel = (modelId: string) => {
    setModelToDelete(modelId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (modelToDelete) {
      deleteExperiment(modelToDelete);
      setSelectedModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelToDelete);
        return newSet;
      });
      setModelToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleStartTraining = (modelId: string) => {
    startModelTraining(modelId);
  };

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 0.9) return 'text-green-400';
    if (accuracy >= 0.8) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Models & Experiments</h1>
        <div className="flex items-center space-x-4">
          {selectedModels.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-300">
                {selectedModels.size} selected
              </span>
              {selectedModels.size >= 2 && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleCompareModels}
                >
                  <GitCompare size={16} className="mr-1" />
                  Compare ({selectedModels.size})
                </Button>
              )}
            </div>
          )}
          
          {user?.role === 'admin' && (
            <div className="flex space-x-2">
              {experiments.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedModels.size === experiments.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                <Plus size={16} className="mr-2" />
                Create New Model
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Model Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Model"
        size="lg"
      >
        <CreateModelForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Model Comparison Modal */}
      <ModelComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        selectedModels={experiments.filter(e => selectedModels.has(e.id))}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Model"
        message="Are you sure you want to delete this model? This action cannot be undone and will remove all training history and metrics."
        confirmText="Delete Model"
      />

      {/* Model Performance Summary */}
      {experiments.length > 0 && (
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Target size={24} className="text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">{experiments.length}</p>
                <p className="text-sm text-slate-400">Total Models</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle size={24} className="text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">
                  {experiments.filter(e => e.status === 'completed').length}
                </p>
                <p className="text-sm text-slate-400">Completed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <TrendingUp size={24} className="text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">
                  {experiments.length > 0 
                    ? `${(experiments.reduce((sum, e) => sum + e.metrics.accuracy, 0) / experiments.length * 100).toFixed(1)}%`
                    : '0%'
                  }
                </p>
                <p className="text-sm text-slate-400">Avg. Accuracy</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Clock size={24} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">
                  {experiments.length > 0 
                    ? `${Math.round(experiments.reduce((sum, e) => sum + e.metrics.training_time, 0) / experiments.length)}s`
                    : '0s'
                  }
                </p>
                <p className="text-sm text-slate-400">Avg. Training Time</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Model List */}
      <div className="grid gap-6">
        {sortedExperiments.map((experiment) => (
          <Card key={experiment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {user?.role === 'admin' && (
                    <input
                      type="checkbox"
                      checked={selectedModels.has(experiment.id)}
                      onChange={() => handleModelSelection(experiment.id)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  )}
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{experiment.name}</span>
                      {experiment.isNew && (
                        <Badge variant="success" size="sm">New</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-slate-400 mt-1">
                      Started: {new Date(experiment.start_time).toLocaleString()}
                      {experiment.duration && (
                        <span className="ml-4">Duration: {experiment.duration}s</span>
                      )}
                      <span className="ml-4">Algorithm: {experiment.algorithm}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      experiment.status === 'completed' ? 'success' :
                      experiment.status === 'running' ? 'info' : 
                      experiment.status === 'failed' ? 'danger' : 'default'
                    }
                  >
                    {experiment.status}
                  </Badge>
                  <Badge 
                    variant={
                      experiment.metrics.accuracy >= 0.9 ? 'success' :
                      experiment.metrics.accuracy >= 0.8 ? 'warning' : 'danger'
                    }
                    size="sm"
                  >
                    {(experiment.metrics.accuracy * 100).toFixed(1)}% accuracy
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Metrics Visualization */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-200 mb-4">Performance Metrics</h4>
                  <MetricsChart
                    accuracy={experiment.metrics.accuracy}
                    precision={experiment.metrics.precision}
                    recall={experiment.metrics.recall}
                    f1Score={experiment.metrics.f1_score}
                  />
                </div>

                {/* Parameters and Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-200 mb-2">Hyperparameters</h4>
                    <div className="bg-slate-700 rounded-lg p-4 space-y-2 max-h-32 overflow-y-auto">
                      {Object.entries(experiment.parameters).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-slate-400 text-sm">{key}:</span>
                          <span className="text-slate-200 text-sm">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-slate-200 mb-2">Additional Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                        <p className={`text-lg font-bold ${getPerformanceColor(experiment.metrics.auc_roc)}`}>
                          {(experiment.metrics.auc_roc * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-slate-400">AUC-ROC</p>
                      </div>
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                        <p className="text-lg font-bold text-blue-400">
                          {experiment.metrics.training_time}s
                        </p>
                        <p className="text-xs text-slate-400">Training Time</p>
                      </div>
                    </div>
                  </div>

                  {/* Model Actions */}
                  <div className="flex space-x-2 pt-4 border-t border-slate-700">
                    {user?.role === 'admin' && (
                      <>
                        {experiment.status === 'completed' && (
                          <Button variant="primary" size="sm">
                            Deploy Model
                          </Button>
                        )}
                        {experiment.status === 'idle' && (
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleStartTraining(experiment.id)}
                          >
                            <Play size={16} className="mr-1" />
                            Start Training
                          </Button>
                        )}
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDeleteModel(experiment.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {experiments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">No Models Created Yet</h3>
            <p className="text-slate-400 mb-6">Create your first machine learning model to get started</p>
            {user?.role === 'admin' && (
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                <Plus size={16} className="mr-2" />
                Create Your First Model
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}