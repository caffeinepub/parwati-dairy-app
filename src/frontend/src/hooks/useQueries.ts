import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

// This file is for React Query hooks that interact with the backend
// Currently, the backend has no methods, so no queries are needed
// Add custom hooks here when backend functionality is added

export function useExample() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['example'],
    queryFn: async () => {
      if (!actor) return null;
      // Call backend methods here when available
      return null;
    },
    enabled: !!actor && !isFetching,
  });
}
