'use client';

import { useProjectDetails } from '@/lib/hooks/use-project-details';
import { Project } from '@/lib/types';
import { Code, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { AgentsList } from './agents-list';
import { ApiCallStats } from './api-call-stats';
import { BalanceDisplay } from './balance-display';
import { ConfigItems } from './config-items';
import { FundProject } from './fund-project';
import { CodeBlock } from '@/app/components/code-block';

interface ProjectDetailsProps {
  project: Project;
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
  const { data, isLoading, error } = useProjectDetails(project.id);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(project.id);
    toast.success('Address copied to clipboard');
  };

  const formattedAddress = `${project.id.slice(0, 6)}...${project.id.slice(-4)}`;

  const integrationCode = `import SecretAgent from 'secretagent.sh';
// ... set up wallet/provider

await SecretAgent.init({
  projectId: '${project.id}',
  agentLabel: 'agent description',  // use different labels if project has multiple agents
  agentId: wallet.address,
  signMessage: (msg) => wallet.signMessage(msg),
});
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(integrationCode);
    toast.success('Code copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="flex-1 rounded-lg p-4 bg-black/5 dark:bg-white/5 animate-pulse">
        <div className="space-y-6">
          <div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-4 w-36 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>

          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>

        <div className="mt-6">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
          <div className="space-y-2">
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>

        <div className="mt-6">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>

        <div className="mt-6">
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 border border-red-400 rounded p-4 bg-white dark:bg-black">
        <div className="text-red-500">Failed to load project details</div>
      </div>
    );
  }

  return (
    <div className="flex-1 rounded-lg p-4 bg-black/5 dark:bg-white/5">
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

        {!!data?.agents?.length && (
          <div>
            <h3 className="text-xl font-bold mb-4">Usage & Spend</h3>
            <ApiCallStats projectId={project.id} />
          </div>
        )}

        <div>
          <h3 className="text-xl font-bold mb-4">Configuration</h3>
          <ConfigItems projectId={project.id} configItems={data?.configItems || []} />
        </div>

        {!data?.agents?.length && (
          <div className="relative">
            <h3 className="text-xl font-bold mb-4 terminal-cursor">Connect your first agent</h3>

            <button
              onClick={handleCopyCode}
              className="px-2 py-1 border text-sm border-gray-300 dark:border-green-400 rounded-sm text-gray-500 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed absolute right-0 w-auto mr-4 mt-4"
            >
              <Code className="w-4 h-4 mr-3" />
              Copy integration code
            </button>
            <CodeBlock code={integrationCode} />

            <p className="mt-4">
              As agents try to connect, you will be able to approve access here.
            </p>
          </div>
        )}

        {!!data?.agents?.length && (
          <div>
            <h3 className="text-xl font-bold mb-4">Agents</h3>
            <AgentsList agents={data?.agents || []} projectId={project.id} />
          </div>
        )}
      </div>
    </div>
  );
}
