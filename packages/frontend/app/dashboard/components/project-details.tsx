import { Wallet } from "lucide-react";
import { AgentsList } from "./agents-list";
import { ApiCallStats } from "./api-call-stats";
import { BalanceDisplay } from "./balance-display";
import { ConfigItems } from "./config-items";
import { FundProject } from "./fund-project";

export function ProjectDetails({
  project,
}: {
  project: { name: string; id: string; address: string };
}) {
  return (
    <div className="flex-1 border border-gray-300 dark:border-green-400 rounded p-4 bg-white dark:bg-black">
      <h2 className="text-2xl font-bold mb-4 glow-text">{project.name}</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Wallet size={20} className="text-gray-700 dark:text-green-400" />
          <span>Project ID: {project.id}</span>
        </div>
        <div className="flex items-center justify-between">
          <BalanceDisplay projectAddress={project.address} />
          <FundProject projectAddress={project.address} />
        </div>
        <ApiCallStats />
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2 glow-text">Policy Rules</h3>
        <ul className="list-disc list-inside text-gray-700 dark:text-green-400">
          <li>Max daily spend: 0.1 ETH</li>
          <li>Allowed APIs: OpenAI, Anthropic</li>
        </ul>
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4 glow-text">Configuration</h3>
        <ConfigItems />
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4 glow-text">Agents</h3>
        <AgentsList />
      </div>
    </div>
  );
}
