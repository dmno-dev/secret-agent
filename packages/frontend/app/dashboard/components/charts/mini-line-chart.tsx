'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface UsagePoint {
  date: string;
  value: number;
}

interface MiniLineChartProps {
  data?: UsagePoint[];
}

export function MiniLineChart({ data }: MiniLineChartProps) {
  const defaultData: UsagePoint[] = [
    { date: '2024-01-01', value: 0 },
    { date: '2024-01-02', value: 2 },
    { date: '2024-01-03', value: 1 },
    { date: '2024-01-04', value: 3 },
    { date: '2024-01-05', value: 2 },
    { date: '2024-01-06', value: 4 },
    { date: '2024-01-07', value: 3 },
  ];

  const chartData = data || defaultData;

  return (
    <div className="w-24 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
