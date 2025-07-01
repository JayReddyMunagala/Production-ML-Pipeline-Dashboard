import React, { useState, useEffect } from 'react';
import { Activity, Database, Cpu, Cloud, RefreshCw, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { useDataSync } from '../../context/DataSyncContext';
import { useMockData } from '../../hooks/useMockData';

interface SyncActivity {
  id: string;
  type: 'pipeline' | 'dataset' | 'alert' | 'experiment' | 'connection';
  action: 'created' | 'updated' | 'deleted' | 'synced';
  name: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'error';
}

export function SyncDashboard() {
  const { syncStatus, triggerSync, syncAll } = useDataSync();
  const { pipelines, datasets, alerts, experiments, externalConnections } = useMockData();
  const [syncActivities, setSyncActivities] = useState<SyncActivity[]>([]);
  const [detailedMetrics, setDetailedMetrics] = useState({
    totalItems: 0,
    syncedItems: 0,
    pendingItems: 0,
    failedItems: 0,
    lastFullSync: new Date(),
    avgSyncTime: 2.3,
    dataVolume: 0,
    syncFrequency: '30s'
  });

  // Track data changes and create sync activities
  useEffect(() => {
    const totalItems = pipelines.length + datasets.length + alerts.length + experiments.length + externalConnections.length;
    const pendingItems = syncStatus.pendingChanges;
    const failedItems = syncStatus.syncErrors.length;
    const syncedItems = totalItems - pendingItems - failedItems;

    // Calculate data volume (rough estimate)
    const dataVolume = 
      datasets.reduce((sum, d) => sum + d.size, 0) * 0.001 + // Convert to MB
      pipelines.length * 0.5 + // 0.5MB per pipeline
      alerts.length * 0.001 + // 1KB per alert
      experiments.length * 2; // 2MB per experiment

    setDetailedMetrics(prev => ({
      ...prev,
      totalItems,
      syncedItems,
      pendingItems,
      failedItems,
      dataVolume: Math.round(dataVolume * 100) / 100
    }));

    // Add sync activity when data changes
    if (totalItems > detailedMetrics.totalItems) {
      const newActivity: SyncActivity = {
        id: `activity_${Date.now()}`,
        type: 'dataset', // This would be determined by which data changed
        action: 'created',
        name: 'New data item',
        timestamp: new Date(),
        status: 'pending'
      };
      setSyncActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }
  }, [pipelines.length, datasets.length, alerts.length, experiments.length, externalConnections.length, syncStatus.pendingChanges, syncStatus.syncErrors.length]);

  // Update sync activities when sync completes
  useEffect(() => {
    if (!syncStatus.isSyncing && syncStatus.pendingChanges === 0) {
      setSyncActivities(prev => 
        prev.map(activity => 
          activity.status === 'pending' 
            ? { ...activity, status: 'success' as const }
            : activity
        )
      );
      setDetailedMetrics(prev => ({
        ...prev,
        lastFullSync: syncStatus.lastSync
      }));
    }
  }, [syncStatus.isSyncing, syncStatus.pendingChanges, syncStatus.lastSync]);

  const syncMetrics = [
    {
      title: 'Total Items',
      value: detailedMetrics.totalItems,
      icon: Database,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Synced',
      value: detailedMetrics.syncedItems,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Pending',
      value: detailedMetrics.pendingItems,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Failed',
      value: detailedMetrics.failedItems,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
  ];

  const getTypeIcon = (type: SyncActivity['type']) => {
    switch (type) {
      case 'pipeline': return Cpu;
      case 'dataset': return Database;
      case 'alert': return AlertTriangle;
      case 'experiment': return Activity;
      case 'connection': return Cloud;
      default: return Database;
    }
  };

  const getStatusBadge = (status: SyncActivity['status']) => {
    switch (status) {
      case 'success': return <Badge variant="success" size="sm">Synced</Badge>;
      case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'error': return <Badge variant="danger" size="sm">Failed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Data Synchronization</h1>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-slate-400">
            {syncStatus.isOnline ? '🟢 Online' : '🔴 Offline'}
          </div>
          <Button
            variant="primary"
            onClick={syncAll}
            disabled={syncStatus.isSyncing || !syncStatus.isOnline}
            isLoading={syncStatus.isSyncing}
          >
            <Cloud size={16} className="mr-2" />
            {syncStatus.isSyncing ? 'Syncing All...' : 'Sync All Data'}
          </Button>
        </div>
      </div>

      {/* Sync Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {syncMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardContent className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                  <Icon size={24} className={metric.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-100">{metric.value}</p>
                  <p className="text-sm text-slate-400">{metric.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sync Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Sync Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">Overall Sync Progress</span>
                <span className="text-sm text-slate-400">
                  {Math.round((detailedMetrics.syncedItems / Math.max(detailedMetrics.totalItems, 1)) * 100)}%
                </span>
              </div>
              <ProgressBar 
                value={(detailedMetrics.syncedItems / Math.max(detailedMetrics.totalItems, 1)) * 100}
                variant="success"
              />
            </div>

            {/* Data Volume */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
              <div>
                <p className="text-sm text-slate-400">Data Volume</p>
                <p className="text-lg font-semibold text-slate-200">
                  {detailedMetrics.dataVolume} MB
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Avg Sync Time</p>
                <p className="text-lg font-semibold text-slate-200">
                  {detailedMetrics.avgSyncTime}s
                </p>
              </div>
            </div>

            {/* Last Sync Info */}
            <div className="pt-4 border-t border-slate-700">
              <p className="text-sm text-slate-400">Last Full Sync</p>
              <p className="text-sm text-slate-200">
                {detailedMetrics.lastFullSync.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Auto-sync every {detailedMetrics.syncFrequency}
              </p>
            </div>

            {/* Sync Errors */}
            {syncStatus.syncErrors.length > 0 && (
              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-sm font-medium text-red-400 mb-2">Recent Errors</h4>
                <div className="space-y-1">
                  {syncStatus.syncErrors.slice(0, 3).map((error, index) => (
                    <div key={index} className="bg-red-900/20 border border-red-800 rounded p-2">
                      <p className="text-xs text-red-300">{error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sync Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Sync Activities</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={triggerSync}
                disabled={syncStatus.isSyncing}
              >
                <RefreshCw size={14} className={syncStatus.isSyncing ? 'animate-spin' : ''} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncActivities.length > 0 ? (
                syncActivities.map((activity) => {
                  const TypeIcon = getTypeIcon(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-600 rounded-lg">
                          <TypeIcon size={16} className="text-slate-300" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            {activity.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {activity.action} • {activity.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(activity.status)}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <Cloud size={32} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No sync activities yet</p>
                  <p className="text-xs text-slate-500">Activities will appear when data changes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Data Type Sync Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <Cpu size={24} className="text-blue-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-slate-200">{pipelines.length}</p>
              <p className="text-sm text-slate-400">Pipelines</p>
              <Badge variant="success" size="sm" className="mt-2">Synced</Badge>
            </div>
            
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <Database size={24} className="text-green-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-slate-200">{datasets.length}</p>
              <p className="text-sm text-slate-400">Datasets</p>
              <Badge variant="success" size="sm" className="mt-2">Synced</Badge>
            </div>
            
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <AlertTriangle size={24} className="text-yellow-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-slate-200">{alerts.length}</p>
              <p className="text-sm text-slate-400">Alerts</p>
              <Badge variant="success" size="sm" className="mt-2">Synced</Badge>
            </div>
            
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <Activity size={24} className="text-purple-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-slate-200">{experiments.length}</p>
              <p className="text-sm text-slate-400">Experiments</p>
              <Badge variant="success" size="sm" className="mt-2">Synced</Badge>
            </div>
            
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <Cloud size={24} className="text-indigo-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-slate-200">{externalConnections.length}</p>
              <p className="text-sm text-slate-400">Connections</p>
              <Badge variant="success" size="sm" className="mt-2">Synced</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}