import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Order, Delivery } from '../backend';

// Hook to fetch order history for a customer
export function useOrderHistory(customerId: number) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orderHistory', customerId],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getOrderHistory(BigInt(customerId));
      return result || [];
    },
    enabled: !!actor && !isFetching && customerId > 0,
    retry: 2,
    staleTime: 30000, // 30 seconds
  });
}

// Hook to fetch delivery schedule for a specific order
export function useDeliverySchedule(orderId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Delivery | null>({
    queryKey: ['deliverySchedule', orderId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getDeliverySchedule(orderId);
      return result || null;
    },
    enabled: !!actor && !isFetching && !!orderId,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
}
