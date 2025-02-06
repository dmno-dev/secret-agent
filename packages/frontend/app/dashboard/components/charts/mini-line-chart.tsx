'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface UsagePoint {
  date: string;
  value: number;
}

interface MiniLineChartProps {
  data: UsagePoint[];
}

export function MiniLineChart({ data }: MiniLineChartProps) {
  return (
    <div className="w-24 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
