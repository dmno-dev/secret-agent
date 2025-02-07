import { secretAgentApi } from '@/lib/api';
import { ConfigItem, ConfigItemCreate } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const PROJECT_DETAILS_QUERY_KEY = 'project-details';

export function useCreateConfigItem(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ConfigItemCreate) => {
      return secretAgentApi
        .post(`projects/${projectId}/config-items`, { json: data })
        .json<ConfigItem>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECT_DETAILS_QUERY_KEY, projectId] });
      toast.success('Config item created successfully');
    },
    onError: (error: Error) => {
      console.error('Error creating config item:', error);
      toast.error(error.message || 'Failed to create config item');
    },
  });
}

export function useUpdateConfigItem(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: ConfigItemCreate }) => {
      return secretAgentApi
        .patch(`projects/${projectId}/config-items/${key}`, { json: data })
        .json<ConfigItem>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECT_DETAILS_QUERY_KEY, projectId] });
      toast.success('Config item updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating config item:', error);
      toast.error(error.message || 'Failed to update config item');
    },
  });
}

export function useDeleteConfigItem(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      await secretAgentApi.delete(`projects/${projectId}/config-items/${key}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECT_DETAILS_QUERY_KEY, projectId] });
      toast.success('Config item deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Error deleting config item:', error);
      toast.error(error.message || 'Failed to delete config item');
    },
  });
}
