export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
  avatar?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  last_run?: string;
  model_accuracy?: number;
  data_drift_score?: number;
  algorithm?: string;
  dataset_id?: string;
  hyperparameters?: Record<string, any>;
  notifications?: {
    email: boolean;
    slack: boolean;
    webhook?: string;
  };
  schedule?: {
    enabled: boolean;
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly';
    time?: string;
  };
  retries?: {
    enabled: boolean;
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
  };
}

export interface Dataset {
  id: string;
  name: string;
  size: number;
  columns: number;
  null_percentage: number;
  created_at: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc_roc: number;
  training_time: number;
}

export interface Alert {
  id: string;
  type: 'performance' | 'drift' | 'error';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface Experiment {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  algorithm: string;
  metrics: ModelMetrics;
  parameters: Record<string, any>;
  start_time: string;
  duration?: number;
  isNew?: boolean;
}