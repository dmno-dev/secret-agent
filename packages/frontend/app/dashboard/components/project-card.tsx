import { useScrambleEffect } from '@/hooks/use-scramble-effect';
import { Project } from '@/lib/types';
import NumberFlow from '@number-flow/react';
import { ArrowRight, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { formatEther } from 'viem';
import { useBalance } from 'wagmi';

const balanceFormat = {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
  useGrouping: true,
} as const;

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { scrambledText, startScramble } = useScrambleEffect(project.name);
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: project.id as `0x${string}`,
    query: {
      refetchInterval: 5000,
    },
  });

  const formattedAddress = `${project.id.slice(0, 6)}...${project.id.slice(-4)}`;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors group"
      onClick={onClick}
      onMouseEnter={startScramble}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-mono font-medium">{scrambledText}</h3>
          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="text-sm text-muted-foreground font-mono">{formattedAddress}</div>

        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          {isBalanceLoading ? (
            <div className="flex items-center text-sm">
              <div className="w-16 h-5 bg-black/10 dark:bg-white/10 rounded animate-pulse" />
              <div className="ml-1 w-8 h-5 bg-black/10 dark:bg-white/10 rounded animate-pulse" />
            </div>
          ) : (
            balance && (
              <span className="text-sm">
                <NumberFlow
                  value={parseFloat(formatEther(balance.value))}
                  format={balanceFormat}
                  className="font-medium tabular-nums slashed-zero"
                />{' '}
                {balance.symbol}
              </span>
            )
          )}
        </div>
      </div>
    </motion.button>
  );
}
