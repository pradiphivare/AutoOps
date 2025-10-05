import { AlertCircle, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { Alert } from '../lib/supabase';

interface AlertsPanelProps {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-rose-50 border-l-rose-500 hover:bg-rose-100';
      case 'warning':
        return 'bg-amber-50 border-l-amber-500 hover:bg-amber-100';
      case 'info':
        return 'bg-blue-50 border-l-blue-500 hover:bg-blue-100';
      default:
        return 'bg-slate-50 border-l-slate-500 hover:bg-slate-100';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-rose-100 text-rose-800 border-rose-200',
      acknowledged: 'bg-amber-100 text-amber-800 border-amber-200',
      resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.active}`}>
        {status === 'resolved' && <CheckCircle className="w-3 h-3" />}
        {status === 'acknowledged' && <Clock className="w-3 h-3" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Active Alerts</h3>
        <span className="text-sm text-slate-600 font-medium">
          {alerts.filter(a => a.status === 'active').length} Active
        </span>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
            <p className="font-medium">No alerts</p>
            <p className="text-sm">All systems operating normally</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 rounded-lg p-4 transition-colors duration-150 ${getAlertStyles(alert.alert_type)}`}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.alert_type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{alert.service_name}</h4>
                    {getStatusBadge(alert.status)}
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{alert.message}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="font-medium">
                      {alert.metric_type}: {alert.current_value}{alert.metric_type.includes('cpu') || alert.metric_type.includes('memory') ? '%' : ''}
                    </span>
                    <span>Threshold: {alert.threshold}{alert.metric_type.includes('cpu') || alert.metric_type.includes('memory') ? '%' : ''}</span>
                    <span className="ml-auto">{formatTime(alert.triggered_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
