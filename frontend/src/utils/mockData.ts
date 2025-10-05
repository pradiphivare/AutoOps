import { Metric, Alert, Anomaly, Remediation, ServiceHealth } from '../lib/supabase';

export function generateMockMetrics(count: number = 20): Metric[] {
  const services = ['web-server', 'api-gateway', 'database', 'cache-service', 'worker-queue'];
  const metricTypes = ['cpu', 'memory', 'disk'];
  const metrics: Metric[] = [];

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(Date.now() - (count - i) * 60000);
    services.forEach(service => {
      metricTypes.forEach(type => {
        let value = 0;
        if (type === 'cpu') {
          value = Math.random() * 40 + 30 + Math.sin(i * 0.5) * 20;
          if (service === 'api-gateway' && i > count - 5) value = 92 + Math.random() * 5;
        } else if (type === 'memory') {
          value = Math.random() * 30 + 50 + Math.cos(i * 0.3) * 15;
        } else {
          value = Math.random() * 20 + 60;
        }

        metrics.push({
          id: `${service}-${type}-${i}`,
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
  }

  return metrics;
}

export function generateMockAlerts(): Alert[] {
  return [
    {
      id: 'alert-1',
      service_name: 'api-gateway',
      alert_type: 'critical',
      metric_type: 'cpu',
      threshold: 90,
      current_value: 94.5,
      message: 'CPU usage critically high - immediate attention required',
      status: 'active',
      triggered_at: new Date(Date.now() - 5 * 60000).toISOString(),
      resolved_at: null,
      created_at: new Date(Date.now() - 5 * 60000).toISOString()
    },
    {
      id: 'alert-2',
      service_name: 'database',
      alert_type: 'warning',
      metric_type: 'memory',
      threshold: 80,
      current_value: 85.2,
      message: 'Memory usage approaching threshold',
      status: 'acknowledged',
      triggered_at: new Date(Date.now() - 15 * 60000).toISOString(),
      resolved_at: null,
      created_at: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      id: 'alert-3',
      service_name: 'web-server',
      alert_type: 'warning',
      metric_type: 'disk',
      threshold: 85,
      current_value: 87.8,
      message: 'Disk usage high - consider cleanup',
      status: 'active',
      triggered_at: new Date(Date.now() - 30 * 60000).toISOString(),
      resolved_at: null,
      created_at: new Date(Date.now() - 30 * 60000).toISOString()
    }
  ];
}

export function generateMockAnomalies(): Anomaly[] {
  return [
    {
      id: 'anomaly-1',
      service_name: 'api-gateway',
      metric_type: 'cpu',
      anomaly_score: -1,
      expected_value: 45.3,
      actual_value: 94.5,
      deviation: 108.6,
      detection_method: 'isolation_forest',
      confidence: 95.8,
      metadata: { algorithm_version: '2.1.0', training_samples: 10000 },
      detected_at: new Date(Date.now() - 3 * 60000).toISOString(),
      created_at: new Date(Date.now() - 3 * 60000).toISOString()
    },
    {
      id: 'anomaly-2',
      service_name: 'database',
      metric_type: 'memory',
      anomaly_score: -0.8,
      expected_value: 62.5,
      actual_value: 85.2,
      deviation: 36.3,
      detection_method: 'isolation_forest',
      confidence: 87.4,
      metadata: { algorithm_version: '2.1.0', training_samples: 10000 },
      detected_at: new Date(Date.now() - 10 * 60000).toISOString(),
      created_at: new Date(Date.now() - 10 * 60000).toISOString()
    },
    {
      id: 'anomaly-3',
      service_name: 'worker-queue',
      metric_type: 'cpu',
      anomaly_score: -0.7,
      expected_value: 35.2,
      actual_value: 68.9,
      deviation: 95.7,
      detection_method: 'isolation_forest',
      confidence: 82.1,
      metadata: { algorithm_version: '2.1.0', training_samples: 10000 },
      detected_at: new Date(Date.now() - 20 * 60000).toISOString(),
      created_at: new Date(Date.now() - 20 * 60000).toISOString()
    }
  ];
}

export function generateMockRemediations(): Remediation[] {
  return [
    {
      id: 'remediation-1',
      service_name: 'api-gateway',
      trigger_type: 'alert',
      trigger_id: 'alert-1',
      action_type: 'restart_pod',
      action_details: {
        pod_name: 'api-gateway-7d9f4b8c-xm4p2',
        namespace: 'production',
        previous_uptime: '3d 12h 45m'
      },
      status: 'in_progress',
      error_message: null,
      started_at: new Date(Date.now() - 2 * 60000).toISOString(),
      completed_at: null,
      created_at: new Date(Date.now() - 2 * 60000).toISOString()
    },
    {
      id: 'remediation-2',
      service_name: 'worker-queue',
      trigger_type: 'anomaly',
      trigger_id: 'anomaly-3',
      action_type: 'restart_pod',
      action_details: {
        pod_name: 'worker-queue-5b8c3a1d-zq7k9',
        namespace: 'production',
        previous_uptime: '1d 8h 23m'
      },
      status: 'success',
      error_message: null,
      started_at: new Date(Date.now() - 18 * 60000).toISOString(),
      completed_at: new Date(Date.now() - 17 * 60000).toISOString(),
      created_at: new Date(Date.now() - 18 * 60000).toISOString()
    },
    {
      id: 'remediation-3',
      service_name: 'cache-service',
      trigger_type: 'manual',
      trigger_id: null,
      action_type: 'scale_up',
      action_details: {
        previous_replicas: 2,
        new_replicas: 4,
        namespace: 'production'
      },
      status: 'success',
      error_message: null,
      started_at: new Date(Date.now() - 45 * 60000).toISOString(),
      completed_at: new Date(Date.now() - 44 * 60000).toISOString(),
      created_at: new Date(Date.now() - 45 * 60000).toISOString()
    },
    {
      id: 'remediation-4',
      service_name: 'database',
      trigger_type: 'alert',
      trigger_id: 'alert-2',
      action_type: 'restart_pod',
      action_details: {
        pod_name: 'database-primary-0',
        namespace: 'production',
        previous_uptime: '7d 14h 32m'
      },
      status: 'failed',
      error_message: 'Pod restart failed: timeout waiting for pod to become ready',
      started_at: new Date(Date.now() - 60 * 60000).toISOString(),
      completed_at: new Date(Date.now() - 58 * 60000).toISOString(),
      created_at: new Date(Date.now() - 60 * 60000).toISOString()
    }
  ];
}

export function generateMockServices(): ServiceHealth[] {
  return [
    {
      id: 'service-1',
      service_name: 'api-gateway',
      status: 'critical',
      uptime_percentage: 94.52,
      last_health_check: new Date(Date.now() - 30000).toISOString(),
      metadata: { version: '2.4.1', replicas: 3 },
      updated_at: new Date(Date.now() - 30000).toISOString(),
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString()
    },
    {
      id: 'service-2',
      service_name: 'web-server',
      status: 'healthy',
      uptime_percentage: 99.87,
      last_health_check: new Date(Date.now() - 45000).toISOString(),
      metadata: { version: '1.8.3', replicas: 5 },
      updated_at: new Date(Date.now() - 45000).toISOString(),
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString()
    },
    {
      id: 'service-3',
      service_name: 'database',
      status: 'degraded',
      uptime_percentage: 97.23,
      last_health_check: new Date(Date.now() - 60000).toISOString(),
      metadata: { version: '14.2', replicas: 1 },
      updated_at: new Date(Date.now() - 60000).toISOString(),
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString()
    },
    {
      id: 'service-4',
      service_name: 'cache-service',
      status: 'healthy',
      uptime_percentage: 99.95,
      last_health_check: new Date(Date.now() - 20000).toISOString(),
      metadata: { version: '7.0.5', replicas: 4 },
      updated_at: new Date(Date.now() - 20000).toISOString(),
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString()
    },
    {
      id: 'service-5',
      service_name: 'worker-queue',
      status: 'healthy',
      uptime_percentage: 98.76,
      last_health_check: new Date(Date.now() - 40000).toISOString(),
      metadata: { version: '3.2.1', replicas: 2 },
      updated_at: new Date(Date.now() - 40000).toISOString(),
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString()
    }
  ];
}
