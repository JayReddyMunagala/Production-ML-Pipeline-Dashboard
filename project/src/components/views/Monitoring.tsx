import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, Play, Database, Cpu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LineChart } from '../charts/LineChart';
import { useMockData } from '../../hooks/useMockData';

export function Monitoring() {
  const { pipelines, datasets, experiments, setAlerts } = useMockData();
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Get running pipelines
  const runningPipelines = pipelines.filter(p => p.status === 'running');
  const completedPipelines = pipelines.filter(p => p.status === 'completed');
  const hasActiveMonitoring = runningPipelines.length > 0 || completedPipelines.length > 0;

  // Real-time data states - only meaningful when we have active pipelines
  const [accuracyData, setAccuracyData] = useState(() => {
    if (!hasActiveMonitoring) return [];
    
    // Generate initial data based on completed pipelines
    const avgAccuracy = completedPipelines.length > 0 
      ? completedPipelines.reduce((sum, p) => sum + (p.model_accuracy || 0.8), 0) / completedPipelines.length
      : 0.85;
    
    return [
      { x: '7d ago', y: avgAccuracy - 0.02 },
      { x: '6d ago', y: avgAccuracy - 0.01 },
      { x: '5d ago', y: avgAccuracy + 0.01 },
      { x: '4d ago', y: avgAccuracy },
      { x: '3d ago', y: avgAccuracy - 0.01 },
      { x: '2d ago', y: avgAccuracy + 0.02 },
      { x: '1d ago', y: avgAccuracy },
      { x: 'now', y: avgAccuracy + 0.01 },
    ];
  });

  const [driftData, setDriftData] = useState(() => {
    if (!hasActiveMonitoring) return [];
    
    // Generate initial drift data based on actual pipeline drift scores
    const avgDrift = completedPipelines.length > 0
      ? completedPipelines.reduce((sum, p) => sum + (p.data_drift_score || 0.1), 0) / completedPipelines.length
      : 0.15;
    
    return [
      { x: '7d ago', y: Math.max(0.02, avgDrift - 0.1) },
      { x: '6d ago', y: Math.max(0.02, avgDrift - 0.08) },
      { x: '5d ago', y: Math.max(0.02, avgDrift - 0.05) },
      { x: '4d ago', y: Math.max(0.02, avgDrift - 0.03) },
      { x: '3d ago', y: avgDrift },
      { x: '2d ago', y: avgDrift + 0.02 },
      { x: '1d ago', y: avgDrift + 0.04 },
      { x: 'now', y: avgDrift + 0.05 },
    ];
  });

  const [latencyData, setLatencyData] = useState(() => {
    if (!hasActiveMonitoring) return [];
    
    return [
      { x: '7d ago', y: 45 },
      { x: '6d ago', y: 52 },
      { x: '5d ago', y: 48 },
      { x: '4d ago', y: 55 },
      { x: '3d ago', y: 49 },
      { x: '2d ago', y: 53 },
      { x: '1d ago', y: 58 },
      { x: 'now', y: 51 },
    ];
  });

  const [metrics, setMetrics] = useState(() => {
    if (!hasActiveMonitoring) {
      return [
        {
          title: 'Model Accuracy',
          value: 'N/A',
          change: '0%',
          trend: 'neutral',
          icon: TrendingUp,
          color: 'text-slate-400',
        },
        {
          title: 'Data Drift Score',
          value: 'N/A',
          change: '0',
          trend: 'neutral',
          icon: TrendingDown,
          color: 'text-slate-400',
        },
        {
          title: 'Avg Response Time',
          value: 'N/A',
          change: '0ms',
          trend: 'neutral',
          icon: Activity,
          color: 'text-slate-400',
        },
        {
          title: 'Active Alerts',
          value: '0',
          change: '0',
          trend: 'neutral',
          icon: AlertTriangle,
          color: 'text-slate-400',
        },
      ];
    }

    const avgAccuracy = completedPipelines.length > 0 
      ? completedPipelines.reduce((sum, p) => sum + (p.model_accuracy || 0.8), 0) / completedPipelines.length
      : 0.85;

    const avgDrift = completedPipelines.length > 0
      ? completedPipelines.reduce((sum, p) => sum + (p.data_drift_score || 0.1), 0) / completedPipelines.length
      : 0.15;

    return [
      {
        title: 'Model Accuracy',
        value: `${(avgAccuracy * 100).toFixed(1)}%`,
        change: '+2.1%',
        trend: 'up',
        icon: TrendingUp,
        color: 'text-green-400',
      },
      {
        title: 'Data Drift Score',
        value: avgDrift.toFixed(2),
        change: '+0.05',
        trend: avgDrift > 0.2 ? 'up' : 'down',
        icon: TrendingDown,
        color: avgDrift > 0.2 ? 'text-red-400' : 'text-yellow-400',
      },
      {
        title: 'Avg Response Time',
        value: '51ms',
        change: '-7ms',
        trend: 'down',
        icon: Activity,
        color: 'text-blue-400',
      },
      {
        title: 'Active Alerts',
        value: '0',
        change: '0',
        trend: 'neutral',
        icon: AlertTriangle,
        color: 'text-slate-400',
      },
    ];
  });

  const [systemResources, setSystemResources] = useState(() => ({
    cpu: hasActiveMonitoring ? 45 + (runningPipelines.length * 15) : 20,
    memory: hasActiveMonitoring ? 60 + (runningPipelines.length * 10) : 35,
    requestsPerSecond: hasActiveMonitoring ? 100 + (runningPipelines.length * 50) : 0,
    errorRate: hasActiveMonitoring ? 0.01 : 0,
  }));

  // Real-time updates only when we have active monitoring
  useEffect(() => {
    if (!isLive || !hasActiveMonitoring) return;

    const interval = setInterval(() => {
      const now = new Date();
      setLastUpdate(now);

      // Update accuracy data (based on actual pipeline performance)
      setAccuracyData(prev => {
        if (prev.length === 0) return prev;
        
        const lastPoint = prev[prev.length - 1];
        const baseAccuracy = completedPipelines.length > 0 
          ? completedPipelines.reduce((sum, p) => sum + (p.model_accuracy || 0.8), 0) / completedPipelines.length
          : 0.85;
        
        const newAccuracy = Math.max(0.7, Math.min(0.95, 
          baseAccuracy + (Math.random() - 0.5) * 0.02
        ));
        
        return [...prev.slice(1), { 
          x: now.toLocaleTimeString().slice(0, 5), 
          y: newAccuracy 
        }];
      });

      // Update drift data (based on actual pipeline drift)
      setDriftData(prev => {
        if (prev.length === 0) return prev;
        
        const baseDrift = completedPipelines.length > 0
          ? completedPipelines.reduce((sum, p) => sum + (p.data_drift_score || 0.1), 0) / completedPipelines.length
          : 0.15;
        
        let newDrift = baseDrift + (Math.random() - 0.3) * 0.03;
        newDrift = Math.max(0.02, Math.min(0.4, newDrift));
        
        return [...prev.slice(1), { 
          x: now.toLocaleTimeString().slice(0, 5), 
          y: newDrift 
        }];
      });

      // Update latency data (only if pipelines are running)
      if (runningPipelines.length > 0) {
        setLatencyData(prev => {
          if (prev.length === 0) return prev;
          
          const lastPoint = prev[prev.length - 1];
          const baseLatency = 40 + (runningPipelines.length * 10);
          const newLatency = Math.max(30, Math.min(100, 
            baseLatency + (Math.random() - 0.5) * 15
          ));
          
          return [...prev.slice(1), { 
            x: now.toLocaleTimeString().slice(0, 5), 
            y: Math.round(newLatency) 
          }];
        });
      }

      // Update system resources based on actual load
      setSystemResources(prev => ({
        cpu: Math.max(20, Math.min(90, 45 + (runningPipelines.length * 15) + (Math.random() - 0.5) * 5)),
        memory: Math.max(35, Math.min(85, 60 + (runningPipelines.length * 10) + (Math.random() - 0.5) * 3)),
        requestsPerSecond: Math.max(0, runningPipelines.length * 50 + (Math.random() - 0.5) * 20),
        errorRate: Math.max(0, Math.min(0.05, (Math.random() - 0.8) * 0.02)),
      }));

      // Update metrics
      setMetrics(prev => {
        if (!hasActiveMonitoring) return prev;
        
        const currentAccuracy = accuracyData[accuracyData.length - 1]?.y || 0.85;
        const currentDrift = driftData[driftData.length - 1]?.y || 0.15;
        const currentLatency = latencyData[latencyData.length - 1]?.y || 51;
        
        return [
          {
            ...prev[0],
            value: `${(currentAccuracy * 100).toFixed(1)}%`,
            change: `${(Math.random() > 0.5 ? '+' : '-')}${(Math.random() * 2).toFixed(1)}%`,
            trend: Math.random() > 0.5 ? 'up' : 'down',
          },
          {
            ...prev[1],
            value: currentDrift.toFixed(2),
            change: `${(Math.random() > 0.3 ? '+' : '-')}${(Math.random() * 0.05).toFixed(2)}`,
            trend: currentDrift > 0.2 ? 'up' : 'down',
            color: currentDrift > 0.2 ? 'text-red-400' : 'text-yellow-400',
          },
          {
            ...prev[2],
            value: `${Math.round(currentLatency)}ms`,
            change: `${(Math.random() > 0.5 ? '-' : '+')}${Math.round(Math.random() * 10)}ms`,
            trend: Math.random() > 0.6 ? 'down' : 'up',
          },
          {
            ...prev[3],
            value: '0',
            change: '0',
            trend: 'neutral',
          },
        ];
      });

      // Add alerts for high drift only if we have active monitoring
      if (Math.random() > 0.995 && hasActiveMonitoring) { // Very rare, 0.5% chance per second
        const currentDrift = driftData[driftData.length - 1]?.y || 0.15;
        if (currentDrift > 0.25) {
          setAlerts(prev => [{
            id: `alert_${Date.now()}`,
            type: 'drift' as const,
            severity: 'medium' as const,
            message: `High data drift detected (score: ${currentDrift.toFixed(3)})`,
            timestamp: new Date().toISOString(),
            acknowledged: false,
          }, ...prev]);
        }
      }

    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isLive, hasActiveMonitoring, runningPipelines.length, completedPipelines.length, accuracyData, driftData, latencyData, setAlerts]);

  // Reset data when monitoring state changes
  useEffect(() => {
    if (!hasActiveMonitoring) {
      setAccuracyData([]);
      setDriftData([]);
      setLatencyData([]);
      setSystemResources({
        cpu: 20,
        memory: 35,
        requestsPerSecond: 0,
        errorRate: 0,
      });
    }
  }, [hasActiveMonitoring]);

  // If no active monitoring, show empty state
  if (!hasActiveMonitoring) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Model Monitoring</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="default" size="sm">No Active Monitoring</Badge>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-16">
            <Activity size={64} className="text-slate-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-slate-300 mb-4">No Models to Monitor</h3>
            <div className="space-y-3 text-slate-400 max-w-md mx-auto">
              <p>Start monitoring by:</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 justify-center">
                  <Database size={16} />
                  <span>Upload datasets ({datasets.length} available)</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <Cpu size={16} />
                  <span>Create and run ML pipelines ({pipelines.length} created)</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <Play size={16} />
                  <span>Deploy models for real-time monitoring</span>
                </div>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <p className="text-sm text-slate-500">
                Monitoring will automatically activate when you have:
              </p>
              <div className="grid md:grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="text-center p-3 bg-slate-800 rounded-lg">
                  <Database size={20} className="text-slate-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">Active Datasets</p>
                </div>
                <div className="text-center p-3 bg-slate-800 rounded-lg">
                  <Cpu size={20} className="text-slate-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">Running Pipelines</p>
                </div>
                <div className="text-center p-3 bg-slate-800 rounded-lg">
                  <Activity size={20} className="text-slate-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">Live Models</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Model Monitoring</h1>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                isLive ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-sm font-medium">{isLive ? 'Live' : 'Paused'}</span>
            </button>
            <span className="text-sm text-slate-400">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Monitoring Status */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-300 mb-1">Active Monitoring</h3>
            <p className="text-sm text-blue-200">
              Monitoring {runningPipelines.length} running pipeline{runningPipelines.length !== 1 ? 's' : ''} 
              {completedPipelines.length > 0 && ` and ${completedPipelines.length} completed model${completedPipelines.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex space-x-2">
            <Badge variant="success" size="sm">
              {runningPipelines.length} Running
            </Badge>
            <Badge variant="info" size="sm">
              {completedPipelines.length} Deployed
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-100">{metric.value}</p>
                  <p className="text-sm text-slate-400">{metric.title}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <span
                      className={`text-xs font-medium ${
                        metric.trend === 'up' && metric.title.includes('Drift') ? 'text-red-400' :
                        metric.trend === 'up' ? 'text-green-400' :
                        metric.trend === 'down' && metric.title.includes('Time') ? 'text-green-400' :
                        metric.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                      }`}
                    >
                      {metric.change}
                    </span>
                    <span className="text-xs text-slate-500">vs last week</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-slate-700`}>
                  <Icon size={24} className={metric.color} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Accuracy Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-slate-400">Live Accuracy Monitoring</span>
              {isLive && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400">Live</span>
                </div>
              )}
            </div>
            {accuracyData.length > 0 ? (
              <LineChart
                data={accuracyData}
                height={250}
                color="#10B981"
              />
            ) : (
              <div className="h-[250px] flex items-center justify-center bg-slate-800/30 rounded-lg">
                <p className="text-slate-500">No accuracy data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Drift Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-slate-400">Real-time Drift Detection</span>
              {isLive && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-xs text-red-400">Live</span>
                </div>
              )}
            </div>
            {driftData.length > 0 ? (
              <>
                <LineChart
                  data={driftData}
                  height={250}
                  color="#EF4444"
                />
                <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle size={16} className="text-red-400" />
                    <span className="text-sm text-red-300">
                      {driftData[driftData.length - 1]?.y > 0.25 
                        ? `High drift detected! Current score: ${driftData[driftData.length - 1]?.y.toFixed(3)}`
                        : `Drift monitoring active. Current score: ${driftData[driftData.length - 1]?.y.toFixed(3)}`
                      }
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[250px] flex items-center justify-center bg-slate-800/30 rounded-lg">
                <p className="text-slate-500">No drift data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-slate-400">API Response Time</span>
              {isLive && runningPipelines.length > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-xs text-blue-400">Live</span>
                </div>
              )}
            </div>
            {latencyData.length > 0 && runningPipelines.length > 0 ? (
              <LineChart
                data={latencyData}
                height={250}
                color="#3B82F6"
              />
            ) : (
              <div className="h-[250px] flex items-center justify-center bg-slate-800/30 rounded-lg">
                <p className="text-slate-500">
                  {runningPipelines.length === 0 ? 'No running pipelines' : 'No response time data'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Model Endpoints</span>
                <Badge variant={completedPipelines.length > 0 ? "success" : "default"} size="sm">
                  {completedPipelines.length > 0 ? 'Active' : 'None'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Data Pipeline</span>
                <Badge variant={runningPipelines.length > 0 ? "success" : "default"} size="sm">
                  {runningPipelines.length > 0 ? 'Running' : 'Idle'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Monitoring Service</span>
                <Badge variant="success" size="sm">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Data Storage</span>
                <Badge variant={datasets.length > 0 ? "success" : "warning"} size="sm">
                  {datasets.length > 0 ? 'Connected' : 'No Data'}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-2">System Resources</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">CPU Usage</span>
                  <span className="text-xs text-slate-300">{Math.round(systemResources.cpu)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      systemResources.cpu > 80 ? 'bg-red-500' : 
                      systemResources.cpu > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} 
                    style={{ width: `${systemResources.cpu}%` }} 
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Memory Usage</span>
                  <span className="text-xs text-slate-300">{Math.round(systemResources.memory)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      systemResources.memory > 85 ? 'bg-red-500' : 
                      systemResources.memory > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} 
                    style={{ width: `${systemResources.memory}%` }} 
                  />
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                  <span className="text-xs text-slate-400">Requests/sec</span>
                  <span className="text-xs text-slate-300">{Math.round(systemResources.requestsPerSecond)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Error Rate</span>
                  <span className={`text-xs ${systemResources.errorRate > 0.05 ? 'text-red-400' : 'text-green-400'}`}>
                    {(systemResources.errorRate * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}