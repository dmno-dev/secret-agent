import NumberFlow from "@number-flow/react";
import { Shield } from "lucide-react";
import { formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";

const balanceFormat = {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
  useGrouping: true,
} as const;

function BalanceSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      <div className="h-[18px] w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
    </div>
  );
}

export function BalanceDisplay({ projectAddress }: { projectAddress: string }) {
  const { address: connectedAddress } = useAccount();

  // Fetch connected wallet balance with polling
  const { data: walletBalance, isLoading: isWalletBalanceLoading } = useBalance(
    {
      address: connectedAddress,
      query: {
        refetchInterval: 5000,
      },
    }
  );

  // Fetch project wallet balance with polling
  const { data: projectBalance, isLoading: isProjectBalanceLoading } =
    useBalance({
      address: projectAddress as `0x${string}`,
      query: {
        refetchInterval: 5000,
      },
    });

  const isLoading = isWalletBalanceLoading || isProjectBalanceLoading;

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Shield size={20} className="text-gray-700 dark:text-green-400" />
        <BalanceSkeleton />
      </div>
    );
  }

  const projectBalanceValue = projectBalance
    ? parseFloat(formatEther(projectBalance.value))
    : 0;
  const walletBalanceValue = walletBalance
    ? parseFloat(formatEther(walletBalance.value))
    : 0;

  return (
    <div className="flex items-center space-x-2">
      <Shield size={20} className="text-gray-700 dark:text-green-400" />
      <div className="flex flex-col">
        <span>
          Project Balance:{" "}
          <NumberFlow
            value={projectBalanceValue}
            format={balanceFormat}
            className="font-semibold tabular-nums slashed-zero"
          />{" "}
          {projectBalance?.symbol}
        </span>
        <span className="text-sm text-gray-500">
          Your Balance:{" "}
          <NumberFlow
            value={walletBalanceValue}
            format={balanceFormat}
            className="font-semibold tabular-nums slashed-zero"
          />{" "}
          {walletBalance?.symbol}
        </span>
      </div>
    </div>
  );
}
