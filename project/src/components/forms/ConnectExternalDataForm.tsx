import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { useMockData } from '../../hooks/useMockData';
import { Database, Globe, Key, Clock } from 'lucide-react';

interface ConnectExternalDataFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ConnectExternalDataForm({ onSuccess, onCancel }: ConnectExternalDataFormProps) {
  const { addExternalConnection } = useMockData();
  const [formData, setFormData] = useState({
    name: '',
    type: 'rest_api',
    url: '',
    authentication: 'none',
    apiKey: '',
    username: '',
    password: '',
    database: '',
    table: '',
    query: '',
    syncFrequency: 'manual',
    headers: {} as Record<string, string>,
  });

  const [testState, setTestState] = useState({
    testing: false,
    success: false,
    error: '',
    preview: null as any,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const dataSourceTypes = [
    { value: 'rest_api', label: 'REST API', icon: Globe },
    { value: 'database', label: 'Database', icon: Database },
    { value: 'webhook', label: 'Webhook', icon: Key },
  ];

  const authTypes = [
    { value: 'none', label: 'No Authentication' },
    { value: 'api_key', label: 'API Key' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'bearer', label: 'Bearer Token' },
  ];

  const syncFrequencies = [
    { value: 'manual', label: 'Manual' },
    { value: '15min', label: 'Every 15 minutes' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
  ];

  const handleTestConnection = async () => {
    setTestState({ testing: true, success: false, error: '', preview: null });

    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock successful connection with preview data
    const mockPreview = {
      rows: Math.floor(Math.random() * 100000) + 1000,
      columns: ['id', 'name', 'email', 'created_at', 'status'],
      sample: [
        { id: '1', name: 'John Doe', email: 'john@example.com', created_at: '2024-01-20', status: 'active' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-19', status: 'active' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', created_at: '2024-01-18', status: 'inactive' },
      ],
    };

    setTestState({
      testing: false,
      success: true,
      error: '',
      preview: mockPreview,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testState.success) {
      setTestState(prev => ({
        ...prev,
        error: 'Please test the connection successfully before submitting.'
      }));
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Simulate connection setup
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create the external connection
      addExternalConnection(formData);
      
      setIsSubmitting(false);
      onSuccess();
    } catch (error) {
      setIsSubmitting(false);
      setTestState(prev => ({
        ...prev,
        error: 'Failed to create connection. Please try again.'
      }));
    }
  };

  const handleCancel = () => {
    // Reset form state when canceling
    setFormData({
      name: '',
      type: 'rest_api',
      url: '',
      authentication: 'none',
      apiKey: '',
      username: '',
      password: '',
      database: '',
      table: '',
      query: '',
      syncFrequency: 'manual',
      headers: {},
    });
    setTestState({
      testing: false,
      success: false,
      error: '',
      preview: null,
    });
    onCancel();
  };

  const SelectedIcon = dataSourceTypes.find(t => t.value === formData.type)?.icon || Globe;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Connection Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
          Connection Name *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="e.g., Customer Database"
          required
        />
      </div>

      {/* Data Source Type */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Data Source Type *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {dataSourceTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.type === type.value
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <Icon size={20} className="mx-auto mb-2" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Connection Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center">
          <SelectedIcon size={20} className="mr-2" />
          Connection Details
        </h3>

        {formData.type === 'rest_api' && (
          <>
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-slate-200 mb-2">
                API Endpoint URL *
              </label>
              <input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="https://api.example.com/data"
                required
              />
            </div>
          </>
        )}

        {formData.type === 'database' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="db-url" className="block text-sm font-medium text-slate-200 mb-2">
                  Database URL *
                </label>
                <input
                  id="db-url"
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="localhost:5432"
                  required
                />
              </div>
              <div>
                <label htmlFor="database" className="block text-sm font-medium text-slate-200 mb-2">
                  Database Name *
                </label>
                <input
                  id="database"
                  type="text"
                  value={formData.database}
                  onChange={(e) => setFormData(prev => ({ ...prev, database: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="production_db"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-slate-200 mb-2">
                SQL Query *
              </label>
              <textarea
                id="query"
                value={formData.query}
                onChange={(e) => setFormData(prev => ({ ...prev, query: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                placeholder="SELECT * FROM customers WHERE created_at >= NOW() - INTERVAL '30 days'"
                rows={3}
                required
              />
            </div>
          </>
        )}
      </div>

      {/* Authentication */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center">
          <Key size={20} className="mr-2" />
          Authentication
        </h3>

        <div>
          <label htmlFor="auth-type" className="block text-sm font-medium text-slate-200 mb-2">
            Authentication Type
          </label>
          <select
            id="auth-type"
            value={formData.authentication}
            onChange={(e) => setFormData(prev => ({ ...prev, authentication: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {authTypes.map(auth => (
              <option key={auth.value} value={auth.value}>
                {auth.label}
              </option>
            ))}
          </select>
        </div>

        {formData.authentication === 'api_key' && (
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-slate-200 mb-2">
              API Key *
            </label>
            <input
              id="api-key"
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your API key"
              required
            />
          </div>
        )}

        {formData.authentication === 'basic' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-2">
                Username *
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Password *
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        )}
      </div>

      {/* Sync Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center">
          <Clock size={20} className="mr-2" />
          Sync Settings
        </h3>

        <div>
          <label htmlFor="sync-frequency" className="block text-sm font-medium text-slate-200 mb-2">
            Sync Frequency
          </label>
          <select
            id="sync-frequency"
            value={formData.syncFrequency}
            onChange={(e) => setFormData(prev => ({ ...prev, syncFrequency: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {syncFrequencies.map(freq => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Test Connection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-200">Test Connection</h3>
          <Button
            type="button"
            variant="secondary"
            onClick={handleTestConnection}
            disabled={testState.testing || !formData.url}
            isLoading={testState.testing}
          >
            {testState.testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>

        {testState.testing && (
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-300 mb-2">Testing connection...</p>
            <ProgressBar value={50} showLabel={false} />
          </div>
        )}

        {testState.success && testState.preview && (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant="success" size="sm">Connection Successful</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-green-300">
                Found {testState.preview.rows.toLocaleString()} rows with {testState.preview.columns.length} columns
              </p>
              <div className="bg-slate-800 rounded p-3 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-600">
                      {testState.preview.columns.map((col: string) => (
                        <th key={col} className="text-left py-1 px-2 text-slate-300">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {testState.preview.sample.slice(0, 3).map((row: any, index: number) => (
                      <tr key={index}>
                        {testState.preview.columns.map((col: string) => (
                          <td key={col} className="py-1 px-2 text-slate-400">
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {testState.error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <Badge variant="danger" size="sm" className="mb-2">Connection Failed</Badge>
            <p className="text-sm text-red-300">{testState.error}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={!formData.name || !formData.url || !testState.success}
          className="flex-1"
        >
          {isSubmitting ? 'Creating Connection...' : 'Create Connection'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}