import { useState, useEffect } from 'react';
import { supabase, Metric, Alert, Anomaly, Remediation, ServiceHealth } from '../lib/supabase';

export function useRealtimeData() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [remediations, setRemediations] = useState<Remediation[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
    subscribeToChanges();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [metricsRes, alertsRes, anomaliesRes, remediationsRes, servicesRes] = await Promise.all([
        supabase
          .from('metrics')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100),
        supabase
          .from('alerts')
          .select('*')
          .order('triggered_at', { ascending: false })
          .limit(20),
        supabase
          .from('anomalies')
          .select('*')
          .order('detected_at', { ascending: false })
          .limit(20),
        supabase
          .from('remediations')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(20),
        supabase
          .from('service_health')
          .select('*')
          .order('service_name')
      ]);

      if (metricsRes.data) setMetrics(metricsRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (anomaliesRes.data) setAnomalies(anomaliesRes.data);
      if (remediationsRes.data) setRemediations(remediationsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    const metricsChannel = supabase
      .channel('metrics-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'metrics' }, (payload) => {
        setMetrics((prev) => [payload.new as Metric, ...prev].slice(0, 100));
      })
      .subscribe();

    const alertsChannel = supabase
      .channel('alerts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAlerts((prev) => [payload.new as Alert, ...prev].slice(0, 20));
        } else if (payload.eventType === 'UPDATE') {
          setAlerts((prev) =>
            prev.map((alert) => (alert.id === payload.new.id ? (payload.new as Alert) : alert))
          );
        }
      })
      .subscribe();

    const anomaliesChannel = supabase
      .channel('anomalies-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'anomalies' }, (payload) => {
        setAnomalies((prev) => [payload.new as Anomaly, ...prev].slice(0, 20));
      })
      .subscribe();

    const remediationsChannel = supabase
      .channel('remediations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'remediations' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setRemediations((prev) => [payload.new as Remediation, ...prev].slice(0, 20));
        } else if (payload.eventType === 'UPDATE') {
          setRemediations((prev) =>
            prev.map((rem) => (rem.id === payload.new.id ? (payload.new as Remediation) : rem))
          );
        }
      })
      .subscribe();

    const servicesChannel = supabase
      .channel('services-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_health' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setServices((prev) => [...prev, payload.new as ServiceHealth]);
        } else if (payload.eventType === 'UPDATE') {
          setServices((prev) =>
            prev.map((svc) => (svc.id === payload.new.id ? (payload.new as ServiceHealth) : svc))
          );
        }
      })
      .subscribe();

    return () => {
      metricsChannel.unsubscribe();
      alertsChannel.unsubscribe();
      anomaliesChannel.unsubscribe();
      remediationsChannel.unsubscribe();
      servicesChannel.unsubscribe();
    };
  };

  return {
    metrics,
    alerts,
    anomalies,
    remediations,
    services,
    loading
  };
}
