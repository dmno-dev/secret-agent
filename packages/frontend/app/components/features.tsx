'use client';

import { Cctv, Coins, EyeOff, KeyRound, LucideIcon, RefreshCwOff, Zap } from 'lucide-react';
import { useScrambleEffect } from '../../hooks/use-scramble-effect';

const features = [
  {
    icon: EyeOff,
    title: 'Secure Proxy Service',
    description: 'Hide API keys from agents',
  },
  {
    icon: KeyRound,
    title: 'Keyless LLM Access',
    description: 'Toggle providers & settings on the fly',
  },
  {
    icon: Zap,
    title: 'Metered Usage',
    description: 'Pay-as-you-go with crypto',
  },
  {
    icon: Coins,
    title: 'Agent Self-Funded LLM Usage',
    description: 'Autonomous agent capabilities',
  },
  {
    icon: RefreshCwOff,
    title: 'Instant Access Revocation',
    description: 'Deadman switch for access control',
  },
  {
    icon: Cctv,
    title: 'Usage Tracking & Logs',
    description: 'Monitor activity and control budgets',
  },
];

function FeatureItem({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  const { scrambledText: scrambledTitle, startScramble: startTitleScramble } =
    useScrambleEffect(title);
  const { scrambledText: scrambledDescription, startScramble: startDescriptionScramble } =
    useScrambleEffect(description);

  return (
    <div
      className="flex items-start space-x-3 p-2 rounded transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-700"
      onMouseEnter={() => {
        startTitleScramble();
        startDescriptionScramble();
      }}
    >
      <Icon className="w-6 h-6 mt-1 text-green-400 flex-shrink-0" />
      <div className="flex-1 overflow-hidden">
        <h3 className="font-bold truncate">{scrambledTitle}</h3>
        <p className="dark:text-gray-300 text-gray-600 text-sm md:text-base truncate">
          {scrambledDescription}
        </p>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section className="mb-8">
      <h2 className="">ls features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <FeatureItem key={index} {...feature} />
        ))}
      </div>
    </section>
  );
}
