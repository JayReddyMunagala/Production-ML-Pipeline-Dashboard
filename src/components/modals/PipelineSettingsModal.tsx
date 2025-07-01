import React, { useState } from 'react';
import { Settings, Save, Clock, Bell, RotateCcw, Database, Cpu } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Pipeline } from '../../types';

interface PipelineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  pipeline: Pipeline;
}

export function PipelineSettingsModal({
  isOpen,
  onClose,
  onSave,
  pipeline
}: PipelineSettingsModalProps) {
  const [settings, setSettings] = useState({
    name: pipeline.name,
    description: pipeline.description || '',
    algorithm: pipeline.algorithm || 'random_forest',
    hyperparameters: pipeline.hyperparameters || {
      n_estimators: 100,
      max_depth: 10,
      min_samples_split: 5,
      learning_rate: 0.1
    },
    notifications: pipeline.notifications || {
      email: true,
      slack: false,
      webhook: ''
    },
    schedule: pipeline.schedule || {
      enabled: false,
      frequency: 'manual',
      time: '09:00'
    },
    retries: pipeline.retries || {
      enabled: true,
      maxRetries: 3,
      backoffStrategy: 'exponential'
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const algorithms = [
    { value: 'random_forest', label: 'Random Forest' },
    { value: 'logistic_regression', label: 'Logistic Regression' },
    { value: 'svm', label: 'Support Vector Machine' },
    { value: 'gradient_boosting', label: 'Gradient Boosting' },
    { value: 'neural_network', label: 'Neural Network' },
    { value: 'decision_tree', label: 'Decision Tree' },
    { value: 'naive_bayes', label: 'Naive Bayes' },
  ];

  const frequencies = [
    { value: 'manual', label: 'Manual Only' },
    { value: 'hourly', label: 'Every Hour' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
  ];

  const backoffStrategies = [
    { value: 'linear', label: 'Linear Backoff' },
    { value: 'exponential', label: 'Exponential Backoff' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    onSave(settings);
    setIsSubmitting(false);
    onClose();
  };

  const handleHyperparameterChange = (key: string, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      hyperparameters: {
        ...prev.hyperparameters,
        [key]: value
      }
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pipeline Settings" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center">
            <Settings size={20} className="mr-2" />
            Basic Information
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pipeline-name" className="block text-sm font-medium text-slate-200 mb-2">
                Pipeline Name *
              </label>
              <input
                id="pipeline-name"
                type="text"
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter pipeline name"
                required
              />
            </div>

            <div>
              <label htmlFor="algorithm" className="block text-sm font-medium text-slate-200 mb-2">
                Algorithm *
              </label>
              <select
                id="algorithm"
                value={settings.algorithm}
                onChange={(e) => setSettings(prev => ({ ...prev, algorithm: e.target.value }))}
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
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-200 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={settings.description}
              onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Describe what this pipeline does..."
              rows={3}
            />
          </div>
        </div>

        {/* Hyperparameters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center">
            <Cpu size={20} className="mr-2" />
            Hyperparameters
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(settings.hyperparameters).map(([key, value]) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-slate-200 mb-2">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <input
                  id={key}
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => handleHyperparameterChange(key, parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Scheduling */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center">
            <Clock size={20} className="mr-2" />
            Scheduling
          </h3>

          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="schedule-enabled"
              checked={settings.schedule.enabled}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                schedule: { ...prev.schedule, enabled: e.target.checked }
              }))}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="schedule-enabled" className="text-sm text-slate-200">
              Enable automated scheduling
            </label>
          </div>

          {settings.schedule.enabled && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-slate-200 mb-2">
                  Frequency
                </label>
                <select
                  id="frequency"
                  value={settings.schedule.frequency}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, frequency: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>

              {settings.schedule.frequency !== 'manual' && (
                <div>
                  <label htmlFor="schedule-time" className="block text-sm font-medium text-slate-200 mb-2">
                    Time
                  </label>
                  <input
                    id="schedule-time"
                    type="time"
                    value={settings.schedule.time}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, time: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center">
            <Bell size={20} className="mr-2" />
            Notifications
          </h3>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="email-notifications"
                checked={settings.notifications.email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, email: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="email-notifications" className="text-sm text-slate-200">
                Email notifications
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="slack-notifications"
                checked={settings.notifications.slack}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, slack: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="slack-notifications" className="text-sm text-slate-200">
                Slack notifications
              </label>
            </div>

            <div>
              <label htmlFor="webhook-url" className="block text-sm font-medium text-slate-200 mb-2">
                Webhook URL (optional)
              </label>
              <input
                id="webhook-url"
                type="url"
                value={settings.notifications.webhook}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, webhook: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
          </div>
        </div>

        {/* Retry Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center">
            <RotateCcw size={20} className="mr-2" />
            Retry Configuration
          </h3>

          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="retries-enabled"
              checked={settings.retries.enabled}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                retries: { ...prev.retries, enabled: e.target.checked }
              }))}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="retries-enabled" className="text-sm text-slate-200">
              Enable automatic retries on failure
            </label>
          </div>

          {settings.retries.enabled && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="max-retries" className="block text-sm font-medium text-slate-200 mb-2">
                  Max Retries
                </label>
                <input
                  id="max-retries"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.retries.maxRetries}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    retries: { ...prev.retries, maxRetries: parseInt(e.target.value) || 1 }
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="backoff-strategy" className="block text-sm font-medium text-slate-200 mb-2">
                  Backoff Strategy
                </label>
                <select
                  id="backoff-strategy"
                  value={settings.retries.backoffStrategy}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    retries: { ...prev.retries, backoffStrategy: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {backoffStrategies.map(strategy => (
                    <option key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t border-slate-700">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={!settings.name}
            className="flex-1"
          >
            <Save size={16} className="mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}