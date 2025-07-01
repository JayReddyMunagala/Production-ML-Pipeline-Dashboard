import React, { useState } from 'react';
import { Target, Database, Cpu, Play } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { useMockData } from '../../hooks/useMockData';

interface CreateModelFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateModelForm({ onSuccess, onCancel }: CreateModelFormProps) {
  const { datasets, addExperiment } = useMockData();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    algorithm: 'random_forest',
    datasetId: '',
    targetColumn: '',
    features: [] as string[],
    hyperparameters: {
      n_estimators: 100,
      max_depth: 10,
      min_samples_split: 5,
      learning_rate: 0.1,
    },
    validationSplit: 0.2,
    crossValidation: true,
    earlyStop: true,
  });

  const [trainingState, setTrainingState] = useState({
    isTraining: false,
    progress: 0,
    currentStep: '',
    completed: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const algorithms = [
    { value: 'random_forest', label: 'Random Forest', description: 'Ensemble method with multiple decision trees' },
    { value: 'logistic_regression', label: 'Logistic Regression', description: 'Linear model for classification' },
    { value: 'svm', label: 'Support Vector Machine', description: 'Effective for high-dimensional data' },
    { value: 'gradient_boosting', label: 'Gradient Boosting', description: 'Sequential ensemble method' },
    { value: 'neural_network', label: 'Neural Network', description: 'Deep learning model' },
    { value: 'decision_tree', label: 'Decision Tree', description: 'Simple tree-based model' },
    { value: 'naive_bayes', label: 'Naive Bayes', description: 'Probabilistic classifier' },
  ];

  const selectedAlgorithm = algorithms.find(a => a.value === formData.algorithm);

  const handleHyperparameterChange = (key: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      hyperparameters: {
        ...prev.hyperparameters,
        [key]: value
      }
    }));
  };

  const getAlgorithmHyperparameters = (algorithm: string) => {
    const hyperparams: Record<string, any> = {
      random_forest: {
        n_estimators: { label: 'Number of Trees', min: 10, max: 500, step: 10 },
        max_depth: { label: 'Max Depth', min: 3, max: 30, step: 1 },
        min_samples_split: { label: 'Min Samples Split', min: 2, max: 20, step: 1 },
      },
      logistic_regression: {
        C: { label: 'Regularization Strength', min: 0.01, max: 10, step: 0.01 },
        max_iter: { label: 'Max Iterations', min: 100, max: 2000, step: 100 },
      },
      svm: {
        C: { label: 'Regularization Parameter', min: 0.1, max: 10, step: 0.1 },
        gamma: { label: 'Kernel Coefficient', min: 0.001, max: 1, step: 0.001 },
      },
      gradient_boosting: {
        n_estimators: { label: 'Number of Estimators', min: 50, max: 300, step: 10 },
        learning_rate: { label: 'Learning Rate', min: 0.01, max: 0.3, step: 0.01 },
        max_depth: { label: 'Max Depth', min: 3, max: 15, step: 1 },
      },
      neural_network: {
        hidden_layers: { label: 'Hidden Layers', min: 1, max: 5, step: 1 },
        learning_rate: { label: 'Learning Rate', min: 0.0001, max: 0.01, step: 0.0001 },
        batch_size: { label: 'Batch Size', min: 16, max: 128, step: 16 },
      },
      decision_tree: {
        max_depth: { label: 'Max Depth', min: 3, max: 20, step: 1 },
        min_samples_split: { label: 'Min Samples Split', min: 2, max: 20, step: 1 },
      },
      naive_bayes: {
        alpha: { label: 'Smoothing Parameter', min: 0.1, max: 2, step: 0.1 },
      },
    };

    return hyperparams[algorithm] || {};
  };

  const handleStartTraining = async () => {
    setTrainingState({ isTraining: true, progress: 0, currentStep: 'Initializing...', completed: false });

    const steps = [
      'Loading dataset...',
      'Preprocessing data...',
      'Splitting data...',
      'Training model...',
      'Validating model...',
      'Computing metrics...',
      'Finalizing model...',
    ];

    for (let i = 0; i < steps.length; i++) {
      setTrainingState(prev => ({
        ...prev,
        currentStep: steps[i],
        progress: ((i + 1) / steps.length) * 100
      }));
      
      // Simulate training time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    }

    // Generate realistic metrics based on algorithm
    const baseAccuracy = {
      random_forest: 0.88,
      logistic_regression: 0.82,
      svm: 0.85,
      gradient_boosting: 0.89,
      neural_network: 0.91,
      decision_tree: 0.79,
      naive_bayes: 0.76,
    }[formData.algorithm] || 0.8;

    const accuracy = baseAccuracy + (Math.random() - 0.5) * 0.1;
    const precision = accuracy + (Math.random() - 0.5) * 0.05;
    const recall = accuracy + (Math.random() - 0.5) * 0.05;
    const f1_score = 2 * (precision * recall) / (precision + recall);
    const auc_roc = accuracy + (Math.random() - 0.5) * 0.08;
    const training_time = Math.round(50 + Math.random() * 200);

    const newExperiment = {
      id: `experiment_${Date.now()}`,
      name: formData.name,
      status: 'completed' as const,
      algorithm: formData.algorithm,
      metrics: {
        accuracy: Math.max(0.5, Math.min(0.99, accuracy)),
        precision: Math.max(0.5, Math.min(0.99, precision)),
        recall: Math.max(0.5, Math.min(0.99, recall)),
        f1_score: Math.max(0.5, Math.min(0.99, f1_score)),
        auc_roc: Math.max(0.5, Math.min(0.99, auc_roc)),
        training_time,
      },
      parameters: formData.hyperparameters,
      start_time: new Date().toISOString(),
      duration: training_time,
      isNew: true,
    };

    addExperiment(newExperiment);
    
    setTrainingState(prev => ({ ...prev, completed: true }));
    
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create the model configuration first
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    await handleStartTraining();
  };

  const availableHyperparams = getAlgorithmHyperparameters(formData.algorithm);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!trainingState.isTraining && !trainingState.completed && (
        <>
          {/* Model Name and Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center">
              <Target size={20} className="mr-2" />
              Model Configuration
            </h3>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                Model Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Advanced Customer Churn Model v2"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-200 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Describe the purpose and goals of this model..."
                rows={3}
              />
            </div>
          </div>

          {/* Algorithm Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center">
              <Cpu size={20} className="mr-2" />
              Algorithm Selection
            </h3>

            <div>
              <label htmlFor="algorithm" className="block text-sm font-medium text-slate-200 mb-2">
                Machine Learning Algorithm *
              </label>
              <select
                id="algorithm"
                value={formData.algorithm}
                onChange={(e) => setFormData(prev => ({ ...prev, algorithm: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              >
                {algorithms.map(algo => (
                  <option key={algo.value} value={algo.value}>
                    {algo.label}
                  </option>
                ))}
              </select>
              {selectedAlgorithm && (
                <p className="text-sm text-slate-400 mt-2">
                  {selectedAlgorithm.description}
                </p>
              )}
            </div>
          </div>

          {/* Dataset Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center">
              <Database size={20} className="mr-2" />
              Data Configuration
            </h3>

            <div>
              <label htmlFor="dataset" className="block text-sm font-medium text-slate-200 mb-2">
                Training Dataset *
              </label>
              <select
                id="dataset"
                value={formData.datasetId}
                onChange={(e) => setFormData(prev => ({ ...prev, datasetId: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select a dataset</option>
                {datasets.map(dataset => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name} ({dataset.size.toLocaleString()} records, {dataset.columns} columns)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="validation-split" className="block text-sm font-medium text-slate-200 mb-2">
                  Validation Split
                </label>
                <input
                  id="validation-split"
                  type="number"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={formData.validationSplit}
                  onChange={(e) => setFormData(prev => ({ ...prev, validationSplit: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cross-validation"
                    checked={formData.crossValidation}
                    onChange={(e) => setFormData(prev => ({ ...prev, crossValidation: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="cross-validation" className="text-sm text-slate-200">
                    Cross Validation
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="early-stop"
                    checked={formData.earlyStop}
                    onChange={(e) => setFormData(prev => ({ ...prev, earlyStop: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="early-stop" className="text-sm text-slate-200">
                    Early Stopping
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Hyperparameters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">
              Hyperparameter Tuning
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(availableHyperparams).map(([key, config]) => (
                <div key={key}>
                  <label htmlFor={key} className="block text-sm font-medium text-slate-200 mb-2">
                    {config.label}
                  </label>
                  <input
                    id={key}
                    type="number"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={formData.hyperparameters[key] || config.min}
                    onChange={(e) => handleHyperparameterChange(key, parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Training Progress */}
      {trainingState.isTraining && (
        <div className="space-y-6">
          <div className="text-center">
            <Play size={48} className="text-blue-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Training Model</h3>
            <p className="text-slate-400">
              Training "{formData.name}" using {selectedAlgorithm?.label}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{trainingState.currentStep}</span>
              <span className="text-sm text-slate-400">{Math.round(trainingState.progress)}%</span>
            </div>
            <ProgressBar value={trainingState.progress} variant="info" />
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="font-medium text-slate-200 mb-2">Training Configuration</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Algorithm:</span>
                <span className="text-slate-200 ml-2">{selectedAlgorithm?.label}</span>
              </div>
              <div>
                <span className="text-slate-400">Dataset:</span>
                <span className="text-slate-200 ml-2">
                  {datasets.find(d => d.id === formData.datasetId)?.name || 'Selected dataset'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Validation Split:</span>
                <span className="text-slate-200 ml-2">{(formData.validationSplit * 100)}%</span>
              </div>
              <div>
                <span className="text-slate-400">Cross Validation:</span>
                <span className="text-slate-200 ml-2">{formData.crossValidation ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training Complete */}
      {trainingState.completed && (
        <div className="text-center space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target size={32} className="text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">Training Complete!</h3>
            <p className="text-slate-400">
              Your model "{formData.name}" has been successfully trained and is ready for deployment.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      {!trainingState.isTraining && !trainingState.completed && (
        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={!formData.name || !formData.datasetId}
            className="flex-1"
          >
            <Play size={16} className="mr-2" />
            {isSubmitting ? 'Preparing...' : 'Start Training'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}