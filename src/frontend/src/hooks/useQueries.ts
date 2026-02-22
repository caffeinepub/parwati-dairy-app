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
      try {
        const result = await actor.getOrderHistory(BigInt(customerId));
        return result || [];
      } catch (error) {
        console.error('Error fetching order history:', error);
        throw error;
      }
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
      try {
        const result = await actor.getDeliverySchedule(orderId);
        return result || null;
      } catch (error) {
        console.error('Error fetching delivery schedule:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching && orderId !== undefined && orderId !== null,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
}
