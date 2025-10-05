import { Server, CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { ServiceHealth } from '../lib/supabase';

interface ServiceHealthPanelProps {
  services: ServiceHealth[];
}

export function ServiceHealthPanel({ services }: ServiceHealthPanelProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'degraded':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'critical':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return 'text-emerald-600';
    if (uptime >= 95) return 'text-amber-600';
    return 'text-rose-600';
  };

  const formatLastCheck = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
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
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-900">Service Health</h3>
        </div>
        <span className="text-sm text-slate-600 font-medium">
          {services.filter(s => s.status === 'healthy').length}/{services.length} Healthy
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {services.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-slate-500">
            <Server className="w-12 h-12 mx-auto mb-2 text-slate-400" />
            <p className="font-medium">No services monitored</p>
            <p className="text-sm">Add services to start monitoring</p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className={`rounded-lg p-4 border transition-all duration-200 hover:shadow-md ${getStatusStyles(service.status)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <div>
                    <h4 className="font-semibold text-slate-900">{service.service_name}</h4>
                    <p className="text-xs text-slate-600 capitalize">{service.status}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Uptime</span>
                  <span className={`text-sm font-bold ${getUptimeColor(service.uptime_percentage)}`}>
                    {service.uptime_percentage.toFixed(2)}%
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      service.uptime_percentage >= 99 ? 'bg-emerald-500' :
                      service.uptime_percentage >= 95 ? 'bg-amber-500' :
                      'bg-rose-500'
                    }`}
                    style={{ width: `${service.uptime_percentage}%` }}
                  />
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Last check: {formatLastCheck(service.last_health_check)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
