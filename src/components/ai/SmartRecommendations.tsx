import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, RefreshCw, Target, Database, Cpu, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useMockData } from '../../hooks/useMockData';
import { useAuth } from '../../context/AuthContext';

interface Recommendation {
  id: string;
  type: 'performance' | 'data_quality' | 'optimization' | 'security' | 'cost';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  category: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  implemented?: boolean;
}

export function SmartRecommendations() {
  const { pipelines, datasets, alerts } = useMockData();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const generateRecommendations = (): Recommendation[] => {
    const recs: Recommendation[] = [];

    // Performance recommendations
    const lowAccuracyPipelines = pipelines.filter(p => p.model_accuracy && p.model_accuracy < 0.9);
    if (lowAccuracyPipelines.length > 0) {
      recs.push({
        id: 'perf_1',
        type: 'performance',
        priority: 'medium',
        title: 'Improve Model Accuracy',
        description: `${lowAccuracyPipelines.length} pipeline(s) have accuracy below 90%. Consider hyperparameter tuning or ensemble methods.`,
        impact: '+3-5% accuracy improvement',
        effort: 'medium',
        category: 'Model Performance',
        action: {
          text: 'Optimize Models',
          onClick: () => console.log('Navigate to model optimization')
        }
      });
    }

    // Data drift recommendations
    const highDriftPipelines = pipelines.filter(p => p.data_drift_score && p.data_drift_score > 0.2);
    if (highDriftPipelines.length > 0) {
      recs.push({
        id: 'drift_1',
        type: 'data_quality',
        priority: 'high',
        title: 'Address Data Drift',
        description: `${highDriftPipelines.length} pipeline(s) show significant data drift. Retrain models with recent data.`,
        impact: 'Prevent performance degradation',
        effort: 'medium',
        category: 'Data Quality',
        action: {
          text: 'Schedule Retraining',
          onClick: () => console.log('Schedule model retraining')
        }
      });
    }

    // Data quality recommendations
    const avgMissingData = datasets.length > 0 
      ? datasets.reduce((sum, d) => sum + d.null_percentage, 0) / datasets.length 
      : 0;
    
    if (avgMissingData > 5) {
      recs.push({
        id: 'data_1',
        type: 'data_quality',
        priority: 'medium',
        title: 'Improve Data Quality',
        description: `Average missing data rate is ${avgMissingData.toFixed(1)}%. Implement better data collection or imputation strategies.`,
        impact: 'Better model reliability',
        effort: 'high',
        category: 'Data Pipeline'
      });
    }

    // Resource optimization
    recs.push({
      id: 'opt_1',
      type: 'optimization',
      priority: 'low',
      title: 'Optimize Training Resources',
      description: 'Enable GPU acceleration for neural network models to reduce training time by 60-80%.',
      impact: '60-80% faster training',
      effort: 'low',
      category: 'Infrastructure',
      action: {
        text: 'Enable GPU',
        onClick: () => console.log('Configure GPU acceleration')
      }
    });

    // Cost optimization
    recs.push({
      id: 'cost_1',
      type: 'cost',
      priority: 'medium',
      title: 'Implement Model Caching',
      description: 'Cache frequently used predictions to reduce compute costs and improve response times.',
      impact: '30-40% cost reduction',
      effort: 'medium',
      category: 'Cost Optimization'
    });

    // Security recommendations (admin only)
    if (user?.role === 'admin') {
      recs.push({
        id: 'sec_1',
        type: 'security',
        priority: 'high',
        title: 'Enable Model Encryption',
        description: 'Encrypt model artifacts and sensitive data to comply with security best practices.',
        impact: 'Enhanced security compliance',
        effort: 'medium',
        category: 'Security'
      });
    }

    // Auto-monitoring setup
    const activeAlerts = alerts.filter(a => !a.acknowledged);
    if (activeAlerts.length > 2) {
      recs.push({
        id: 'mon_1',
        type: 'optimization',
        priority: 'high',
        title: 'Setup Predictive Alerting',
        description: 'Configure AI-powered predictive alerts to detect issues before they impact performance.',
        impact: 'Prevent 70% of incidents',
        effort: 'low',
        category: 'Monitoring'
      });
    }

    return recs;
  };

  const refreshRecommendations = async () => {
    setIsLoading(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newRecs = generateRecommendations();
    setRecommendations(newRecs);
    setIsLoading(false);
  };

  const implementRecommendation = (id: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === id ? { ...rec, implemented: true } : rec
    ));
  };

  useEffect(() => {
    refreshRecommendations();
  }, [pipelines, datasets, alerts, user]);

  const filteredRecommendations = recommendations.filter(rec => 
    filter === 'all' || rec.priority === filter
  );

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'performance': return TrendingUp;
      case 'data_quality': return Database;
      case 'optimization': return Cpu;
      case 'security': return AlertTriangle;
      case 'cost': return Target;
      default: return Lightbulb;
    }
  };

  const getTypeColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'performance': return 'text-green-400';
      case 'data_quality': return 'text-blue-400';
      case 'optimization': return 'text-purple-400';
      case 'security': return 'text-red-400';
      case 'cost': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb size={20} className="text-yellow-400" />
            <CardTitle>Smart Recommendations</CardTitle>
            <Badge variant="info" size="sm">AI-Powered</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-200"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshRecommendations}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3" />
            <span className="text-slate-400">AI analyzing your ML pipelines...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecommendations.map((rec) => {
              const TypeIcon = getTypeIcon(rec.type);
              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-lg border transition-all ${
                    rec.implemented 
                      ? 'bg-green-900/20 border-green-800 opacity-60' 
                      : rec.priority === 'high' 
                        ? 'bg-red-900/20 border-red-800' 
                        : rec.priority === 'medium'
                          ? 'bg-yellow-900/20 border-yellow-800'
                          : 'bg-slate-700/50 border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        rec.implemented ? 'bg-green-600' : 'bg-slate-700'
                      }`}>
                        {rec.implemented ? (
                          <CheckCircle size={16} className="text-white" />
                        ) : (
                          <TypeIcon size={16} className={getTypeColor(rec.type)} />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-slate-200">{rec.title}</h4>
                          <Badge
                            variant={
                              rec.priority === 'high' ? 'danger' :
                              rec.priority === 'medium' ? 'warning' : 'default'
                            }
                            size="sm"
                          >
                            {rec.priority}
                          </Badge>
                          {rec.implemented && (
                            <Badge variant="success" size="sm">Implemented</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-400 mb-2">
                          {rec.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span>📈 {rec.impact}</span>
                          <span>⚡ {rec.effort} effort</span>
                          <span>🏷️ {rec.category}</span>
                        </div>
                      </div>
                    </div>
                    
                    {rec.action && !rec.implemented && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          rec.action!.onClick();
                          implementRecommendation(rec.id);
                        }}
                      >
                        {rec.action.text}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {filteredRecommendations.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-200 mb-2">All Good!</h3>
                <p className="text-slate-400">
                  {filter === 'all' 
                    ? "No recommendations at the moment. Your ML pipelines are running optimally!"
                    : `No ${filter} priority recommendations found.`
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}