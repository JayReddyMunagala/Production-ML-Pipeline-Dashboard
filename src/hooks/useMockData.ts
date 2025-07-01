import { useState, useEffect } from 'react';
import { Pipeline, Dataset, Alert, Experiment } from '../types';
import { useDataSync } from '../context/DataSyncContext';

const STORAGE_KEYS = {
  datasets: 'ml_dashboard_datasets',
  pipelines: 'ml_dashboard_pipelines',
  alerts: 'ml_dashboard_alerts',
  experiments: 'ml_dashboard_experiments',
  externalConnections: 'ml_dashboard_external_connections',
};

// Helper functions for localStorage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export interface NewDataset {
  name: string;
  file: File;
  size: number;
  columns: number;
}

export interface ExternalConnection {
  id: string;
  name: string;
  type: 'rest_api' | 'database' | 'webhook';
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  recordCount: number;
  syncFrequency: string;
  created_at: string;
}

export function useMockData() {
  // Get data sync context if available
  let dataSync: any;
  try {
    dataSync = useDataSync();
  } catch {
    // Context not available, continue without sync
    dataSync = null;
  }
  
  const [pipelines, setPipelines] = useState<Pipeline[]>(() => 
    loadFromStorage(STORAGE_KEYS.pipelines, [])
  );
  const [datasets, setDatasets] = useState<Dataset[]>(() => 
    loadFromStorage(STORAGE_KEYS.datasets, [])
  );
  const [alerts, setAlerts] = useState<Alert[]>(() => 
    loadFromStorage(STORAGE_KEYS.alerts, [])
  );
  const [experiments, setExperiments] = useState<Experiment[]>(() => 
    loadFromStorage(STORAGE_KEYS.experiments, [])
  );
  const [externalConnections, setExternalConnections] = useState<ExternalConnection[]>(() => 
    loadFromStorage(STORAGE_KEYS.externalConnections, [])
  );

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.pipelines, pipelines);
  }, [pipelines]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.datasets, datasets);
  }, [datasets]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.alerts, alerts);
  }, [alerts]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.experiments, experiments);
  }, [experiments]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.externalConnections, externalConnections);
  }, [externalConnections]);

  const addPipeline = (pipeline: Pipeline) => {
    // Ensure pipeline has a dataset_id - use first available dataset as fallback
    if (!pipeline.dataset_id && datasets.length > 0) {
      pipeline.dataset_id = datasets[0].id;
    }
    
    setPipelines(prev => {
      const updated = [pipeline, ...prev];
      // Force immediate save to localStorage
      saveToStorage(STORAGE_KEYS.pipelines, updated);
      return updated;
    });
    
    // Add success alert
    setAlerts(prev => [{
      id: `alert_${Date.now()}`,
      type: 'performance' as const,
      severity: 'low' as const,
      message: `Pipeline "${pipeline.name}" created successfully`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    }, ...prev]);
    
    return pipeline;
  };

  const deletePipeline = (pipelineId: string) => {
    setPipelines(prev => prev.filter(p => p.id !== pipelineId));
    
    // Add alert for deletion
    setAlerts(prev => [{
      id: `alert_${Date.now()}`,
      type: 'performance' as const,
      severity: 'low' as const,
      message: `Pipeline deleted successfully`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    }, ...prev]);
  };

  const updatePipelineSettings = (pipelineId: string, settings: any) => {
    setPipelines(prev => prev.map(p => 
      p.id === pipelineId ? { ...p, ...settings } : p
    ));
    
    // Add alert for settings update
    setAlerts(prev => [{
      id: `alert_${Date.now()}`,
      type: 'performance' as const,
      severity: 'low' as const,
      message: `Pipeline settings updated successfully`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    }, ...prev]);
  };

  const addExperiment = (experiment: Experiment) => {
    setExperiments(prev => [experiment, ...prev]);
    
    // Add success alert
    setAlerts(prev => [{
      id: `alert_${Date.now()}`,
      type: 'performance' as const,
      severity: 'low' as const,
      message: `Model "${experiment.name}" trained successfully with ${(experiment.metrics.accuracy * 100).toFixed(1)}% accuracy`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    }, ...prev]);
    
    return experiment;
  };

  const deleteExperiment = (experimentId: string) => {
    setExperiments(prev => prev.filter(e => e.id !== experimentId));
    
    // Add alert for deletion
    setAlerts(prev => [{
      id: `alert_${Date.now()}`,
      type: 'performance' as const,
      severity: 'low' as const,
      message: `Model deleted successfully`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    }, ...prev]);
  };

  const startModelTraining = (experimentId: string) => {
    setExperiments(prev => prev.map(e => 
      e.id === experimentId ? { ...e, status: 'running' as const } : e
    ));
    
    // Simulate training completion after 10-15 seconds
    setTimeout(() => {
      setExperiments(prev => prev.map(e => 
        e.id === experimentId ? { 
          ...e, 
          status: 'completed' as const,
          duration: Math.round(180 + Math.random() * 120), // 3-5 minutes
          metrics: {
            ...e.metrics,
            accuracy: Math.max(0.7, Math.min(0.95, e.metrics.accuracy + (Math.random() - 0.5) * 0.1)),
            precision: Math.max(0.7, Math.min(0.95, e.metrics.precision + (Math.random() - 0.5) * 0.08)),
            recall: Math.max(0.7, Math.min(0.95, e.metrics.recall + (Math.random() - 0.5) * 0.08)),
          }
        } : e
      ));
      
      // Add completion alert
      setAlerts(prev => [{
        id: `alert_${Date.now()}`,
        type: 'performance' as const,
        severity: 'low' as const,
        message: `Model training completed successfully`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      }, ...prev]);
    }, 10000 + Math.random() * 5000);
  };
  const addDataset = (newDataset: NewDataset) => {
    const dataset: Dataset = {
      id: `dataset_${Date.now()}`,
      name: newDataset.name,
      size: newDataset.size,
      columns: newDataset.columns,
      null_percentage: Math.round(Math.random() * 10 * 100) / 100, // Random null percentage for demo
      created_at: new Date().toISOString(),
    };
    setDatasets(prev => [dataset, ...prev]);
    
    // Mark data as changed for sync
    if (dataSync) {
      dataSync.markDataChanged();
    }
    
    // Add a success alert
    setAlerts(prev => [{
      id: `alert_${Date.now()}`,
      type: 'performance' as const,
      severity: 'low' as const,
      message: `Dataset "${newDataset.name}" uploaded successfully`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    }, ...prev]);
    
    return dataset;
  };

  const deleteDataset = (datasetId: string) => {
    const datasetToDelete = datasets.find(d => d.id === datasetId);
    if (!datasetToDelete) return;
    
    // Find all pipelines that use this dataset
    const relatedPipelines = pipelines.filter(p => p.dataset_id === datasetId);
    const relatedPipelineIds = relatedPipelines.map(p => p.id);
    const relatedPipelineNames = relatedPipelines.map(p => p.name);
    
    // Find all experiments that might be related to those pipelines (by name similarity or algorithm)
    const relatedExperiments = experiments.filter(e => 
      relatedPipelineNames.some(pipelineName => 
        e.name.toLowerCase().includes(pipelineName.toLowerCase().split(' ')[0]) ||
        e.name.toLowerCase().includes(datasetToDelete.name.toLowerCase().split('.')[0])
      )
    );
    const relatedExperimentIds = relatedExperiments.map(e => e.id);
    
    // Find related alerts (those mentioning the dataset, pipelines, or models)
    const relatedAlerts = alerts.filter(a => 
      a.message.toLowerCase().includes(datasetToDelete.name.toLowerCase()) ||
      relatedPipelineNames.some(name => a.message.toLowerCase().includes(name.toLowerCase())) ||
      relatedExperiments.some(exp => a.message.toLowerCase().includes(exp.name.toLowerCase()))
    );
    const relatedAlertIds = relatedAlerts.map(a => a.id);
    
    // Find related external connections (those that created datasets with similar names)
    const relatedConnections = externalConnections.filter(c => 
      datasetToDelete.name.includes(`${c.name} (External)`)
    );
    const relatedConnectionIds = relatedConnections.map(c => c.id);
    
    // Perform cascading deletes
    
    // Delete related pipelines
    if (relatedPipelineIds.length > 0) {
      setPipelines(prev => prev.filter(p => !relatedPipelineIds.includes(p.id)));
    }
    
    // Delete related experiments
    if (relatedExperimentIds.length > 0) {
      setExperiments(prev => prev.filter(e => !relatedExperimentIds.includes(e.id)));
    }
    
    // Delete related alerts
    if (relatedAlertIds.length > 0) {
      setAlerts(prev => prev.filter(a => !relatedAlertIds.includes(a.id)));
    }
    
    // Delete related external connections
    if (relatedConnectionIds.length > 0) {
      setExternalConnections(prev => prev.filter(c => !relatedConnectionIds.includes(c.id)));
    }
    
    // Finally, delete the dataset
    setDatasets(prev => prev.filter(d => d.id !== datasetId));
    
    // Add comprehensive alert for deletion
    const deletionSummary = [
      `Dataset "${datasetToDelete.name}" deleted`,
      relatedPipelineIds.length > 0 ? `${relatedPipelineIds.length} related pipeline(s) removed` : null,
      relatedExperimentIds.length > 0 ? `${relatedExperimentIds.length} related model(s) removed` : null,
      relatedAlertIds.length > 0 ? `${relatedAlertIds.length} related alert(s) cleared` : null,
      relatedConnectionIds.length > 0 ? `${relatedConnectionIds.length} related connection(s) removed` : null,
    ].filter(Boolean).join(', ');
    
    setAlerts(prev => [{
      id: `alert_${Date.now()}`,
      type: 'performance' as const,
      severity: 'medium' as const,
      message: deletionSummary,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    }, ...prev]);
  };

  const mergeDatasets = (datasetIds: string[], newName: string) => {
    const selectedDatasets = datasets.filter(d => datasetIds.includes(d.id));
    
    const mergedDataset: Dataset = {
      id: `dataset_${Date.now()}`,
      name: newName,
      size: selectedDatasets.reduce((sum, d) => sum + d.size, 0),
      columns: Math.max(...selectedDatasets.map(d => d.columns)), // Use max columns
      null_percentage: selectedDatasets.reduce((sum, d) => sum + d.null_percentage, 0) / selectedDatasets.length,
      created_at: new Date().toISOString(),
    };
    
    setDatasets(prev => [mergedDataset, ...prev]);
    
    // Add success alert
    setAlerts(prev => [{
      id: `alert_${Date.now()}`,
      type: 'performance' as const,
      severity: 'low' as const,
      message: `Successfully merged ${selectedDatasets.length} datasets into "${newName}"`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    }, ...prev]);
    
    return mergedDataset;
  };

  const addExternalConnection = (connectionData: any) => {
    const connection: ExternalConnection = {
      id: `conn_${Date.now()}`,
      name: connectionData.name,
      type: connectionData.type,
      url: connectionData.url,
      status: 'connected',
      lastSync: new Date().toISOString(),
      recordCount: Math.floor(Math.random() * 100000) + 1000,
      syncFrequency: connectionData.syncFrequency,
      created_at: new Date().toISOString(),
    };
    setExternalConnections(prev => [connection, ...prev]);
    
    // Also create a corresponding dataset
    const dataset: Dataset = {
      id: `dataset_${Date.now()}`,
      name: `${connectionData.name} (External)`,
      size: connection.recordCount,
      columns: Math.floor(Math.random() * 20) + 5,
      null_percentage: Math.random() * 5,
      created_at: new Date().toISOString(),
    };
    setDatasets(prev => [dataset, ...prev]);
    
    // Add success alert
    setAlerts(prev => [{
      id: `alert_${Date.now()}`,
      type: 'performance' as const,
      severity: 'low' as const,
      message: `External connection "${connectionData.name}" created successfully`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    }, ...prev]);
    
    return connection;
  };

  const deleteExternalConnection = (connectionId: string) => {
    const connection = externalConnections.find(c => c.id === connectionId);
    
    // Remove the connection
    setExternalConnections(prev => prev.filter(c => c.id !== connectionId));
    
    // Also remove the corresponding dataset if it exists
    if (connection) {
      setDatasets(prev => prev.filter(d => d.name !== `${connection.name} (External)`));
      
      // Add alert for deletion
      setAlerts(prev => [{
        id: `alert_${Date.now()}`,
        type: 'performance' as const,
        severity: 'low' as const,
        message: `External connection "${connection.name}" deleted successfully`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      }, ...prev]);
    }
  };

  useEffect(() => {
    // Initialize mock data only if localStorage is empty
    const hasExistingData = 
      loadFromStorage(STORAGE_KEYS.pipelines, []).length > 0 ||
      loadFromStorage(STORAGE_KEYS.datasets, []).length > 0 ||
      loadFromStorage(STORAGE_KEYS.alerts, []).length > 0 ||
      loadFromStorage(STORAGE_KEYS.experiments, []).length > 0 ||
      loadFromStorage(STORAGE_KEYS.externalConnections, []).length > 0;

    if (!hasExistingData) {
      // Add initial dataset first
      const initialDataset = {
        id: 'dataset_initial',
        name: 'customer_data.csv',
        size: 125000,
        columns: 18,
        null_percentage: 3.2,
        created_at: '2024-01-15T10:30:00Z'
      };
      
      setDatasets([initialDataset]);
      
      // Set initial mock data
      setPipelines([
        {
          id: '1',
          name: 'Customer Churn Prediction',
          description: 'Predicts customer churn using machine learning algorithms',
          dataset_id: 'dataset_initial',
          status: 'completed',
          progress: 100,
          created_at: '2024-01-15T10:30:00Z',
          last_run: '2024-01-20T14:45:00Z',
          model_accuracy: 0.892,
          data_drift_score: 0.15,
          algorithm: 'random_forest',
          hyperparameters: {
            n_estimators: 100,
            max_depth: 10,
            min_samples_split: 5
          }
        },
        {
          id: '2',
          name: 'Fraud Detection Model',
          description: 'Real-time fraud detection for financial transactions',
          dataset_id: 'dataset_initial',
          status: 'running',
          progress: 67,
          created_at: '2024-01-18T09:15:00Z',
          model_accuracy: 0.945,
          data_drift_score: 0.08,
          algorithm: 'neural_network',
          hyperparameters: {
            hidden_layers: 3,
            learning_rate: 0.001,
            batch_size: 32
          }
        },
        {
          id: '3',
          name: 'Sales Forecasting',
          description: 'Forecasts sales trends and seasonal patterns',
          dataset_id: 'dataset_initial',
          status: 'idle',
          progress: 0,
          created_at: '2024-01-19T16:20:00Z',
          model_accuracy: 0.876,
          data_drift_score: 0.22,
          algorithm: 'gradient_boosting',
          hyperparameters: {
            n_estimators: 200,
            learning_rate: 0.1,
            max_depth: 8
          }
        }
      ]);

      setAlerts([
        {
          id: '1',
          type: 'data_drift',
          severity: 'high',
          message: 'Significant data drift detected in Customer Churn model',
          timestamp: '2024-01-20T15:30:00Z',
          acknowledged: false,
        },
        {
          id: '2',
          type: 'performance',
          severity: 'medium',
          message: 'Model accuracy dropped below 85% threshold',
          timestamp: '2024-01-20T14:15:00Z',
          acknowledged: false,
        },
        {
          id: '3',
          type: 'system',
          severity: 'low',
          message: 'Scheduled maintenance completed successfully',
          timestamp: '2024-01-20T12:00:00Z',
          acknowledged: true,
        }
      ]);

      setExperiments([
        {
          id: '1',
          name: 'Customer Churn v2.1',
          description: 'Improved churn prediction with feature engineering',
          status: 'completed',
          created_at: '2024-01-18T10:00:00Z',
          duration: 245,
          algorithm: 'random_forest',
          parameters: {
            n_estimators: 150,
            max_depth: 12,
            min_samples_split: 3
          },
          metrics: {
            accuracy: 0.912,
            precision: 0.889,
            recall: 0.934,
            f1_score: 0.911
          }
        },
        {
          id: '2',
          name: 'Fraud Detection Neural Net',
          description: 'Deep learning approach for fraud detection',
          status: 'running',
          created_at: '2024-01-19T14:30:00Z',
          algorithm: 'neural_network',
          parameters: {
            hidden_layers: 4,
            learning_rate: 0.0005,
            batch_size: 64,
            epochs: 100
          },
          metrics: {
            accuracy: 0.0,
            precision: 0.0,
            recall: 0.0,
            f1_score: 0.0
          }
        }
      ]);
    }
    
    console.log('ML Dashboard initialized with existing data from localStorage');
  }, []);

  return {
    pipelines,
    setPipelines,
    addPipeline,
    deletePipeline,
    updatePipelineSettings,
    datasets,
    setDatasets,
    addDataset,
    deleteDataset,
    mergeDatasets,
    alerts,
    setAlerts,
    experiments,
    setExperiments,
    addExperiment,
    deleteExperiment,
    startModelTraining,
    externalConnections,
    setExternalConnections,
    addExternalConnection,
    deleteExternalConnection,
  };
}

export const analyzeDatasetColumns = async (dataset: Dataset): Promise<string[]> => {
  // Simulate async analysis by adding a small delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate dataset-specific column names based on the dataset's properties
  const columnNames: string[] = [];
  
  // Create a hash from dataset properties to ensure consistent but different columns per dataset
  const datasetHash = (dataset.id + dataset.name + dataset.size.toString()).split('').reduce((hash, char) => {
    return ((hash << 5) - hash) + char.charCodeAt(0);
  }, 0);
  
  // Different column sets based on dataset characteristics
  const columnSets = {
    customer: ['customer_id', 'name', 'email', 'age', 'created_at', 'last_login', 'purchase_amount', 'category', 'status', 'location', 'score', 'loyalty_tier', 'churn_risk', 'lifetime_value'],
    sales: ['order_id', 'product_id', 'customer_id', 'quantity', 'price', 'discount', 'total_amount', 'order_date', 'category', 'region', 'sales_rep', 'payment_method'],
    financial: ['transaction_id', 'account_id', 'amount', 'transaction_type', 'timestamp', 'merchant', 'category', 'balance', 'risk_score', 'fraud_flag', 'location'],
    product: ['product_id', 'name', 'description', 'category', 'price', 'cost', 'inventory', 'supplier', 'rating', 'reviews_count', 'launch_date', 'status'],
    marketing: ['campaign_id', 'user_id', 'impression_id', 'click_through', 'conversion', 'cost_per_click', 'channel', 'device', 'demographics', 'engagement_score'],
    sensor: ['sensor_id', 'timestamp', 'temperature', 'humidity', 'pressure', 'vibration', 'status', 'location', 'device_type', 'battery_level'],
    default: ['id', 'name', 'value', 'category', 'timestamp', 'status', 'type', 'description', 'score', 'level']
  };
  
  // Determine column set based on dataset name patterns
  let selectedColumns: string[];
  const name = dataset.name.toLowerCase();
  
  if (name.includes('customer') || name.includes('user') || name.includes('churn')) {
    selectedColumns = columnSets.customer;
  } else if (name.includes('sales') || name.includes('order') || name.includes('revenue')) {
    selectedColumns = columnSets.sales;
  } else if (name.includes('financial') || name.includes('transaction') || name.includes('fraud')) {
    selectedColumns = columnSets.financial;
  } else if (name.includes('product') || name.includes('inventory')) {
    selectedColumns = columnSets.product;
  } else if (name.includes('marketing') || name.includes('campaign') || name.includes('ad')) {
    selectedColumns = columnSets.marketing;
  } else if (name.includes('sensor') || name.includes('iot') || name.includes('device')) {
    selectedColumns = columnSets.sensor;
  } else {
    selectedColumns = columnSets.default;
  }
  
  for (let i = 0; i < dataset.columns; i++) {
    if (i < selectedColumns.length) {
      columnNames.push(selectedColumns[i]);
    } else {
      // Use hash to create varied additional columns
      const suffixVariants = ['_score', '_rate', '_count', '_flag', '_level', '_index', '_value', '_code'];
      const suffix = suffixVariants[Math.abs(datasetHash + i) % suffixVariants.length];
      columnNames.push(`feature_${i + 1}${suffix}`);
    }
  }
  
  return columnNames;
}