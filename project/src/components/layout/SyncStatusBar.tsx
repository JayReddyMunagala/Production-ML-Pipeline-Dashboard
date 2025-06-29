import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle, Cloud } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useDataSync } from '../../context/DataSyncContext';

export function SyncStatusBar() {
  const { syncStatus, triggerSync, syncAll } = useDataSync();

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {syncStatus.isOnline ? (
              <Wifi size={16} className="text-green-400" />
            ) : (
              <WifiOff size={16} className="text-red-400" />
            )}
            <span className={`text-sm ${syncStatus.isOnline ? 'text-green-400' : 'text-red-400'}`}>
              {syncStatus.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Sync Status */}
          <div className="flex items-center space-x-2">
            {syncStatus.isSyncing ? (
              <>
                <RefreshCw size={16} className="text-blue-400 animate-spin" />
                <span className="text-sm text-blue-400">Syncing...</span>
              </>
            ) : syncStatus.syncErrors.length > 0 ? (
              <>
                <AlertTriangle size={16} className="text-red-400" />
                <span className="text-sm text-red-400">Sync errors</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm text-slate-300">
                  Last sync: {formatLastSync(syncStatus.lastSync)}
                </span>
              </>
            )}
          </div>

          {/* Pending Changes */}
          {syncStatus.pendingChanges > 0 && (
            <Badge variant="warning" size="sm">
              {syncStatus.pendingChanges} pending
            </Badge>
          )}

          {/* Sync Errors */}
          {syncStatus.syncErrors.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="danger" size="sm">
                {syncStatus.syncErrors.length} error{syncStatus.syncErrors.length !== 1 ? 's' : ''}
              </Badge>
              {syncStatus.syncErrors.slice(0, 2).map((error, index) => (
                <div key={index} className="max-w-xs">
                  <span className="text-xs text-red-300 truncate">
                    {error}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sync Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={triggerSync}
            disabled={syncStatus.isSyncing || !syncStatus.isOnline}
            isLoading={syncStatus.isSyncing}
          >
            <RefreshCw size={14} className="mr-1" />
            Sync
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={syncAll}
            disabled={syncStatus.isSyncing || !syncStatus.isOnline}
            isLoading={syncStatus.isSyncing}
          >
            <Cloud size={14} className="mr-1" />
            Sync All
          </Button>
        </div>
      </div>
    </div>
  );
}