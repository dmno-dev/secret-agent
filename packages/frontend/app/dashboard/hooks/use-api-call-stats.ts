import { useQuery } from "@tanstack/react-query";

export type ApiCallStats = {
  totalCalls: number;
  isLoading: boolean;
};

// Simulated API call - replace with real API call later
const fetchApiCallStats = async (projectId: string): Promise<number> => {
  console.log("fetching api call stats for project", projectId);
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  // For demo, return a random number between 1200-1300
  return 1234 + Math.floor(Math.random() * 100);
};

export function useApiCallStats(projectId: string): ApiCallStats {
  const { data: totalCalls = 1234, isLoading } = useQuery({
    queryKey: ["apiCallStats", projectId],
    queryFn: () => fetchApiCallStats(projectId),
    refetchInterval: 2000, // Refetch every 2 seconds
    // Start with initial data to avoid layout shift
    initialData: 1234,
  });

  return {
    totalCalls,
    isLoading,
  };
}
