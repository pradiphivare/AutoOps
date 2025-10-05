import { RotateCw, CheckCircle, XCircle, Clock, ArrowUpCircle, RotateCcw } from 'lucide-react';
import { Remediation } from '../lib/supabase';

interface RemediationLogProps {
  remediations: Remediation[];
}

export function RemediationLog({ remediations }: RemediationLogProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-slate-600" />;
      default:
        return <RotateCw className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-50 border-l-emerald-500';
      case 'failed':
        return 'bg-rose-50 border-l-rose-500';
      case 'in_progress':
        return 'bg-blue-50 border-l-blue-500';
      case 'pending':
        return 'bg-slate-50 border-l-slate-500';
      default:
        return 'bg-slate-50 border-l-slate-500';
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'restart_pod':
        return <RotateCw className="w-4 h-4" />;
      case 'scale_up':
        return <ArrowUpCircle className="w-4 h-4" />;
      case 'rollback':
        return <RotateCcw className="w-4 h-4" />;
      default:
        return <RotateCw className="w-4 h-4" />;
    }
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

  const getDuration = (started: string, completed: string | null) => {
    if (!completed) return 'In progress...';
    const start = new Date(started).getTime();
    const end = new Date(completed).getTime();
    const diffSec = Math.floor((end - start) / 1000);
    if (diffSec < 60) return `${diffSec}s`;
    return `${Math.floor(diffSec / 60)}m ${diffSec % 60}s`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RotateCw className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-slate-900">Auto-Remediation Log</h3>
        </div>
        <span className="text-sm text-slate-600 font-medium">
          {remediations.filter(r => r.status === 'success').length}/{remediations.length} Successful
        </span>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {remediations.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <RotateCw className="w-12 h-12 mx-auto mb-2 text-slate-400" />
            <p className="font-medium">No remediations yet</p>
            <p className="text-sm">System is running smoothly</p>
          </div>
        ) : (
          remediations.map((remediation) => (
            <div
              key={remediation.id}
              className={`border-l-4 rounded-lg p-4 transition-all duration-200 ${getStatusStyles(remediation.status)}`}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(remediation.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">{remediation.service_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {getActionIcon(remediation.action_type)}
                        <span className="text-sm text-slate-600 capitalize">
                          {remediation.action_type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      remediation.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                      remediation.status === 'failed' ? 'bg-rose-100 text-rose-800' :
                      remediation.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {remediation.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 mb-2">
                    <span className="capitalize">Trigger: {remediation.trigger_type}</span>
                    <span>Duration: {getDuration(remediation.started_at, remediation.completed_at)}</span>
                    <span className="ml-auto">{formatTime(remediation.started_at)}</span>
                  </div>

                  {remediation.error_message && (
                    <div className="mt-2 p-2 bg-rose-100 border border-rose-200 rounded text-xs text-rose-800">
                      <span className="font-medium">Error:</span> {remediation.error_message}
                    </div>
                  )}

                  {Object.keys(remediation.action_details).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-slate-500 hover:text-slate-700 font-medium">
                          Action Details
                        </summary>
                        <pre className="mt-2 p-2 bg-slate-50 rounded overflow-x-auto text-slate-700">
                          {JSON.stringify(remediation.action_details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
