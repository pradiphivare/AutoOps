import { useState, useEffect, useMemo } from 'react';
import { Activity, Server, AlertCircle, Brain, RotateCw, RefreshCw } from 'lucide-react';
import { MetricCard } from './components/MetricCard';
import { MetricsChart } from './components/MetricsChart';
import { AlertsPanel } from './components/AlertsPanel';
import { AnomaliesPanel } from './components/AnomaliesPanel';
import { RemediationLog } from './components/RemediationLog';
import { ServiceHealthPanel } from './components/ServiceHealthPanel';
import {
  generateMockMetrics,
  generateMockAlerts,
  generateMockAnomalies,
  generateMockRemediations,
  generateMockServices
} from './utils/mockData';

function App() {
  const [metrics, setMetrics] = useState(generateMockMetrics(30));
  const [alerts, setAlerts] = useState(generateMockAlerts());
  const [anomalies, setAnomalies] = useState(generateMockAnomalies());
  const [remediations, setRemediations] = useState(generateMockRemediations());
  const [services, setServices] = useState(generateMockServices());
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const newMetrics = [...prev];
        const timestamp = new Date();
        const services = ['web-server', 'api-gateway', 'database', 'cache-service', 'worker-queue'];
        const metricTypes = ['cpu', 'memory', 'disk'];

        services.forEach(service => {
          metricTypes.forEach(type => {
            let value = 0;
            if (type === 'cpu') {
              value = Math.random() * 40 + 30 + Math.sin(Date.now() / 10000) * 20;
              if (service === 'api-gateway') value = 88 + Math.random() * 10;
            } else if (type === 'memory') {
              value = Math.random() * 30 + 50 + Math.cos(Date.now() / 15000) * 15;
            } else {
              value = Math.random() * 20 + 60;
            }

            newMetrics.push({
              id: `${service}-${type}-${Date.now()}`,
              service_name: service,
              metric_type: type,
              value: Math.max(0, Math.min(100, value)),
              unit: '%',
              timestamp: timestamp.toISOString(),
              labels: { environment: 'production', region: 'us-east-1' },
              created_at: timestamp.toISOString()
            });
          });
        });

        return newMetrics.slice(-150);
      });
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const latestMetrics = useMemo(() => {
    const latest: Record<string, Record<string, number>> = {};
    metrics.forEach(metric => {
      if (!latest[metric.service_name]) {
        latest[metric.service_name] = {};
      }
      if (!latest[metric.service_name][metric.metric_type]) {
        latest[metric.service_name][metric.metric_type] = metric.value;
      }
    });
    return latest;
  }, [metrics]);

  const chartData = useMemo(() => {
    const serviceMetrics: Record<string, Array<{ timestamp: string; cpu?: number; memory?: number; disk?: number }>> = {};

    metrics.forEach(metric => {
      if (!serviceMetrics[metric.service_name]) {
        serviceMetrics[metric.service_name] = [];
      }

      let existing = serviceMetrics[metric.service_name].find(
        m => m.timestamp === metric.timestamp
      );

      if (!existing) {
        existing = { timestamp: metric.timestamp };
        serviceMetrics[metric.service_name].push(existing);
      }

      if (metric.metric_type === 'cpu') existing.cpu = metric.value;
      if (metric.metric_type === 'memory') existing.memory = metric.value;
      if (metric.metric_type === 'disk') existing.disk = metric.value;
    });

    Object.keys(serviceMetrics).forEach(service => {
      serviceMetrics[service] = serviceMetrics[service]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .slice(-20);
    });

    return serviceMetrics;
  }, [metrics]);

  const avgCpu = useMemo(() => {
    const cpuMetrics = metrics.filter(m => m.metric_type === 'cpu').slice(0, 5);
    return cpuMetrics.length > 0
      ? cpuMetrics.reduce((sum, m) => sum + m.value, 0) / cpuMetrics.length
      : 0;
  }, [metrics]);

  const avgMemory = useMemo(() => {
    const memMetrics = metrics.filter(m => m.metric_type === 'memory').slice(0, 5);
    return memMetrics.length > 0
      ? memMetrics.reduce((sum, m) => sum + m.value, 0) / memMetrics.length
      : 0;
  }, [metrics]);

  const activeAlertCount = alerts.filter(a => a.status === 'active').length;
  const totalAnomalies = anomalies.length;
  const successfulRemediations = remediations.filter(r => r.status === 'success').length;

  const getCpuStatus = (cpu: number) => {
    if (cpu >= 90) return 'critical';
    if (cpu >= 75) return 'warning';
    return 'normal';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">AutoOps</h1>
                <p className="text-sm text-slate-600">AI-Powered Operations Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <RefreshCw className="w-4 h-4" />
                <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Average CPU Usage"
            value={avgCpu.toFixed(1)}
            unit="%"
            trend={-2.3}
            status={getCpuStatus(avgCpu)}
            icon={<Server className="w-4 h-4" />}
          />
          <MetricCard
            title="Average Memory"
            value={avgMemory.toFixed(1)}
            unit="%"
            trend={1.8}
            status="normal"
            icon={<Activity className="w-4 h-4" />}
          />
          <MetricCard
            title="Active Alerts"
            value={activeAlertCount}
            status={activeAlertCount > 2 ? 'critical' : activeAlertCount > 0 ? 'warning' : 'normal'}
            icon={<AlertCircle className="w-4 h-4" />}
          />
          <MetricCard
            title="Anomalies Detected"
            value={totalAnomalies}
            status={totalAnomalies > 2 ? 'warning' : 'normal'}
            icon={<Brain className="w-4 h-4" />}
          />
        </div>

        <ServiceHealthPanel services={services} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricsChart
            data={chartData['api-gateway'] || []}
            title="API Gateway - Real-time Metrics"
            height={280}
          />
          <MetricsChart
            data={chartData['database'] || []}
            title="Database - Real-time Metrics"
            height={280}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertsPanel alerts={alerts} />
          <AnomaliesPanel anomalies={anomalies} />
        </div>

        <RemediationLog remediations={remediations} />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <RotateCw className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">System Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium mb-1">Monitoring</p>
              <p className="text-2xl font-bold text-blue-900">Active</p>
              <p className="text-xs text-blue-700 mt-1">Prometheus + Grafana</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg border border-violet-200">
              <p className="text-sm text-violet-600 font-medium mb-1">AI Detection</p>
              <p className="text-2xl font-bold text-violet-900">Isolation Forest</p>
              <p className="text-xs text-violet-700 mt-1">Real-time anomaly detection</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-600 font-medium mb-1">Auto-Remediation</p>
              <p className="text-2xl font-bold text-emerald-900">{successfulRemediations}/{remediations.length}</p>
              <p className="text-xs text-emerald-700 mt-1">Success rate: {((successfulRemediations/remediations.length)*100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
