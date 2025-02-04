import {
  BarChart,
  Coins,
  Key,
  Lock,
  LucideIcon,
  Shield,
  Zap,
} from "lucide-react";
import { useScrambleEffect } from "../../hooks/use-scramble-effect";

const features = [
  {
    icon: Shield,
    title: "Proxy Service",
    description: "Hide API keys from agents",
  },
  {
    icon: Zap,
    title: "Metered Usage",
    description: "Pay-as-you-go with crypto",
  },
  {
    icon: Key,
    title: "Instant Revocation",
    description: "Deadman switch for access control",
  },
  {
    icon: Coins,
    title: "Self-Funding",
    description: "Autonomous agent capabilities",
  },
  {
    icon: BarChart,
    title: "Usage Tracking",
    description: "Monitor and control budgets",
  },
  { icon: Lock, title: "Key Rotation", description: "Automatic and seamless" },
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
  const {
    scrambledText: scrambledDescription,
    startScramble: startDescriptionScramble,
  } = useScrambleEffect(description);

  return (
    <div
      className="flex items-start space-x-3 p-2 rounded transition-colors duration-200 hover:bg-gray-800"
      onMouseEnter={() => {
        startTitleScramble();
        startDescriptionScramble();
      }}
    >
      <Icon className="w-6 h-6 mt-1 text-green-400" />
      <div>
        <h3 className="font-bold">{scrambledTitle}</h3>
        <p className="text-gray-400">{scrambledDescription}</p>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">$ ls features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <FeatureItem key={index} {...feature} />
        ))}
      </div>
    </section>
  );
}
