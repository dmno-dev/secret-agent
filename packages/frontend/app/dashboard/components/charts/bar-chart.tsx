'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface BarData {
  name: string;
  [key: string]: string | number; // Allow any additional data keys
}

interface BarChartProps {
  data: BarData[];
  title: string;
  description?: string;
  bars: {
    key: string;
    color: string;
  }[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-green-400/30 rounded px-3 py-2">
        <p className="text-green-400/70 text-sm">{label}</p>
        <p className="text-green-400 font-mono text-sm">{payload[0].value.toFixed(6)} ETH</p>
      </div>
    );
  }
  return null;
};

export function CustomBarChart({ data, title, description, bars }: BarChartProps) {
  return (
    <div className="flex flex-col p-3 border border-gray-200 dark:border-green-400/30 rounded h-full">
      <div className="text-sm text-gray-500 dark:text-green-400/70">{title}</div>
      {description && (
        <div className="text-xs text-gray-500 dark:text-green-400/50">{description}</div>
      )}
      <div className="flex-1 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#22c55e', opacity: 0.7, fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#22c55e', opacity: 0.7, fontSize: 12 }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            {bars.map((bar) => (
              <Bar key={bar.key} dataKey={bar.key} fill={bar.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
