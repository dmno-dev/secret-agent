import { secretAgentApi } from '@/lib/api';
import { ConfigItem, ConfigItemCreate } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateConfigItem(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ConfigItemCreate) => {
      // Format the data to match the schema
      const payload = {
        key: data.key,
        itemType: data.itemType,
        value: 'value' in data ? data.value : undefined,
        llmSettings: data.itemType === 'llm' ? data.llmSettings : undefined,
        proxySettings: data.itemType === 'proxy' ? data.proxySettings : undefined,
      };

      return secretAgentApi
        .post(`projects/${projectId}/config-items`, { json: payload })
        .json<ConfigItem>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

export function useUpdateConfigItem(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: ConfigItemCreate }) => {
      // Format the data to match the schema
      const payload = {
        key: data.key,
        itemType: data.itemType,
        value: 'value' in data ? data.value : undefined,
        llmSettings: data.itemType === 'llm' ? data.llmSettings : undefined,
        proxySettings: data.itemType === 'proxy' ? data.proxySettings : undefined,
      };

      return secretAgentApi
        .patch(`projects/${projectId}/config-items/${key}`, { json: payload })
        .json<ConfigItem>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
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
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}
