import React, { useState } from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  service: string;
  message: string;
  details?: string;
}

export function Logs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const mockLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: '2024-01-20T15:30:45Z',
      level: 'info',
      service: 'Pipeline',
      message: 'Customer Churn model training started',
      details: 'Using Random Forest algorithm with 100 estimators'
    },
    {
      id: '2',
      timestamp: '2024-01-20T15:25:12Z',
      level: 'warning',
      service: 'Data',
      message: 'High null percentage detected in dataset',
      details: 'Column "income" has 15.2% missing values'
    },
    {
      id: '3',
      timestamp: '2024-01-20T15:22:33Z',
      level: 'error',
      service: 'API',
      message: 'Model endpoint returned 500 error',
      details: 'Connection timeout after 30 seconds'
    },
    {
      id: '4',
      timestamp: '2024-01-20T15:20:01Z',
      level: 'info',
      service: 'Monitoring',
      message: 'Data drift check completed',
      details: 'Drift score: 0.22, threshold: 0.2'
    },
    {
      id: '5',
      timestamp: '2024-01-20T15:18:45Z',
      level: 'debug',
      service: 'Pipeline',
      message: 'Feature engineering step completed',
      details: 'Generated 15 new features from existing data'
    },
  ];

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'debug': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">System Logs</h1>
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm">
            <Download size={16} className="mr-2" />
            Export Logs
          </Button>
          <Button variant="secondary" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <Badge variant={getLevelColor(log.level)} size="sm">
                    {log.level.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-slate-400">{log.service}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <p className="text-slate-200 font-medium">{log.message}</p>
                
                {log.details && (
                  <p className="text-sm text-slate-400 bg-slate-800 p-2 rounded font-mono">
                    {log.details}
                  </p>
                )}
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Search size={48} className="text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-400 mb-2">No logs found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}