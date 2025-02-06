'use client';

import { Agent } from '@/lib/types';
import { Pause, Play, Power } from 'lucide-react';

interface StatusButtonProps {
  variant: 'enable' | 'disable' | 'pause';
  onClick: () => void;
  disabled: boolean;
}

const StatusButton = ({ variant, onClick, disabled }: StatusButtonProps) => {
  const getIcon = () => {
    switch (variant) {
      case 'enable':
        return <Play className="w-4 h-4" />;
      case 'pause':
        return <Pause className="w-4 h-4" />;
      case 'disable':
        return <Power className="w-4 h-4" />;
    }
  };

  const getStyle = () => {
    switch (variant) {
      case 'enable':
        return 'border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30';
      case 'pause':
        return 'border-yellow-300 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30';
      case 'disable':
        return 'border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30';
    }
  };

  const getLabel = () => {
    switch (variant) {
      case 'enable':
        return 'Enable';
      case 'pause':
        return 'Pause';
      case 'disable':
        return 'Disable';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center space-x-1 text-xs px-2 py-1 border rounded-md ${getStyle()} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </button>
  );
};

interface AgentStatusControlsProps {
  agent: Agent;
  onUpdateStatus: (status: Agent['status']) => Promise<void>;
  isLoading: boolean;
}

export function AgentStatusControls({
  agent,
  onUpdateStatus,
  isLoading,
}: AgentStatusControlsProps) {
  if (agent.status === 'pending') {
    return (
      <div className="flex items-center space-x-1">
        <StatusButton
          variant="enable"
          onClick={() => onUpdateStatus('enabled')}
          disabled={isLoading}
        />
      </div>
    );
  }

  if (agent.status === 'enabled') {
    return (
      <div className="flex items-center space-x-1">
        <StatusButton
          variant="pause"
          onClick={() => onUpdateStatus('paused')}
          disabled={isLoading}
        />
        <StatusButton
          variant="disable"
          onClick={() => onUpdateStatus('disabled')}
          disabled={isLoading}
        />
      </div>
    );
  }

  if (agent.status === 'paused') {
    return (
      <div className="flex items-center space-x-1">
        <StatusButton
          variant="enable"
          onClick={() => onUpdateStatus('enabled')}
          disabled={isLoading}
        />
        <StatusButton
          variant="disable"
          onClick={() => onUpdateStatus('disabled')}
          disabled={isLoading}
        />
      </div>
    );
  }

  if (agent.status === 'disabled') {
    return (
      <div className="flex items-center space-x-1">
        <StatusButton
          variant="enable"
          onClick={() => onUpdateStatus('enabled')}
          disabled={isLoading}
        />
      </div>
    );
  }

  return null;
}
