import { Brain, TrendingUp, TrendingDown } from 'lucide-react';
import { Anomaly } from '../lib/supabase';

interface AnomaliesPanelProps {
  anomalies: Anomaly[];
}

export function AnomaliesPanel({ anomalies }: AnomaliesPanelProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-rose-600 bg-rose-100 border-rose-200';
    if (confidence >= 60) return 'text-amber-600 bg-amber-100 border-amber-200';
    return 'text-blue-600 bg-blue-100 border-blue-200';
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
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-slate-900">AI-Detected Anomalies</h3>
        </div>
        <span className="text-sm text-slate-600 font-medium">
          {anomalies.length} Detected
        </span>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {anomalies.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Brain className="w-12 h-12 mx-auto mb-2 text-slate-400" />
            <p className="font-medium">No anomalies detected</p>
            <p className="text-sm">System behavior is within normal parameters</p>
          </div>
        ) : (
          anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className="border-l-4 border-l-violet-500 bg-gradient-to-r from-violet-50 to-white rounded-lg p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-slate-900">{anomaly.service_name}</h4>
                  <p className="text-sm text-slate-600 capitalize">{anomaly.metric_type.replace('_', ' ')}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getConfidenceColor(anomaly.confidence)}`}>
                  {anomaly.confidence.toFixed(0)}% Confidence
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Expected</p>
                  <p className="text-lg font-bold text-slate-700">{anomaly.expected_value.toFixed(1)}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-rose-200">
                  <p className="text-xs text-slate-600 mb-1">Actual</p>
                  <p className="text-lg font-bold text-rose-600">{anomaly.actual_value.toFixed(1)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {anomaly.deviation > 0 ? (
                    <TrendingUp className="w-4 h-4 text-rose-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                  )}
                  <span className="font-medium text-slate-700">
                    Deviation: {Math.abs(anomaly.deviation).toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs text-slate-500">{formatTime(anomaly.detected_at)}</span>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  Detection: <span className="font-medium capitalize">{anomaly.detection_method.replace('_', ' ')}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
