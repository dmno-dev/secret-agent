import { Project } from "@/lib/types";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { AgentsList } from "./agents-list";
import { ApiCallStats } from "./api-call-stats";
import { BalanceDisplay } from "./balance-display";
import { ConfigItems } from "./config-items";
import { FundProject } from "./fund-project";

interface ProjectDetailsProps {
  project: Project;
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(project.id);
    toast.success("Address copied to clipboard");
  };

  const formattedAddress = `${project.id.slice(0, 6)}...${project.id.slice(
    -4
  )}`;

  return (
    <div className="flex-1 border border-green-400 rounded p-4 bg-white dark:bg-black">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-mono mb-2">{project.name}</h2>
          <div className="text-sm text-muted-foreground font-mono space-x-2">
            <span>Address: {formattedAddress}</span>
            <button
              onClick={handleCopyAddress}
              className="hover:text-primary transition-colors"
              title="Copy address"
            >
              <Copy className="w-3.5 h-3.5 inline" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <BalanceDisplay projectId={project.id} />
          <FundProject projectId={project.id} />
        </div>

        <ApiCallStats projectId={project.id} />
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
