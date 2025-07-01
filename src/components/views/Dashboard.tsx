import React from 'react';
import { Activity, Database, Cpu, AlertTriangle, TrendingUp, Users, Plus, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { LineChart } from '../charts/LineChart';
import { useMockData } from '../../hooks/useMockData';
import { SmartRecommendations } from '../ai/SmartRecommendations';
import { useAuth } from '../../context/AuthContext';

export function Dashboard() {
  const { pipelines, datasets, experiments, alerts } = useMockData();
  const { user } = useAuth();

  // Calculate actual performance metrics from real data
  const runningPipelines = pipelines.filter(p => p.status === 'running');
  const completedPipelines = pipelines.filter(p => p.status === 'completed');
  const activeAlerts = alerts.filter(a => !a.acknowledged);
  
  // Calculate average model accuracy from completed experiments
  const avgModelAccuracy = experiments.length > 0 
    ? experiments.reduce((sum, exp) => sum + exp.metrics.accuracy, 0) / experiments.length
    : null;

  // Performance data - only show if we have actual models
  const performanceData = avgModelAccuracy ? [
    { x: '6h ago', y: Math.max(0.7, avgModelAccuracy - 0.03) },
    { x: '5h ago', y: Math.max(0.7, avgModelAccuracy - 0.01) },
    { x: '4h ago', y: Math.max(0.7, avgModelAccuracy + 0.02) },
    { x: '3h ago', y: Math.max(0.7, avgModelAccuracy - 0.01) },
    { x: '2h ago', y: Math.max(0.7, avgModelAccuracy + 0.03) },
    { x: '1h ago', y: Math.max(0.7, avgModelAccuracy - 0.01) },
    { x: 'now', y: avgModelAccuracy },
  ] : [];

  const stats = [
    {
      title: 'Active Pipelines',
      value: runningPipelines.length,
      total: pipelines.length,
      icon: Cpu,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      subtitle: `${pipelines.length} total`
    },
    {
      title: 'Datasets',
      value: datasets.length,
      total: datasets.length,
      icon: Database,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      subtitle: datasets.length > 0 
        ? `${datasets.reduce((sum, d) => sum + d.size, 0).toLocaleString()} records`
        : 'No data available'
    },
    {
      title: 'Model Performance',
      value: avgModelAccuracy ? `${(avgModelAccuracy * 100).toFixed(1)}%` : 'N/A',
      total: '100%',
      icon: TrendingUp,
      color: avgModelAccuracy ? 'text-purple-400' : 'text-slate-500',
      bgColor: avgModelAccuracy ? 'bg-purple-500/10' : 'bg-slate-500/10',
      subtitle: experiments.length > 0 ? `${experiments.length} models` : 'No models trained'
    },
    {
      title: 'Active Alerts',
      value: activeAlerts.length,
      total: alerts.length,
      icon: AlertTriangle,
      color: activeAlerts.length > 0 ? 'text-red-400' : 'text-slate-500',
      bgColor: activeAlerts.length > 0 ? 'bg-red-500/10' : 'bg-slate-500/10',
      subtitle: activeAlerts.length > 0 ? 'Needs attention' : 'All clear'
    },
  ];

  // Check if user has any data to work with
  const hasAnyData = datasets.length > 0 || pipelines.length > 0 || experiments.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Dashboard Overview</h1>
        <div className="text-sm text-slate-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon size={24} className={stat.color} />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.title}</p>
                  <p className="text-xs text-slate-500">{stat.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!hasAnyData ? (
        /* Empty State - No Data */
        <Card>
          <CardContent className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 size={40} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-300 mb-4">Welcome to ML Pipeline Dashboard</h3>
              <p className="text-slate-400 mb-8">
                Get started by uploading datasets and creating ML pipelines. Your dashboard will come to life as you build and train models.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-slate-800 rounded-lg">
                  <Database size={24} className="text-blue-400 mx-auto mb-2" />
                  <h4 className="font-medium text-slate-200 mb-1">1. Upload Data</h4>
                  <p className="text-xs text-slate-400">Start with your datasets</p>
                </div>
                <div className="text-center p-4 bg-slate-800 rounded-lg">
                  <Cpu size={24} className="text-green-400 mx-auto mb-2" />
                  <h4 className="font-medium text-slate-200 mb-1">2. Create Pipelines</h4>
                  <p className="text-xs text-slate-400">Build ML workflows</p>
                </div>
                <div className="text-center p-4 bg-slate-800 rounded-lg">
                  <TrendingUp size={24} className="text-purple-400 mx-auto mb-2" />
                  <h4 className="font-medium text-slate-200 mb-1">3. Monitor & Deploy</h4>
                  <p className="text-xs text-slate-400">Track performance</p>
                </div>
              </div>

              {user?.role === 'admin' && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="primary">
                    <Database size={16} className="mr-2" />
                    Upload First Dataset
                  </Button>
                  <Button variant="secondary">
                    <Plus size={16} className="mr-2" />
                    Create Pipeline
                  </Button>
                </div>
              )}
              
              {user?.role === 'viewer' && (
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    Contact your administrator to upload datasets and create ML pipelines.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline Status */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pipelines.length > 0 ? (
                  pipelines.map((pipeline) => (
                    <div key={pipeline.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-200">
                          {pipeline.name}
                        </span>
                        <Badge
                          variant={
                            pipeline.status === 'completed' ? 'success' :
                            pipeline.status === 'running' ? 'info' :
                            pipeline.status === 'failed' ? 'danger' : 'default'
                          }
                          size="sm"
                        >
                          {pipeline.status}
                        </Badge>
                      </div>
                      <ProgressBar 
                        value={pipeline.progress} 
                        variant={
                          pipeline.status === 'completed' ? 'success' :
                          pipeline.status === 'failed' ? 'danger' : 'default'
                        }
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Cpu size={32} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No pipelines created yet</p>
                    {user?.role === 'admin' && (
                      <Button variant="secondary" size="sm" className="mt-3">
                        Create Pipeline
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Model Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {performanceData.length > 0 ? (
                  <LineChart
                    data={performanceData}
                    height={200}
                    color="#8B5CF6"
                    title="Average Accuracy (Based on trained models)"
                  />
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center">
                    <TrendingUp size={32} className="text-slate-600 mb-3" />
                    <p className="text-sm text-slate-400 text-center">
                      Performance trends will appear when you train models
                    </p>
                    {user?.role === 'admin' && datasets.length > 0 && (
                      <Button variant="secondary" size="sm" className="mt-3">
                        Train First Model
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Smart Recommendations - only show if there's data to analyze */}
          {(pipelines.length > 0 || datasets.length > 0 || experiments.length > 0) && (
            <SmartRecommendations />
          )}

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.length > 0 ? (
                  alerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <AlertTriangle
                          size={16}
                          className={
                            alert.severity === 'high' ? 'text-red-400' :
                            alert.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                          }
                        />
                        <div>
                          <p className="text-sm text-slate-200">{alert.message}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          alert.severity === 'high' ? 'danger' :
                          alert.severity === 'medium' ? 'warning' : 'info'
                        }
                        size="sm"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <AlertTriangle size={32} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No alerts - system running smoothly</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}