import NumberFlow from '@number-flow/react';
import { AlertTriangle } from 'lucide-react';
import { formatEther } from 'viem';
import { useBalance } from 'wagmi';

const LOW_BALANCE_THRESHOLD = 0.1; // ETH

const balanceFormat = {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
  useGrouping: true,
} as const;

type ProjectListItemProps = {
  project: {
    id: string;
    name: string;
    address: string;
  };
  onClick: () => void;
};

export function ProjectListItem({ project, onClick }: ProjectListItemProps) {
  // Fetch project wallet balance with polling
  const { data: projectBalance, isLoading } = useBalance({
    address: project.address as `0x${string}`,
    query: {
      refetchInterval: 5000,
    },
  });

  const balanceValue = projectBalance ? parseFloat(formatEther(projectBalance.value)) : 0;
  const isLowBalance = balanceValue < LOW_BALANCE_THRESHOLD;

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 border border-gray-200 dark:border-gray-800 rounded hover:border-green-400 dark:hover:border-green-400 transition-colors"
    >
      <div className="flex flex-col">
        <div className="font-medium">{project.name}</div>
        <div className="flex items-center gap-1 mt-1">
          {isLowBalance && !isLoading && (
            <div title="Low balance">
              <AlertTriangle size={14} className="text-yellow-500" />
            </div>
          )}
          {isLoading ? (
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          ) : (
            <span
              className={`text-sm flex items-center gap-1 ${
                isLowBalance ? 'text-yellow-500' : 'text-gray-500'
              }`}
            >
              <NumberFlow
                value={balanceValue}
                format={balanceFormat}
                className="font-semibold tabular-nums slashed-zero"
              />{' '}
              {projectBalance?.symbol}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
