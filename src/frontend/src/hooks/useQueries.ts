import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DailyOrderRecord,
  Delivery,
  Order,
  RegularCustomer,
} from "../backend";
import { useActor } from "./useActor";
import { useAdminSession } from "./useAdminSession";

// ─── Admin credential hooks ────────────────────────────────────────────────────

export function useHasAdminCredentials() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["hasAdminCredentials"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.hasAdminCredentials();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 1,
  });
}

export function useSetAdminCredentials() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { username: string; password: string }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.setAdminCredentials(params.username, params.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hasAdminCredentials"] });
    },
  });
}

export function useAdminLogin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { username: string; password: string }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.adminLogin(params.username, params.password);
    },
    retry: 2,
    retryDelay: 1000,
  });
}

export function useResetAdminPassword() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: {
      verificationCode: string;
      newUsername: string;
      newPassword: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.resetAdminPassword(
        params.verificationCode,
        params.newUsername,
        params.newPassword,
      );
    },
  });
}

export function useChangeAdminCredentials() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: {
      oldPassword: string;
      newUsername: string;
      newPassword: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.changeAdminCredentials(
        params.oldPassword,
        params.newUsername,
        params.newPassword,
      );
    },
  });
}

// Hook to fetch order history for a customer
export function useOrderHistory(customerId: number) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ["orderHistory", customerId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getOrderHistory(BigInt(customerId));
        return result || [];
      } catch (error) {
        console.error("Error fetching order history:", error);
        return [];
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
  const { adminPassword } = useAdminSession();

  return useQuery<Order[]>({
    queryKey: ["allOrders", adminPassword],
    queryFn: async () => {
      if (!actor || !adminPassword) return [];
      try {
        const result = await actor.getAllOrders(adminPassword);
        return result || [];
      } catch (error) {
        console.error("Error fetching all orders:", error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAdmin && !!adminPassword,
    retry: 2,
    staleTime: 30000,
  });
}

// Hook to fetch delivery schedule for a specific order
export function useDeliverySchedule(orderId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Delivery | null>({
    queryKey: ["deliverySchedule", orderId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getDeliverySchedule(orderId);
        return result || null;
      } catch (error) {
        console.error("Error fetching delivery schedule:", error);
        return null;
      }
    },
    enabled:
      !!actor && !isFetching && orderId !== undefined && orderId !== null,
    retry: 1,
    staleTime: 30000,
  });
}

// Hook to fetch all regular customers
export function useRegularCustomers() {
  const { actor, isFetching } = useActor();
  const { adminPassword, isAdminLoggedIn } = useAdminSession();

  return useQuery<RegularCustomer[]>({
    queryKey: ["regularCustomers", adminPassword],
    queryFn: async () => {
      if (!actor || !adminPassword) return [];
      try {
        const result = await actor.getRegularCustomers(adminPassword);
        return result || [];
      } catch (error) {
        console.error("Error fetching regular customers:", error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAdminLoggedIn && !!adminPassword,
    retry: 2,
    staleTime: 15000,
  });
}

// Hook to add a regular customer
export function useAddRegularCustomer() {
  const { actor } = useActor();
  const { adminPassword } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      phone: string;
      address: string;
      dailyMilkQuantity: number;
      pricePerLitre: number;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      if (!adminPassword) throw new Error("Not authenticated as admin");
      return actor.addRegularCustomer(
        adminPassword,
        params.name,
        params.phone,
        params.address,
        params.dailyMilkQuantity,
        params.pricePerLitre,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regularCustomers"] });
    },
  });
}

// Hook to record a daily delivery for a customer
export function useRecordDailyDelivery() {
  const { actor } = useActor();
  const { adminPassword } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      if (!adminPassword) throw new Error("Not authenticated as admin");
      return actor.recordDailyDelivery(adminPassword, customerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regularCustomers"] });
    },
  });
}

// Hook to record a payment for a customer
export function useRecordPayment() {
  const { actor } = useActor();
  const { adminPassword } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      customerId: bigint;
      amount: number;
      paymentDate: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      if (!adminPassword) throw new Error("Not authenticated as admin");
      return actor.recordPayment(
        adminPassword,
        params.customerId,
        params.amount,
        params.paymentDate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regularCustomers"] });
    },
  });
}

// Hook to update a regular customer
export function useUpdateRegularCustomer() {
  const { actor } = useActor();
  const { adminPassword } = useAdminSession();
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
      if (!actor) throw new Error("Actor not initialized");
      if (!adminPassword) throw new Error("Not authenticated as admin");
      return actor.updateRegularCustomer(
        adminPassword,
        params.customerId,
        params.name,
        params.phone,
        params.address,
        params.dailyMilkQuantity,
        params.pricePerLitre,
        params.isActive,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regularCustomers"] });
    },
  });
}

// Hook to fetch daily order records for a specific customer
export function useDailyOrderRecordsByCustomer(customerId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<DailyOrderRecord[]>({
    queryKey: ["dailyOrderRecords", customerId?.toString()],
    queryFn: async () => {
      if (!actor || customerId === null) return [];
      try {
        const result = await actor.getDailyOrderRecordsByCustomer(customerId);
        return result || [];
      } catch (error) {
        console.error("Error fetching daily order records:", error);
        return [];
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
  const { adminPassword } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      customerId: bigint;
      date: string;
      quantityDelivered: number;
      amountCharged: number;
      notes: string | null;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      if (!adminPassword) throw new Error("Not authenticated as admin");
      return actor.addDailyOrderRecord(
        adminPassword,
        params.customerId,
        params.date,
        params.quantityDelivered,
        params.amountCharged,
        params.notes,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["dailyOrderRecords", variables.customerId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["regularCustomers"] });
    },
  });
}

// Hook to delete a daily order record
export function useDeleteDailyOrderRecord() {
  const { actor } = useActor();
  const { adminPassword } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { recordId: bigint; customerId: bigint }) => {
      if (!actor) throw new Error("Actor not initialized");
      if (!adminPassword) throw new Error("Not authenticated as admin");
      return actor.deleteDailyOrderRecord(adminPassword, params.recordId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["dailyOrderRecords", variables.customerId.toString()],
      });
    },
  });
}
