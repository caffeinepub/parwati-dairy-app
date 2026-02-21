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
      return actor.getOrderHistory(BigInt(customerId));
    },
    enabled: !!actor && !isFetching && customerId > 0,
  });
}

// Hook to fetch delivery schedule for a specific order
export function useDeliverySchedule(orderId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Delivery | null>({
    queryKey: ['deliverySchedule', orderId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDeliverySchedule(orderId);
    },
    enabled: !!actor && !isFetching,
  });
}
