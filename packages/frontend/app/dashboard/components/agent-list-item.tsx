'use client';

import { Agent } from '@/lib/types';
import { ChevronDown, ChevronRight, Circle, Trash2 } from 'lucide-react';
import { AgentStatusControls } from './agent-status-controls';

interface AgentListItemProps {
  agent: Agent;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateStatus: (status: Agent['status']) => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading: boolean;
}

const StatusIndicator = ({ status }: { status: Agent['status'] }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'enabled':
        return 'text-green-500 fill-green-500';
      case 'paused':
        return 'text-yellow-500 fill-yellow-500';
      case 'disabled':
        return 'text-red-500 fill-red-500';
      default:
        return 'text-gray-500 fill-gray-500';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'enabled':
        return 'Active';
      case 'paused':
        return 'Paused';
      case 'disabled':
        return 'Disabled';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="flex items-center space-x-1.5">
      <Circle className={`w-2 h-2 ${getStatusColor()}`} />
      <span className={`text-xs ${getStatusColor()}`}>{getStatusLabel()}</span>
    </div>
  );
};

export function AgentListItem({
  agent,
  isExpanded,
  onToggleExpand,
  onUpdateStatus,
  onDelete,
  isLoading,
}: AgentListItemProps) {
  return (
    <div className="border border-gray-300 dark:border-green-400 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={onToggleExpand}>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-green-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500 dark:text-green-400" />
            )}
            <span className="font-medium">{agent.label}</span>
          </div>
          <StatusIndicator status={agent.status} />
        </div>
        <div className="flex items-center space-x-4">
          <AgentStatusControls
            agent={agent}
            onUpdateStatus={onUpdateStatus}
            isLoading={isLoading}
          />
          <div className="text-sm text-gray-500 dark:text-green-600 font-mono">
            {`${agent.id.slice(0, 6)}...${agent.id.slice(-4)}`}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-300 dark:border-green-400 bg-gray-50 dark:bg-gray-900">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-green-600">Created:</div>
              <div className="text-sm">{new Date(agent.createdAt).toLocaleDateString()}</div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={isLoading}
                className="flex items-center space-x-1 text-sm px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Agent</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
