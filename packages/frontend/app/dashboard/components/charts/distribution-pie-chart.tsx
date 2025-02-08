'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface DistributionData {
  name: string;
  value: number;
}

interface DistributionPieChartProps {
  data: DistributionData[];
  title: string;
  description?: string;
}

const COLORS = ['#000000', '#22c55e']; // Black for spent, green for remaining balance

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-green-400/30 rounded px-3 py-2">
        <p className="text-green-400/70 text-sm">{payload[0].name}</p>
        <p className="text-green-400 font-mono text-sm">{payload[0].value.toFixed(6)} ETH</p>
      </div>
    );
  }
  return null;
};

export function DistributionPieChart({ data, title, description }: DistributionPieChartProps) {
  return (
    <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-green-400/30 rounded">
      <div className="space-y-0.5 flex-1">
        <div className="text-sm text-gray-500 dark:text-green-400/70">{title}</div>
        {description && (
          <div className="text-xs text-gray-500 dark:text-green-400/50">{description}</div>
        )}
        <div className="h-[133px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={53}
                paddingAngle={0}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke={index === 0 ? '#4b5563' : 'none'}
                    strokeWidth={index === 0 ? 1 : 0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
