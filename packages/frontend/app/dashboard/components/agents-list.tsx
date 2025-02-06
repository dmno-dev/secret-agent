'use client';

import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AddAgentModal, type NewAgentFormData } from './add-agent-modal';

interface UsageItem {
  id: string;
  type: string;
  timestamp: string;
}

interface Agent {
  id: string; // wallet address
  name: string;
  createdAt: string;
  recentUsage: UsageItem[];
}

export function AgentsList() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '0x1234567890abcdef1234567890abcdef12345678',
      name: 'Support Agent',
      createdAt: '2024-03-15',
      recentUsage: [
        { id: '1', type: 'OPENAI_API_KEY', timestamp: '2024-03-20 14:30:00' },
        { id: '2', type: 'ANTHROPIC_API_KEY', timestamp: '2024-03-20 14:25:00' },
      ],
    },
  ]);

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const handleAddAgent = (data: NewAgentFormData) => {
    // TODO: Add API call to create new agent
    const newAgent: Agent = {
      id: data.walletAddress,
      name: data.name,
      createdAt: new Date().toISOString().split('T')[0],
      recentUsage: [],
    };

    setAgents((prev) => [...prev, newAgent]);
    setShowAddModal(false);
  };

  const handleDeleteAgent = (agentId: string) => {
    // TODO: Add API call to delete agent
    setAgents((prev) => prev.filter((agent) => agent.id !== agentId));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="border border-gray-300 dark:border-green-400 rounded-lg overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
              onClick={() => toggleExpand(agent.id)}
            >
              <div className="flex items-center space-x-2">
                {expandedItem === agent.id ? (
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-green-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500 dark:text-green-400" />
                )}
                <span className="font-medium">{agent.name}</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-green-600 font-mono">
                {`${agent.id.slice(0, 6)}...${agent.id.slice(-4)}`}
              </div>
            </div>

            {expandedItem === agent.id && (
              <div className="p-4 border-t border-gray-300 dark:border-green-400 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-green-600">Created:</div>
                    <div className="text-sm">{agent.createdAt}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 dark:text-green-600 mb-2">
                      Recent Usage:
                    </div>
                    {agent.recentUsage.length > 0 ? (
                      <div className="space-y-2">
                        {agent.recentUsage.map((usage) => (
                          <div key={usage.id} className="text-sm flex justify-between">
                            <span>{usage.type}</span>
                            <span className="text-gray-500 dark:text-green-600">
                              {usage.timestamp}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-green-600">
                        No recent activity
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAgent(agent.id);
                      }}
                      className="flex items-center space-x-1 text-sm px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Agent</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="w-full p-2 border border-dashed border-gray-300 dark:border-green-400 rounded-lg text-gray-500 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center justify-center space-x-2"
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
