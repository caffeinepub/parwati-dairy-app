import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Order, Delivery, RegularCustomer, DailyOrderRecord } from '../backend';

// Hook to check if the current caller is an admin
export function useIsAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000,
    retry: 1,
  });
}

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
    staleTime: 30000,
  });
}

// Hook to fetch all orders (admin only)
export function useAllOrders(isAdmin: boolean) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getAllOrders();
        return result || [];
      } catch (error) {
        console.error('Error fetching all orders:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching && isAdmin,
    retry: 2,
    staleTime: 30000,
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
    staleTime: 30000,
  });
}

// Hook to fetch all regular customers
export function useRegularCustomers() {
  const { actor, isFetching } = useActor();

  return useQuery<RegularCustomer[]>({
    queryKey: ['regularCustomers'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getRegularCustomers();
        return result || [];
      } catch (error) {
        console.error('Error fetching regular customers:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: 15000,
  });
}

// Hook to add a regular customer
export function useAddRegularCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      phone: string;
      address: string;
      dailyMilkQuantity: number;
      pricePerLitre: number;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addRegularCustomer(
        params.name,
        params.phone,
        params.address,
        params.dailyMilkQuantity,
        params.pricePerLitre
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regularCustomers'] });
    },
  });
}

// Hook to record a daily delivery for a customer
export function useRecordDailyDelivery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.recordDailyDelivery(customerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regularCustomers'] });
    },
  });
}

// Hook to record a payment for a customer
export function useRecordPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      customerId: bigint;
      amount: number;
      paymentDate: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.recordPayment(params.customerId, params.amount, params.paymentDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regularCustomers'] });
    },
  });
}

// Hook to update a regular customer
export function useUpdateRegularCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      customerId: bigint;
      name: string;
      phone: string;
      address: string;
      dailyMilkQuantity: number;
      pricePerLitre: number;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateRegularCustomer(
        params.customerId,
        params.name,
        params.phone,
        params.address,
        params.dailyMilkQuantity,
        params.pricePerLitre,
        params.isActive
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regularCustomers'] });
    },
  });
}

// Hook to fetch daily order records for a specific customer
export function useDailyOrderRecordsByCustomer(customerId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<DailyOrderRecord[]>({
    queryKey: ['dailyOrderRecords', customerId?.toString()],
    queryFn: async () => {
      if (!actor || customerId === null) return [];
      try {
        const result = await actor.getDailyOrderRecordsByCustomer(customerId);
        return result || [];
      } catch (error) {
        console.error('Error fetching daily order records:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching && customerId !== null,
    retry: 2,
    staleTime: 15000,
  });
}

// Hook to add a daily order record
export function useAddDailyOrderRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      customerId: bigint;
      date: string;
      quantityDelivered: number;
      amountCharged: number;
      notes: string | null;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addDailyOrderRecord(
        params.customerId,
        params.date,
        params.quantityDelivered,
        params.amountCharged,
        params.notes
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dailyOrderRecords', variables.customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['regularCustomers'] });
    },
  });
}

// Hook to delete a daily order record
export function useDeleteDailyOrderRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { recordId: bigint; customerId: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteDailyOrderRecord(params.recordId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dailyOrderRecords', variables.customerId.toString()] });
    },
  });
}
