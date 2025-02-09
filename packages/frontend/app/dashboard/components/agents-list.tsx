'use client';

import {
  useCreateAgent,
  useDeleteAgent,
  useUpdateAgentStatus,
} from '@/lib/hooks/use-project-details';
import { Agent } from '@/lib/types';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AddAgentModal } from './add-agent-modal';
import { AgentListItem } from './agent-list-item';

interface AgentsListProps {
  agents: Agent[];
  projectId: string;
}

export function AgentsList({ agents, projectId }: AgentsListProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const updateAgentStatus = useUpdateAgentStatus();
  const createAgent = useCreateAgent();
  const deleteAgent = useDeleteAgent();

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const handleAddAgent = async (data: { name: string; walletAddress: string }) => {
    try {
      await createAgent.mutateAsync({
        projectId,
        label: data.name,
        walletAddress: data.walletAddress,
      });
      toast.success('Agent created successfully');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error('Failed to create agent');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      await deleteAgent.mutateAsync({
        projectId,
        agentId,
      });
      toast.success('Agent deleted successfully');
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  const handleUpdateStatus = async (agentId: string, status: Agent['status']) => {
    try {
      await updateAgentStatus.mutateAsync({
        projectId,
        agentId,
        status,
      });
      toast.success('Agent status updated successfully');
    } catch (error) {
      console.error('Error updating agent status:', error);
      toast.error('Failed to update agent status');
    }
  };

  const isLoading = createAgent.isPending || deleteAgent.isPending || updateAgentStatus.isPending;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {agents.map((agent) => (
          <AgentListItem
            key={agent.id}
            agent={agent}
            isExpanded={expandedItem === agent.id}
            onToggleExpand={() => toggleExpand(agent.id)}
            onUpdateStatus={(status) => handleUpdateStatus(agent.id, status)}
            onDelete={() => handleDeleteAgent(agent.id)}
            isLoading={isLoading}
          />
        ))}
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        disabled={isLoading}
        className="w-full p-2 border border-dashed border-gray-300 dark:border-green-400 md text-gray-500 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        <span>Add new agent</span>
      </button>

      {showAddModal && (
        <AddAgentModal onClose={() => setShowAddModal(false)} onSubmit={handleAddAgent} />
      )}
    </div>
  );
}
