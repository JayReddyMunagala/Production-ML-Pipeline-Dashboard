import React, { useState } from 'react';
import { Merge, Database, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Dataset } from '../../types';

interface MergeDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDatasets: Dataset[];
  onMerge: (datasetIds: string[], newName: string) => Dataset;
}

export function MergeDatasetModal({
  isOpen,
  onClose,
  onSuccess,
  selectedDatasets,
  onMerge
}: MergeDatasetModalProps) {
  const [mergeSettings, setMergeSettings] = useState({
    name: `Merged Dataset ${new Date().toLocaleDateString()}`,
    strategy: 'union', // union, intersection, custom
    handleDuplicates: 'keep_first', // keep_first, keep_last, remove_all
    preserveColumns: true,
  });

  const [mergeState, setMergeState] = useState({
    isProcessing: false,
    progress: 0,
    currentStep: '',
  });

  const mergeStrategies = [
    { value: 'union', label: 'Union (Combine all rows)', description: 'Include all rows from all datasets' },
    { value: 'intersection', label: 'Intersection (Common rows only)', description: 'Only include rows that exist in all datasets' },
    { value: 'custom', label: 'Custom Logic', description: 'Apply custom merge rules' }
  ];

  const duplicateHandling = [
    { value: 'keep_first', label: 'Keep First Occurrence' },
    { value: 'keep_last', label: 'Keep Last Occurrence' },
    { value: 'remove_all', label: 'Remove All Duplicates' }
  ];

  const totalRows = selectedDatasets.reduce((sum, d) => sum + d.size, 0);
  const totalColumns = Math.max(...selectedDatasets.map(d => d.columns));
  const avgMissingData = selectedDatasets.reduce((sum, d) => sum + d.null_percentage, 0) / selectedDatasets.length;

  const handleStartMerge = async () => {
    setMergeState({ isProcessing: true, progress: 0, currentStep: 'Initializing merge...' });

    const steps = [
      'Analyzing dataset schemas...',
      'Aligning column structures...',
      'Processing data conflicts...',
      'Merging datasets...',
      'Validating merged data...',
      'Finalizing merge...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setMergeState(prev => ({
        ...prev,
        currentStep: steps[i],
        progress: ((i + 1) / steps.length) * 100
      }));
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Perform the actual merge
    onMerge(selectedDatasets.map(d => d.id), mergeSettings.name);
    
    // Complete the process
    setMergeState({ isProcessing: false, progress: 100, currentStep: 'Merge completed!' });
    
    setTimeout(() => {
      onSuccess();
      setMergeState({ isProcessing: false, progress: 0, currentStep: '' });
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Merge Datasets" size="xl">
      <div className="space-y-6">
        {/* Selected Datasets Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center">
            <Database size={20} className="mr-2" />
            Selected Datasets ({selectedDatasets.length})
          </h3>
          
          <div className="grid gap-3">
            {selectedDatasets.map((dataset, index) => (
              <div key={dataset.id} className="flex items-center space-x-4 p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-slate-200">{dataset.name}</p>
                    <p className="text-sm text-slate-400">
                      {dataset.size.toLocaleString()} rows • {dataset.columns} columns • {dataset.null_percentage}% missing
                    </p>
                  </div>
                </div>
                {index < selectedDatasets.length - 1 && (
                  <ArrowRight size={16} className="text-slate-500 ml-auto" />
                )}
              </div>
            ))}
          </div>

          {/* Merge Preview */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-300 mb-2">Merge Preview</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Estimated rows:</span>
                <span className="text-slate-200 ml-2">{totalRows.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Max columns:</span>
                <span className="text-slate-200 ml-2">{totalColumns}</span>
              </div>
              <div>
                <span className="text-slate-400">Avg. missing data:</span>
                <span className="text-slate-200 ml-2">{avgMissingData.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Merge Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center">
            <Merge size={20} className="mr-2" />
            Merge Configuration
          </h3>

          {/* Dataset Name */}
          <div>
            <label htmlFor="merge-name" className="block text-sm font-medium text-slate-200 mb-2">
              New Dataset Name *
            </label>
            <input
              id="merge-name"
              type="text"
              value={mergeSettings.name}
              onChange={(e) => setMergeSettings(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter name for merged dataset"
              required
            />
          </div>

          {/* Merge Strategy */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Merge Strategy *
            </label>
            <div className="space-y-2">
              {mergeStrategies.map(strategy => (
                <div key={strategy.value} className="flex items-start space-x-3">
                  <input
                    type="radio"
                    id={strategy.value}
                    name="strategy"
                    value={strategy.value}
                    checked={mergeSettings.strategy === strategy.value}
                    onChange={(e) => setMergeSettings(prev => ({ ...prev, strategy: e.target.value }))}
                    className="mt-1 w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"
                  />
                  <div>
                    <label htmlFor={strategy.value} className="text-sm font-medium text-slate-200 cursor-pointer">
                      {strategy.label}
                    </label>
                    <p className="text-xs text-slate-400">{strategy.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Duplicate Handling */}
          <div>
            <label htmlFor="duplicates" className="block text-sm font-medium text-slate-200 mb-2">
              Handle Duplicates
            </label>
            <select
              id="duplicates"
              value={mergeSettings.handleDuplicates}
              onChange={(e) => setMergeSettings(prev => ({ ...prev, handleDuplicates: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {duplicateHandling.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Column Preservation */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="preserve-columns"
              checked={mergeSettings.preserveColumns}
              onChange={(e) => setMergeSettings(prev => ({ ...prev, preserveColumns: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="preserve-columns" className="text-sm text-slate-200">
              Preserve all column metadata and data types
            </label>
          </div>
        </div>

        {/* Processing State */}
        {mergeState.isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
              <p className="text-sm text-slate-200">{mergeState.currentStep}</p>
            </div>
            <ProgressBar 
              value={mergeState.progress} 
              variant="info"
            />
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-slate-400">
                🔄 Merging {selectedDatasets.length} datasets with {totalRows.toLocaleString()} total rows...
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button
            variant="primary"
            onClick={handleStartMerge}
            disabled={mergeState.isProcessing || !mergeSettings.name || selectedDatasets.length < 2}
            isLoading={mergeState.isProcessing}
            className="flex-1"
          >
            <Merge size={16} className="mr-2" />
            {mergeState.isProcessing ? 'Merging...' : `Merge ${selectedDatasets.length} Datasets`}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={mergeState.isProcessing}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}