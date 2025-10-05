import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MetricsChartProps {
  data: Array<{
    timestamp: string;
    cpu?: number;
    memory?: number;
    disk?: number;
  }>;
  title: string;
  height?: number;
}

export function MetricsChart({ data, title, height = 300 }: MetricsChartProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelFormatter={formatTime}
          />
          <Legend />
          {data[0]?.cpu !== undefined && (
            <Line
              type="monotone"
              dataKey="cpu"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="CPU %"
            />
          )}
          {data[0]?.memory !== undefined && (
            <Line
              type="monotone"
              dataKey="memory"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              name="Memory %"
            />
          )}
          {data[0]?.disk !== undefined && (
            <Line
              type="monotone"
              dataKey="disk"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Disk %"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
