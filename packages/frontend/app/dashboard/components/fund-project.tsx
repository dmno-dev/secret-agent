import type { LifecycleStatus } from '@coinbase/onchainkit/transaction';
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { parseEther } from 'viem';
import { baseSepolia } from 'wagmi/chains';

type TransactionCall = {
  to: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
};

export function FundProject({ projectId }: { projectId: string }) {
  const [amount, setAmount] = useState('');

  const handleOnStatus = useCallback(
    (status: LifecycleStatus) => {
      // Clear any existing loading toasts
      toast.dismiss();

      switch (status.statusName) {
        case 'transactionIdle':
          toast.loading('Initializing transaction...');
          break;
        case 'buildingTransaction':
          toast.loading('Preparing transaction...');
          break;
        case 'transactionPending':
          toast.loading('Transaction in progress...');
          break;
        case 'transactionLegacyExecuted':
          toast.success('Transaction executed!');
          break;
        case 'success':
          toast.success('Successfully funded project!', {
            description: `Added ${amount} ETH to the project`,
          });
          // Reset amount after successful transaction
          setAmount('');
          break;
        case 'error':
          toast.error('Transaction failed', {
            description: status.statusData.message || 'Please try again',
          });
          break;
        default:
          break;
      }
    },
    [amount]
  );

  // Transaction call configuration
  const calls: TransactionCall[] = [
    {
      to: projectId as `0x${string}`,
      value: amount ? parseEther(amount) : BigInt(0),
      data: '0x',
    },
  ];

  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="relative">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0000"
          step="0.0001"
          min="0"
          className="w-32 px-3 py-2 bg-transparent border border-gray-300 dark:border-green-400 rounded font-semibold tabular-nums slashed-zero focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">ETH</div>
      </div>

      <motion.div
        whileHover={{ scale: 1.02, width: 'auto' }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <Transaction
          chainId={baseSepolia.id}
          calls={calls}
          onStatus={handleOnStatus}
          isSponsored
          capabilities={{
            paymasterService: {
              url: DMNO_PUBLIC_CONFIG.PAYMASTER_API_URL,
            },
          }}
        >
          <TransactionButton
            className="px-4 py-2 bg-green-500 text-white rounded font-semibold hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-36"
            text="Fund"
            successOverride={{
              text: 'Receipt',
            }}
          />

          {/* TODO: Add paymaster URL https://onchainkit.xyz/transaction/transaction#sponsor-with-paymaster-capabilities */}
          {/* <TransactionSponsor /> */}
        </Transaction>
      </motion.div>
    </div>
  );
}
