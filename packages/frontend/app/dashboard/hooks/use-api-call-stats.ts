import { secretAgentApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

type RequestStatsTotals = {
  proxyCount: number;
  llmCount: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

const initialStats: RequestStatsTotals = {
  proxyCount: 0,
  llmCount: 0,
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
};

export type RequestStatsState = {
  totals: RequestStatsTotals;
  isLoading: boolean;
};

// Simulated API call - replace with real API call later
const fetchApiCallStats = async (projectId: string): Promise<RequestStatsTotals> => {
  const req = await secretAgentApi.get(`projects/${projectId}/stats`);
  return await req.json();
};

export function useProjectCurrentPeriodStats(projectId: string): RequestStatsState {
  const { data: totals, isLoading } = useQuery({
    queryKey: ['apiCallStats', projectId],
    queryFn: () => fetchApiCallStats(projectId),
    refetchInterval: 2000, // Refetch every 2 seconds
    // Start with initial data to avoid layout shift
    initialData: initialStats,
  });

  return {
    totals,
    isLoading,
  };
}
