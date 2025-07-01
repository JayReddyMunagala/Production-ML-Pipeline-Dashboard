import React, { useState } from 'react';
import { Database, AlertCircle, CheckCircle, Loader, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { useMockData, analyzeDatasetColumns } from '../../hooks/useMockData';
import { Dataset } from '../../types';

interface CreatePipelineFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreatePipelineForm({ onSuccess, onCancel }: CreatePipelineFormProps) {
  const { datasets, addPipeline } = useMockData();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    datasetId: '',
    algorithm: 'random_forest',
    target_column: '',
    features: [] as string[],
  });

  const [datasetAnalysis, setDatasetAnalysis] = useState({
    isAnalyzing: false,
    columns: [] as string[],
    selectedDataset: null as Dataset | null,
    error: '',
    analysisComplete: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const algorithms = [
    { value: 'random_forest', label: 'Random Forest' },
    { value: 'logistic_regression', label: 'Logistic Regression' },
    { value: 'svm', label: 'Support Vector Machine' },
    { value: 'gradient_boosting', label: 'Gradient Boosting' },
    { value: 'neural_network', label: 'Neural Network' },
  ];

  const handleDatasetChange = async (datasetId: string) => {
    // Reset form data and clear previous analysis
    setFormData(prev => ({ 
      ...prev, 
      datasetId, 
      target_column: '', 
      features: [] 
    }));
    
    // Reset analysis state completely
    setDatasetAnalysis({
      isAnalyzing: false,
      columns: [],
      selectedDataset: null,
      error: '',
      analysisComplete: false,
    });

    // Only proceed if a valid dataset is selected
    if (datasetId && datasetId !== '') {
      const selectedDataset = datasets.find(d => d.id === datasetId);
      if (selectedDataset) {
        // Set analyzing state and selected dataset
        setDatasetAnalysis(prev => ({
          ...prev,
          isAnalyzing: true,
          selectedDataset,
          error: '', // Clear any previous errors
        }));

        try {
          // Perform fresh analysis for the selected dataset
          const columns = await analyzeDatasetColumns(selectedDataset);
          setDatasetAnalysis(prev => ({
            ...prev,
            isAnalyzing: false,
            columns,
            analysisComplete: true,
            error: '',
          }));
        } catch (error) {
          setDatasetAnalysis(prev => ({
            ...prev,
            isAnalyzing: false,
            columns: [], // Clear columns on error
            error: 'Failed to analyze dataset columns',
            analysisComplete: false,
          }));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newPipeline = {
      id: `pipeline_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      dataset_id: formData.datasetId || (datasets.length > 0 ? datasets[0].id : undefined),
      algorithm: formData.algorithm,
      status: 'idle' as const,
      progress: 0,
      created_at: new Date().toISOString(),
      model_accuracy: undefined,
      data_drift_score: undefined,
      hyperparameters: getDefaultHyperparameters(formData.algorithm),
    };

    const createdPipeline = addPipeline(newPipeline);
    
    // Small delay to ensure state has updated
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setIsSubmitting(false);
    onSuccess();
  };

  const getDefaultHyperparameters = (algorithm: string) => {
    const defaults: Record<string, any> = {
      random_forest: { n_estimators: 100, max_depth: 10, min_samples_split: 5 },
      logistic_regression: { C: 1.0, max_iter: 1000, penalty: 'l2' },
      svm: { C: 1.0, kernel: 'rbf', gamma: 'scale' },
      gradient_boosting: { n_estimators: 100, learning_rate: 0.1, max_depth: 6 },
      neural_network: { hidden_layers: 3, learning_rate: 0.001, batch_size: 32 },
    };
    return defaults[algorithm] || {};
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const availableColumns = datasetAnalysis.columns;
  const availableFeatures = availableColumns.filter(col => col !== formData.target_column);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pipeline Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
          Pipeline Name *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="e.g., Customer Churn Prediction v2"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-200 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Describe what this pipeline does..."
          rows={3}
        />
      </div>

      {/* Dataset Selection */}
      <div>
        <label htmlFor="dataset" className="block text-sm font-medium text-slate-200 mb-2">
          Dataset *
        </label>
        <select
          id="dataset"
          value={formData.datasetId}
          onChange={(e) => handleDatasetChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          required
        >
          <option value="">Select a dataset</option>
          {datasets.map(dataset => (
            <option key={dataset.id} value={dataset.id}>
              {dataset.name} ({dataset.size.toLocaleString()} records)
            </option>
          ))}
        </select>
      </div>

      {/* Dataset Analysis Status */}
      {formData.datasetId && (
        <div className="space-y-3">
          {datasetAnalysis.isAnalyzing && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                <div className="flex-1">
                  <p className="text-sm text-blue-300 mb-2">
                    Analyzing "{datasetAnalysis.selectedDataset?.name}" structure...
                  </p>
                  <ProgressBar value={75} variant="info" showLabel={false} className="h-2" />
                </div>
              </div>
              <p className="text-xs text-blue-400 mt-2">
                📊 Scanning {datasetAnalysis.selectedDataset?.size.toLocaleString()} records across {datasetAnalysis.selectedDataset?.columns} columns
              </p>
            </div>
          )}

          {datasetAnalysis.analysisComplete && (
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm text-green-300">
                  Analysis complete for "{datasetAnalysis.selectedDataset?.name}"
                </span>
              </div>
              <p className="text-xs text-green-400">
                Identified {datasetAnalysis.columns.length} columns: {datasetAnalysis.columns.slice(0, 3).join(', ')}
                {datasetAnalysis.columns.length > 3 && `... +${datasetAnalysis.columns.length - 3} more`}
              </p>
            </div>
          )}

          {datasetAnalysis.error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-sm text-red-300">{datasetAnalysis.error}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDatasetChange(formData.datasetId)}
                className="mt-2"
              >
                <RefreshCw size={14} className="mr-1" />
                Retry Analysis
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Algorithm Selection */}
      <div>
        <label htmlFor="algorithm" className="block text-sm font-medium text-slate-200 mb-2">
          Algorithm *
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
      </div>

      {/* Target Column */}
      {datasetAnalysis.analysisComplete && (
        <div>
          <label htmlFor="target" className="block text-sm font-medium text-slate-200 mb-2">
            Target Column *
          </label>
          <select
            id="target"
            value={formData.target_column}
            onChange={(e) => setFormData(prev => ({ ...prev, target_column: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          >
            <option value="">Select target column</option>
            {availableColumns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Choose the column you want to predict
          </p>
        </div>
      )}

      {/* Feature Selection */}
      {datasetAnalysis.analysisComplete && formData.target_column && (
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Features (optional)
          </label>
          <div className="max-h-32 overflow-y-auto border border-slate-600 rounded-lg p-3 bg-slate-700/50">
            <div className="flex flex-wrap gap-2">
              {availableFeatures.map(feature => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => handleFeatureToggle(feature)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    formData.features.includes(feature)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>
          {formData.features.length > 0 ? (
            <p className="text-xs text-slate-400 mt-2">
              {formData.features.length} features selected
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-2">
              Leave empty to auto-select all available features
            </p>
          )}
        </div>
      )}

      {/* Analysis Required Message */}
      {formData.datasetId && !datasetAnalysis.analysisComplete && !datasetAnalysis.isAnalyzing && !datasetAnalysis.error && (
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Database size={16} className="text-slate-400" />
            <span className="text-sm text-slate-300">Please wait for dataset analysis to complete before selecting target column</span>
          </div>
        </div>
      )}

      {/* Missing Dataset Message */}
      {!formData.datasetId && datasets.length > 0 && (
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-yellow-400" />
            <span className="text-sm text-slate-300">
              Please select a dataset to analyze its column structure
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Available datasets: {datasets.length}
          </p>
        </div>
      )}

      {/* No Datasets Available */}
      {datasets.length === 0 && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-sm text-red-300">
              No datasets available. Please upload a dataset first.
            </span>
          </div>
        </div>
      )}

      {/* Algorithm Information */}
      {formData.algorithm && (
        <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
          <h4 className="text-sm font-medium text-slate-200 mb-2">Algorithm Details</h4>
          <div className="text-xs text-slate-400">
            {formData.algorithm === 'random_forest' && (
              <p>Random Forest: Ensemble method using multiple decision trees. Good for both classification and regression with built-in feature importance.</p>
            )}
            {formData.algorithm === 'logistic_regression' && (
              <p>Logistic Regression: Linear model for classification problems. Fast training and interpretable results.</p>
            )}
            {formData.algorithm === 'svm' && (
              <p>Support Vector Machine: Effective for high-dimensional data and complex decision boundaries.</p>
            )}
            {formData.algorithm === 'gradient_boosting' && (
              <p>Gradient Boosting: Sequential ensemble method that builds models iteratively to correct previous errors.</p>
            )}
            {formData.algorithm === 'neural_network' && (
              <p>Neural Network: Deep learning model capable of learning complex patterns in data.</p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={
            !formData.name || 
            !formData.datasetId || 
            !formData.target_column || 
            datasetAnalysis.isAnalyzing ||
            !datasetAnalysis.analysisComplete
          }
          className="flex-1"
        >
          {isSubmitting ? 'Creating Pipeline...' : 'Create Pipeline'}
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
    </form>
  );
}