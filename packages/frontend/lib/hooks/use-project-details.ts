import { secretAgentApi } from '@/lib/api';
import { Agent, ConfigItem, Project } from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ProjectDetailsData {
  project: Project;
  agents: Agent[];
  configItems: ConfigItem[];
}

export function useProjectDetails(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    refetchInterval: 3000,
    queryFn: async () => {
      const response = await secretAgentApi.get(`projects/${projectId}`);
      return response.json() as Promise<ProjectDetailsData>;
    },
  });
}

export function useUpdateAgentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      agentId,
      status,
    }: {
      projectId: string;
      agentId: string;
      status: Agent['status'];
    }) => {
      const response = await secretAgentApi.patch(`projects/${projectId}/agents/${agentId}`, {
        json: { status },
      });

      if (!response.ok) {
        throw new Error('Failed to update agent status');
      }

      return response.json();
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      label,
      walletAddress,
    }: {
      projectId: string;
      label: string;
      walletAddress: string;
    }) => {
      const response = await secretAgentApi.post(`projects/${projectId}/agents`, {
        json: {
          label,
          id: walletAddress,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create agent');
      }

      return response.json();
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, agentId }: { projectId: string; agentId: string }) => {
      const response = await secretAgentApi.delete(`projects/${projectId}/agents/${agentId}`);

      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }

      return response.json();
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}
