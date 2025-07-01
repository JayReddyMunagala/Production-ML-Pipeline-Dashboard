import React from 'react';
import { AlertTriangle, CheckCircle, Bell, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useMockData } from '../../hooks/useMockData';
import { useAuth } from '../../context/AuthContext';

export function Alerts() {
  const { alerts, setAlerts } = useMockData();
  const { user } = useAuth();

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const handleDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const activeAlerts = alerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Alert Management</h1>
        <div className="flex items-center space-x-4">
          <Badge variant="danger" size="sm">
            {activeAlerts.length} Active
          </Badge>
          <Badge variant="default" size="sm">
            {acknowledgedAlerts.length} Acknowledged
          </Badge>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center space-x-4">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">
                {alerts.filter(a => a.severity === 'high').length}
              </p>
              <p className="text-sm text-slate-400">High Priority</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <Bell size={24} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">
                {alerts.filter(a => a.severity === 'medium').length}
              </p>
              <p className="text-sm text-slate-400">Medium Priority</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <CheckCircle size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">
                {acknowledgedAlerts.length}
              </p>
              <p className="text-sm text-slate-400">Acknowledged</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100">Active Alerts</h2>
          
          {activeAlerts.map((alert) => (
            <Card key={alert.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-4">
                  <AlertTriangle
                    size={20}
                    className={
                      alert.severity === 'high' ? 'text-red-400' :
                      alert.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                    }
                  />
                  
                  <div>
                    <p className="font-medium text-slate-200">{alert.message}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge
                        variant={
                          alert.severity === 'high' ? 'danger' :
                          alert.severity === 'medium' ? 'warning' : 'info'
                        }
                        size="sm"
                      >
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {alert.type} • {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Acknowledge
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(alert.id)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100">Acknowledged Alerts</h2>
          
          {acknowledgedAlerts.map((alert) => (
            <Card key={alert.id}>
              <CardContent className="flex items-center justify-between py-4 opacity-60">
                <div className="flex items-center space-x-4">
                  <CheckCircle size={20} className="text-green-400" />
                  
                  <div>
                    <p className="font-medium text-slate-300">{alert.message}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="success" size="sm">
                        Acknowledged
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {alert.type} • {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(alert.id)}
                  >
                    <X size={16} />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {alerts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">All Clear!</h3>
            <p className="text-slate-400">No active alerts at the moment.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}