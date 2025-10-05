import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Metric {
  id: string;
  service_name: string;
  metric_type: string;
  value: number;
  unit: string;
  timestamp: string;
  labels: Record<string, unknown>;
  created_at: string;
}

export interface Alert {
  id: string;
  service_name: string;
  alert_type: string;
  metric_type: string;
  threshold: number;
  current_value: number;
  message: string;
  status: string;
  triggered_at: string;
  resolved_at: string | null;
  created_at: string;
}

export interface Anomaly {
  id: string;
  service_name: string;
  metric_type: string;
  anomaly_score: number;
  expected_value: number;
  actual_value: number;
  deviation: number;
  detection_method: string;
  confidence: number;
  metadata: Record<string, unknown>;
  detected_at: string;
  created_at: string;
}

export interface Remediation {
  id: string;
  service_name: string;
  trigger_type: string;
  trigger_id: string | null;
  action_type: string;
  action_details: Record<string, unknown>;
  status: string;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface ServiceHealth {
  id: string;
  service_name: string;
  status: string;
  uptime_percentage: number;
  last_health_check: string | null;
  metadata: Record<string, unknown>;
  updated_at: string;
  created_at: string;
}
