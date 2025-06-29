import React, { useState } from 'react';
import { GitCompare, Target, TrendingUp, Clock, Award, BarChart3 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import { MetricsChart } from '../charts/MetricsChart';
import { Experiment } from '../../types';

interface ModelComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModels: Experiment[];
}

export function ModelComparisonModal({ isOpen, onClose, selectedModels }: ModelComparisonModalProps) {
  const [comparisonMetric, setComparisonMetric] = useState<'accuracy' | 'precision' | 'recall' | 'f1_score' | 'auc_roc' | 'training_time'>('accuracy');

  const metrics = [
    { key: 'accuracy' as const, label: 'Accuracy', format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: 'precision' as const, label: 'Precision', format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: 'recall' as const, label: 'Recall', format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: 'f1_score' as const, label: 'F1 Score', format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: 'auc_roc' as const, label: 'AUC-ROC', format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: 'training_time' as const, label: 'Training Time', format: (v: number) => `${v}s` },
  ];

  const getBestModel = (metric: string) => {
    // Return null if no models are selected
    if (selectedModels.length === 0) {
      return null;
    }

    if (metric === 'training_time') {
      // For training time, lower is better
      return selectedModels.reduce((best, model) => 
        model.metrics[metric] < best.metrics[metric] ? model : best
      );
    } else {
      // For other metrics, higher is better
      return selectedModels.reduce((best, model) => 
        model.metrics[metric as keyof typeof model.metrics] > best.metrics[metric as keyof typeof best.metrics] ? model : best
      );
    }
  };

  const getPerformanceColor = (value: number, metric: string) => {
    if (metric === 'training_time') {
      if (value <= 60) return 'text-green-400';
      if (value <= 120) return 'text-yellow-400';
      return 'text-red-400';
    } else {
      if (value >= 0.9) return 'text-green-400';
      if (value >= 0.8) return 'text-yellow-400';
      return 'text-red-400';
    }
  };

  const selectedMetric = metrics.find(m => m.key === comparisonMetric);
  const bestModel = getBestModel(comparisonMetric);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Model Comparison" size="xl">
      <div className="space-y-6">
        {/* Comparison Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitCompare size={20} className="text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-200">
              Comparing {selectedModels.length} Models
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="metric-select" className="text-sm text-slate-400">
              Compare by:
            </label>
            <select
              id="metric-select"
              value={comparisonMetric}
              onChange={(e) => setComparisonMetric(e.target.value as any)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {metrics.map(metric => (
                <option key={metric.key} value={metric.key}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Best Model Highlight */}
        {bestModel && (
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-800/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Award size={20} className="text-green-400" />
              <h4 className="font-semibold text-green-400">
                Best {selectedMetric?.label}: {bestModel.name}
              </h4>
            </div>
            <p className="text-sm text-slate-300">
              {selectedMetric?.format(bestModel.metrics[comparisonMetric])} - 
              {comparisonMetric === 'training_time' ? ' Fastest training time' : ' Highest performance'}
            </p>
          </div>
        )}

        {/* Metrics Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.slice(0, 5).map(metric => (
            <Card key={metric.key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-300">{metric.label}</h4>
                  <BarChart3 size={16} className="text-slate-400" />
                </div>
                <div className="space-y-1">
                  {selectedModels
                    .sort((a, b) => {
                      const aVal = a.metrics[metric.key];
                      const bVal = b.metrics[metric.key];
                      return metric.key === 'training_time' ? aVal - bVal : bVal - aVal;
                    })
                    .map((model, index) => (
                      <div key={model.id} className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 truncate max-w-24">
                          {model.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-medium ${getPerformanceColor(model.metrics[metric.key], metric.key)}`}>
                            {metric.format(model.metrics[metric.key])}
                          </span>
                          {index === 0 && bestModel && (
                            <Badge variant="success" size="sm">Best</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Model Comparison */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-slate-200">Detailed Comparison</h4>
          
          <div className="grid gap-6">
            {selectedModels.map((model) => (
              <Card key={model.id}>
                <CardContent className="p-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Model Info */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h5 className="font-semibold text-slate-200 flex items-center space-x-2">
                            <span>{model.name}</span>
                            {bestModel && model.id === bestModel.id && (
                              <Badge variant="success" size="sm">
                                <Award size={12} className="mr-1" />
                                Best {selectedMetric?.label}
                              </Badge>
                            )}
                          </h5>
                          <p className="text-sm text-slate-400">
                            {model.algorithm.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        </div>
                        <Badge
                          variant={
                            model.status === 'completed' ? 'success' :
                            model.status === 'running' ? 'info' : 'danger'
                          }
                        >
                          {model.status}
                        </Badge>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                          <p className={`text-lg font-bold ${getPerformanceColor(model.metrics.accuracy, 'accuracy')}`}>
                            {(model.metrics.accuracy * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-slate-400">Accuracy</p>
                        </div>
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                          <p className={`text-lg font-bold ${getPerformanceColor(model.metrics.f1_score, 'f1_score')}`}>
                            {(model.metrics.f1_score * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-slate-400">F1 Score</p>
                        </div>
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                          <p className={`text-lg font-bold ${getPerformanceColor(model.metrics.auc_roc, 'auc_roc')}`}>
                            {(model.metrics.auc_roc * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-slate-400">AUC-ROC</p>
                        </div>
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                          <p className={`text-lg font-bold ${getPerformanceColor(model.metrics.training_time, 'training_time')}`}>
                            {model.metrics.training_time}s
                          </p>
                          <p className="text-xs text-slate-400">Training Time</p>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-400">Started:</span>
                            <span className="text-slate-200 ml-2">
                              {new Date(model.start_time).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Duration:</span>
                            <span className="text-slate-200 ml-2">{model.duration || 'N/A'}s</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Visualization */}
                    <div>
                      <h6 className="text-sm font-medium text-slate-300 mb-3">Performance Metrics</h6>
                      <MetricsChart
                        accuracy={model.metrics.accuracy}
                        precision={model.metrics.precision}
                        recall={model.metrics.recall}
                        f1Score={model.metrics.f1_score}
                      />
                    </div>
                  </div>

                  {/* Hyperparameters */}
                  <div className="mt-6 pt-4 border-t border-slate-700">
                    <h6 className="text-sm font-medium text-slate-300 mb-2">Hyperparameters</h6>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(model.parameters).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="text-center p-2 bg-slate-700/20 rounded">
                          <p className="text-xs text-slate-400">{key.replace('_', ' ')}</p>
                          <p className="text-sm text-slate-200 font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Summary Insights */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h4 className="font-semibold text-slate-200 mb-2 flex items-center">
            <TrendingUp size={16} className="mr-2" />
            Comparison Insights
          </h4>
          <div className="space-y-2 text-sm">
            {bestModel && (
              <p className="text-slate-300">
                • <strong className="text-green-400">{bestModel.name}</strong> has the best {selectedMetric?.label.toLowerCase()} 
                with {selectedMetric?.format(bestModel.metrics[comparisonMetric])}
              </p>
            )}
            <p className="text-slate-300">
              • Average accuracy across all models: {(selectedModels.reduce((sum, m) => sum + m.metrics.accuracy, 0) / selectedModels.length * 100).toFixed(1)}%
            </p>
            <p className="text-slate-300">
              • Total training time: {selectedModels.reduce((sum, m) => sum + m.metrics.training_time, 0)}s
            </p>
            {selectedModels.length === 0 && (
              <p className="text-slate-400">
                • No models selected for comparison
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}