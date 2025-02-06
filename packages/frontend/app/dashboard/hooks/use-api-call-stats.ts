import { useQuery } from "@tanstack/react-query";

export type ApiCallStats = {
  totalCalls: number;
  isLoading: boolean;
};

// Simulated API call - replace with real API call later
const fetchApiCallStats = async (): Promise<number> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  // For demo, return a random number between 1200-1300
  return 1234 + Math.floor(Math.random() * 100);
};

export function useApiCallStats(): ApiCallStats {
  const { data: totalCalls = 1234, isLoading } = useQuery({
    queryKey: ["apiCallStats"],
    queryFn: fetchApiCallStats,
    refetchInterval: 2000, // Refetch every 2 seconds
    // Start with initial data to avoid layout shift
    initialData: 1234,
  });

  return {
    totalCalls,
    isLoading,
  };
}
