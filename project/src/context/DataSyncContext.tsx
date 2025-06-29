import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMockData } from '../hooks/useMockData';

// Helper to check if 24 hours have passed since last sync alert
const shouldShowSyncAlert = (): boolean => {
  const lastSyncAlert = localStorage.getItem('ml_dashboard_last_sync_alert');
  if (!lastSyncAlert) return true;
  
  const lastAlertTime = new Date(lastSyncAlert).getTime();
  const now = new Date().getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  return (now - lastAlertTime) >= twentyFourHours;
};

const markSyncAlertShown = (): void => {
  localStorage.setItem('ml_dashboard_last_sync_alert', new Date().toISOString());
};

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date;
  isSyncing: boolean;
  pendingChanges: number;
  syncErrors: string[];
}

interface DataSyncContextType {
  syncStatus: SyncStatus;
  triggerSync: () => Promise<void>;
  syncAll: () => Promise<void>;
  markDataChanged: () => void;
}

const DataSyncContext = createContext<DataSyncContextType | undefined>(undefined);

export function DataSyncProvider({ children }: { children: React.ReactNode }) {
  const mockData = useMockData();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: new Date(),
    isSyncing: false,
    pendingChanges: 0,
    syncErrors: [],
  });

  // Track data changes
  const [dataChangeCount, setDataChangeCount] = useState(0);

  const markDataChanged = useCallback(() => {
    setDataChangeCount(prev => prev + 1);
    setSyncStatus(prev => ({
      ...prev,
      pendingChanges: prev.pendingChanges + 1
    }));
  }, []);

  // Simulate server sync
  const simulateServerSync = async (dataType: string, data: any) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Simulate occasional sync errors (5% chance)
    if (Math.random() < 0.05) {
      throw new Error(`Failed to sync ${dataType}: Network timeout`);
    }
    
    return { success: true, synced_at: new Date() };
  };

  const triggerSync = useCallback(async () => {
    if (syncStatus.isSyncing) return;
    
    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncErrors: [] }));
    
    try {
      const syncPromises = [];
      let errors: string[] = [];

      // Sync all data types
      if (mockData.pipelines.length > 0) {
        syncPromises.push(
          simulateServerSync('pipelines', mockData.pipelines)
            .catch(err => errors.push(err.message))
        );
      }

      if (mockData.datasets.length > 0) {
        syncPromises.push(
          simulateServerSync('datasets', mockData.datasets)
            .catch(err => errors.push(err.message))
        );
      }

      if (mockData.alerts.length > 0) {
        syncPromises.push(
          simulateServerSync('alerts', mockData.alerts)
            .catch(err => errors.push(err.message))
        );
      }

      if (mockData.experiments.length > 0) {
        syncPromises.push(
          simulateServerSync('experiments', mockData.experiments)
            .catch(err => errors.push(err.message))
        );
      }

      if (mockData.externalConnections.length > 0) {
        syncPromises.push(
          simulateServerSync('external_connections', mockData.externalConnections)
            .catch(err => errors.push(err.message))
        );
      }

      await Promise.allSettled(syncPromises);

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        pendingChanges: errors.length > 0 ? prev.pendingChanges : 0,
        syncErrors: errors
      }));

      if (errors.length === 0) {
        // Add success alert only once per 24 hours
        if (shouldShowSyncAlert()) {
          mockData.setAlerts(prev => [{
            id: `sync_${Date.now()}`,
            type: 'performance' as const,
            severity: 'low' as const,
            message: 'All data synchronized successfully',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          }, ...prev]);
          markSyncAlertShown();
        }
      }

    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncErrors: [...prev.syncErrors, `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }));
    }
  }, [syncStatus.isSyncing, mockData]);

  const syncAll = useCallback(async () => {
    await triggerSync();
  }, [triggerSync]);

  // Auto-sync every 30 seconds if there are pending changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (syncStatus.pendingChanges > 0 && !syncStatus.isSyncing && syncStatus.isOnline) {
        triggerSync();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [syncStatus.pendingChanges, syncStatus.isSyncing, syncStatus.isOnline, triggerSync]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      if (syncStatus.pendingChanges > 0) {
        triggerSync();
      }
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncStatus.pendingChanges, triggerSync]);

  // Watch for data changes
  useEffect(() => {
    markDataChanged();
  }, [
    mockData.pipelines.length,
    mockData.datasets.length,
    mockData.alerts.length,
    mockData.experiments.length,
    mockData.externalConnections.length,
    markDataChanged
  ]);

  return (
    <DataSyncContext.Provider value={{
      syncStatus,
      triggerSync,
      syncAll,
      markDataChanged
    }}>
      {children}
    </DataSyncContext.Provider>
  );
}

export function useDataSync() {
  const context = useContext(DataSyncContext);
  if (!context) {
    throw new Error('useDataSync must be used within DataSyncProvider');
  }
  return context;
}