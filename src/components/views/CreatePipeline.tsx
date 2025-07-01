import React, { useState } from 'react';
import { Plus, ArrowLeft, Lightbulb, Cpu, Database, Target, Upload, Play, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useMockData } from '../../hooks/useMockData';
import { useAuth } from '../../context/AuthContext';

interface CreatePipelineProps {
  onBack: () => void;
}

export function CreatePipeline({ onBack }: CreatePipelineProps) {
  const { datasets, pipelines, addPipeline, setAlerts } = useMockData();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [createdPipelineId, setCreatedPipelineId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    pipelineName: '',
    modelType: 'random_forest',
    targetColumn: '',
    testSize: 0.2,
    trainingFile: null as File | null,
    epochs: 100,
    learningRate: 0.001,
  });

  const modelTypeOptions = [
    { value: '', label: 'Select Model Type...' },
    { value: 'logistic_regression', label: 'Logistic Regression' },
    { value: 'random_forest', label: 'Random Forest' },
    { value: 'xgboost', label: 'XGBoost' },
  ];

  const handleInputChange = (field: string, value: any) => {
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Pipeline Name validation
    if (!formData.pipelineName.trim()) {
      errors.pipelineName = 'Pipeline name is required';
    } else if (formData.pipelineName.trim().length < 3) {
      errors.pipelineName = 'Pipeline name must be at least 3 characters';
    }
    
    // Model Type validation
    if (!formData.modelType || formData.modelType === '') {
      errors.modelType = 'Model type is required';
    }
    
    // Target Column validation
    if (!formData.targetColumn.trim()) {
      errors.targetColumn = 'Target column name is required';
    }
    
    // Training File validation
    if (!formData.trainingFile) {
      errors.trainingFile = 'Training data file is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleFileUpload = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setAlerts(prev => [{
        id: `alert_${Date.now()}`,
        type: 'performance' as const,
        severity: 'medium' as const,
        message: 'Please upload a CSV file for training data',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      }, ...prev]);
      return;
    }
    
    // Clear file error when valid file is uploaded
    if (formErrors.trainingFile) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.trainingFile;
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      trainingFile: file
    }));
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setAlerts(prev => [{
        id: `alert_${Date.now()}`,
        type: 'performance' as const,
        severity: 'medium' as const,
        message: 'Please fix the form errors before submitting',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      }, ...prev]);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare FormData for multipart/form-data submission
      const formDataToSend = new FormData();
      
      // Add the file
      if (formData.trainingFile) {
        formDataToSend.append('training_file', formData.trainingFile);
      }
      
      // Add form data as JSON
      const pipelineConfig = {
        pipeline_name: formData.pipelineName,
        model_type: formData.modelType,
        target_column: formData.targetColumn,
        test_size: formData.testSize,
        epochs: formData.epochs,
        learning_rate: formData.learningRate,
      };
      
      formDataToSend.append('config', JSON.stringify(pipelineConfig));
      
      // Send POST request to API endpoint
      const response = await fetch('http://localhost:8000/create-pipeline', {
        method: 'POST',
        body: formDataToSend,
        // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }
      
      const result = await response.json();
      console.log('Pipeline creation response:', result);

      // Check if API response includes pipeline_id
      if (result.pipeline_id) {
        setCreatedPipelineId(result.pipeline_id);
      }

      const newPipeline = {
        id: `pipeline_${Date.now()}`,
        name: formData.pipelineName,
        description: `${modelTypeOptions.find(m => m.value === formData.modelType)?.label} model for ${formData.targetColumn} prediction`,
        status: 'idle' as const,
        progress: 0,
        created_at: new Date().toISOString(),
        algorithm: formData.modelType,
        dataset_id: datasets.length > 0 ? datasets[0].id : undefined,
        hyperparameters: {
          test_size: formData.testSize,
          epochs: formData.epochs,
          learning_rate: formData.learningRate,
          target_column: formData.targetColumn,
        },
      };

      addPipeline(newPipeline);
      
      // Show success toast
      setAlerts(prev => [{
        id: `alert_${Date.now()}`,
        type: 'performance' as const,
        severity: 'low' as const,
        message: '✅ Pipeline created successfully!',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      }, ...prev]);

      // Navigate back to pipelines
      onBack();
    } catch (error) {
      console.error('Pipeline creation failed:', error);
      
      // Show error toast
      setAlerts(prev => [{
        id: `alert_${Date.now()}`,
        type: 'performance' as const,
        severity: 'high' as const,
        message: '❌ Failed to create pipeline. Please try again.',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      }, ...prev]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartCreating = () => {
    setFormData(prev => ({
      ...prev,
      modelType: '' // Reset to empty to force user selection
    }));
    setShowForm(true);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowForm(false)}
              className="p-2 hover:bg-slate-700/50 transition-colors"
              disabled={isSubmitting}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Create New Pipeline</h1>
              <p className="text-slate-400 text-sm sm:text-base mt-1">Configure your machine learning workflow</p>
            </div>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl border-slate-600/30 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-xl sm:text-2xl">
                <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/20">
                  <Plus size={20} className="text-blue-400" />
                </div>
                <span>Pipeline Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* Pipeline Name */}
                <div className="space-y-3">
                  <label htmlFor="pipelineName" className="block text-sm font-semibold text-slate-200 tracking-wide">
                    Pipeline Name *
                  </label>
                  <input
                    id="pipelineName"
                    type="text"
                    value={formData.pipelineName}
                    onChange={(e) => handleInputChange('pipelineName', e.target.value)}
                    className={`w-full px-4 py-3.5 bg-slate-700/40 border rounded-xl text-slate-200 placeholder-slate-400 focus:ring-2 focus:bg-slate-700/60 transition-all duration-300 text-base ${
                      formErrors.pipelineName 
                        ? 'border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20' 
                        : 'border-slate-600/40 focus:border-blue-500/60 focus:ring-blue-500/20'
                    }`}
                    placeholder="e.g., Customer Churn Prediction Model"
                    disabled={isSubmitting}
                    required
                  />
                  {formErrors.pipelineName && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {formErrors.pipelineName}
                    </p>
                  )}
                </div>

                {/* Model Type and Target Column - Side by side on larger screens */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label htmlFor="modelType" className="block text-sm font-semibold text-slate-200 tracking-wide">
                      Model Type *
                    </label>
                    <select
                      id="modelType"
                      value={formData.modelType}
                      onChange={(e) => handleInputChange('modelType', e.target.value)}
                      className={`w-full px-4 py-3.5 bg-slate-700/40 border rounded-xl text-slate-200 focus:ring-2 focus:bg-slate-700/60 transition-all duration-300 text-base ${
                        formErrors.modelType 
                          ? 'border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20' 
                          : 'border-slate-600/40 focus:border-blue-500/60 focus:ring-blue-500/20'
                      }`}
                      disabled={isSubmitting}
                      required
                    >
                      {modelTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.modelType && (
                      <p className="text-red-400 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {formErrors.modelType}
                      </p>
                    )}
                  </div>

                  {/* Target Column Name */}
                  <div className="space-y-3">
                    <label htmlFor="targetColumn" className="block text-sm font-semibold text-slate-200 tracking-wide">
                      Target Column Name *
                    </label>
                    <input
                      id="targetColumn"
                      type="text"
                      value={formData.targetColumn}
                      onChange={(e) => handleInputChange('targetColumn', e.target.value)}
                      className={`w-full px-4 py-3.5 bg-slate-700/40 border rounded-xl text-slate-200 placeholder-slate-400 focus:ring-2 focus:bg-slate-700/60 transition-all duration-300 text-base ${
                        formErrors.targetColumn 
                          ? 'border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20' 
                          : 'border-slate-600/40 focus:border-blue-500/60 focus:ring-blue-500/20'
                      }`}
                      placeholder="e.g., churn, target, label"
                      disabled={isSubmitting}
                      required
                    />
                    {formErrors.targetColumn && (
                      <p className="text-red-400 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {formErrors.targetColumn}
                      </p>
                    )}
                  </div>
                </div>

                {/* Test Size */}
                <div className="space-y-3">
                  <label htmlFor="testSize" className="block text-sm font-semibold text-slate-200 tracking-wide">
                    Test Size
                  </label>
                  <input
                    id="testSize"
                    type="number"
                    min="0.1"
                    max="0.5"
                    step="0.05"
                    value={formData.testSize}
                    onChange={(e) => handleInputChange('testSize', parseFloat(e.target.value))}
                    className="w-full px-4 py-3.5 bg-slate-700/40 border border-slate-600/40 rounded-xl text-slate-200 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-700/60 transition-all duration-300 text-base sm:max-w-xs"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-slate-400 leading-relaxed">Proportion of dataset to use for testing (0.1 - 0.5)</p>
                </div>

                {/* File Upload */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-200 tracking-wide">
                    Training Data (CSV) *
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-300 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' :
                      formErrors.trainingFile ? 'border-red-500/60 bg-red-500/10' :
                      dragActive 
                        ? 'border-blue-500/60 bg-blue-500/10 scale-[1.02]' 
                        : 'border-slate-600/40 hover:border-slate-500/50 bg-slate-700/20 hover:bg-slate-700/30'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                      <div className={`p-3 sm:p-4 rounded-xl transition-colors ${formData.trainingFile ? 'bg-green-500/15 border border-green-500/30' : 'bg-slate-600/20 border border-slate-600/30'}`}>
                        <Upload size={28} className={`${formData.trainingFile ? 'text-green-400' : 'text-slate-400'} transition-colors`} />
                      </div>
                      
                      {formData.trainingFile ? (
                        <div className="text-center">
                          <p className="text-green-400 font-medium text-sm sm:text-base">{formData.trainingFile.name}</p>
                          <p className="text-xs sm:text-sm text-slate-400 mt-1">
                            {(formData.trainingFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-slate-300 mb-2 text-sm sm:text-base">
                            {dragActive ? 'Drop your CSV file here' : 'Drop your CSV file here or click to browse'}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-400">
                            Supports CSV files up to 100MB
                          </p>
                        </div>
                      )}
                      
                      <label htmlFor="file-input">
                        <Button 
                          variant={formData.trainingFile ? "secondary" : "primary"} 
                          size="sm"
                          as="span"
                          className="cursor-pointer transition-transform hover:scale-105"
                          disabled={isSubmitting}
                        >
                          {formData.trainingFile ? 'Change File' : 'Choose File'}
                        </Button>
                      </label>
                      <input
                        id="file-input"
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        disabled={isSubmitting}
                        className="hidden"
                      />
                    </div>
                  </div>
                  {formErrors.trainingFile && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {formErrors.trainingFile}
                    </p>
                  )}
                </div>

                {/* Training Parameters */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-200 flex items-center">
                    <div className="p-1.5 bg-purple-500/20 rounded-lg mr-3">
                      <Target size={16} className="text-purple-400" />
                    </div>
                    Training Parameters
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Number of Training Epochs */}
                    <div className="space-y-3">
                      <label htmlFor="epochs" className="block text-sm font-semibold text-slate-200 tracking-wide">
                        Number of Training Epochs
                      </label>
                      <input
                        id="epochs"
                        type="number"
                        min="1"
                        max="1000"
                        value={formData.epochs}
                        onChange={(e) => handleInputChange('epochs', parseInt(e.target.value))}
                        className="w-full px-4 py-3.5 bg-slate-700/40 border border-slate-600/40 rounded-xl text-slate-200 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-700/60 transition-all duration-300 text-base"
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-slate-400 leading-relaxed">Number of complete passes through the training dataset</p>
                    </div>

                    {/* Learning Rate */}
                    <div className="space-y-3">
                      <label htmlFor="learningRate" className="block text-sm font-semibold text-slate-200 tracking-wide">
                        Learning Rate
                      </label>
                      <input
                        id="learningRate"
                        type="number"
                        min="0.0001"
                        max="1"
                        step="0.0001"
                        value={formData.learningRate}
                        onChange={(e) => handleInputChange('learningRate', parseFloat(e.target.value))}
                        className="w-full px-4 py-3.5 bg-slate-700/40 border border-slate-600/40 rounded-xl text-slate-200 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-700/60 transition-all duration-300 text-base"
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-slate-400 leading-relaxed">Controls how much to change the model in response to error</p>
                    </div>
                  </div>
                </div>

                {/* Configuration Summary */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/40 rounded-xl p-5 sm:p-6">
                  <h4 className="font-semibold text-blue-300 mb-4 flex items-center text-base">
                    <Target size={16} className="mr-2" />
                    Configuration Summary
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Model:</span>
                      <span className="text-slate-200 ml-2">
                        {modelTypeOptions.find(m => m.value === formData.modelType)?.label || 'Not selected'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Target:</span>
                      <span className="text-slate-200 ml-2">
                        {formData.targetColumn || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Test Split:</span>
                      <span className="text-slate-200 ml-2">{(formData.testSize * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Training File:</span>
                      <span className="text-slate-200 ml-2">
                        {formData.trainingFile ? formData.trainingFile.name : 'Not uploaded'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pipeline ID Display */}
                {createdPipelineId && (
                  <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-800/40 rounded-xl p-5 sm:p-6">
                    <h4 className="font-semibold text-green-300 mb-4 flex items-center text-base">
                      <Target size={16} className="mr-2" />
                      Pipeline Created Successfully
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Pipeline ID:</span>
                        <code className="text-green-400 bg-slate-800/50 px-3 py-1.5 rounded-lg font-mono text-sm border border-green-500/20">
                          {createdPipelineId}
                        </code>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            // Navigate to pipeline logs view
                            console.log('View logs for pipeline:', createdPipelineId);
                            onBack(); // For now, go back to pipelines list
                          }}
                          className="flex-1"
                        >
                          <Database size={16} className="mr-2" />
                          View Pipeline Logs
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            // Navigate to pipeline details view
                            console.log('View details for pipeline:', createdPipelineId);
                            onBack(); // For now, go back to pipelines list
                          }}
                          className="flex-1"
                        >
                          <Cpu size={16} className="mr-2" />
                          View Pipeline Details
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className={`flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 ${createdPipelineId ? 'pt-4' : 'pt-6'}`}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    disabled={isSubmitting || createdPipelineId !== null}
                    className="flex-1 py-4 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Pipeline...
                      </>
                    ) : createdPipelineId ? (
                      <>
                        <CheckCircle size={20} className="mr-2" />
                        Pipeline Created
                      </>
                    ) : (
                      <>
                        <Play size={20} className="mr-2" />
                        Create Pipeline
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant={createdPipelineId ? "primary" : "secondary"}
                    size="lg"
                    onClick={() => setShowForm(false)}
                    disabled={isSubmitting}
                    className="sm:px-8 py-4 transition-transform hover:scale-[1.02]"
                  >
                    {createdPipelineId ? 'Back to Pipelines' : 'Cancel'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Create New Pipeline</h1>
            <p className="text-slate-400 mt-1">Build and deploy machine learning workflows</p>
          </div>
        </div>
        <Badge variant="info" size="sm">
          {pipelines.length} existing pipelines
        </Badge>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Getting Started Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl border-slate-600/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Plus size={20} className="text-blue-400" />
                </div>
                <span>Create Your Pipeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-colors">
                  <div className="p-3 bg-blue-500/10 rounded-lg w-fit mx-auto mb-4">
                    <Database size={24} className="text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200 mb-2">1. Upload Data</h3>
                  <p className="text-sm text-slate-400">Upload CSV training data</p>
                </div>
                
                <div className="text-center p-6 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-colors">
                  <div className="p-3 bg-green-500/10 rounded-lg w-fit mx-auto mb-4">
                    <Cpu size={24} className="text-green-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200 mb-2">2. Configure Model</h3>
                  <p className="text-sm text-slate-400">Select algorithm and parameters</p>
                </div>
                
                <div className="text-center p-6 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-colors">
                  <div className="p-3 bg-purple-500/10 rounded-lg w-fit mx-auto mb-4">
                    <Target size={24} className="text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200 mb-2">3. Deploy & Monitor</h3>
                  <p className="text-sm text-slate-400">Launch and track performance</p>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <Lightbulb size={20} className="text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-300 mb-2">Quick Start Tips</h4>
                    <ul className="text-sm text-blue-200 space-y-1">
                      <li>• Ensure your CSV has a clear target column for predictions</li>
                      <li>• Start with default parameters and fine-tune based on results</li>
                      <li>• Consider data preprocessing for better model performance</li>
                      <li>• Monitor training progress and adjust epochs as needed</li>
                    </ul>
                  </div>
                </div>
              </div>

              {user?.role === 'admin' ? (
                <div className="flex justify-center pt-4">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={handleStartCreating}
                    className="px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus size={20} className="mr-2" />
                    Start Creating Pipeline
                  </Button>
                </div>
              ) : (
                <div className="text-center pt-4">
                  <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                    <p className="text-yellow-300 text-sm">
                      Admin access required to create pipelines. Contact your administrator for permissions.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Prerequisites */}
          <Card className="shadow-lg border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-lg">Prerequisites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Datasets Available</span>
                <Badge variant={datasets.length > 0 ? "success" : "warning"} size="sm">
                  {datasets.length}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Storage Space</span>
                <Badge variant="success" size="sm">
                  85% Free
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Compute Resources</span>
                <Badge variant="success" size="sm">
                  Available
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-lg border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-lg">Recent Pipelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pipelines.slice(0, 3).map((pipeline) => (
                  <div
                    key={pipeline.id}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {pipeline.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(pipeline.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        pipeline.status === 'completed' ? 'success' :
                        pipeline.status === 'running' ? 'info' : 'default'
                      }
                      size="sm"
                    >
                      {pipeline.status}
                    </Badge>
                  </div>
                ))}
                
                {pipelines.length === 0 && (
                  <div className="text-center py-6">
                    <Cpu size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No pipelines yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Help & Resources */}
          <Card className="shadow-lg border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <a 
                  href="#" 
                  className="block text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  📖 Pipeline Creation Guide
                </a>
                <a 
                  href="#" 
                  className="block text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  🎯 Algorithm Selection Tips
                </a>
                <a 
                  href="#" 
                  className="block text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  📊 Data Preparation Best Practices
                </a>
                <a 
                  href="#" 
                  className="block text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  💬 Get Support
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}