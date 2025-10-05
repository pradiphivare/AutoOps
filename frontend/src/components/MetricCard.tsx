import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  status?: 'normal' | 'warning' | 'critical';
  icon?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  unit = '',
  trend,
  status = 'normal',
  icon
}: MetricCardProps) {
  const statusColors = {
    normal: 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-white',
    warning: 'border-amber-500 bg-gradient-to-br from-amber-50 to-white',
    critical: 'border-rose-500 bg-gradient-to-br from-rose-50 to-white'
  };

  const trendColors = {
    positive: 'text-emerald-600',
    negative: 'text-rose-600',
    neutral: 'text-slate-600'
  };

  const getTrendStatus = () => {
    if (trend === undefined) return 'neutral';
    return trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral';
  };

  const trendStatus = getTrendStatus();

  return (
    <div className={`rounded-xl border-l-4 ${statusColors[status]} p-6 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-slate-600 text-sm font-medium mb-2">
            {icon || <Activity className="w-4 h-4" />}
            <span>{title}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {value}
            </span>
            {unit && <span className="text-lg text-slate-600">{unit}</span>}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trendColors[trendStatus]}`}>
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : trend < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
