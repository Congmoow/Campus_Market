import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { orderService, OrderStatus, ShippingMethod, OrderDto, PageResult } from '../services/orderService';
import { useAuthModalStore } from '../store/authModalStore';

export const useMyOrders = (
  params: { role?: 'buyer' | 'seller'; status?: OrderStatus; page?: number; size?: number }
): UseQueryResult<PageResult<OrderDto>, Error> => {
  return useQuery<PageResult<OrderDto>, Error>({
    queryKey: ['orders', params],
    queryFn: () => orderService.getMyOrders(params),
    placeholderData: (prev) => prev,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { openModal } = useAuthModalStore();
  return useMutation({
    mutationFn: async (payload: { productId: number; quantity?: number; shippingMethod: ShippingMethod; shippingAddress?: string }) => {
      const token = localStorage.getItem('token');
      if (!token) {
        openModal('login');
        throw new Error('UNAUTHORIZED');
      }
      return orderService.createOrder(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useShipOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, logisticsCompany, trackingNumber }: { id: number; logisticsCompany?: string; trackingNumber?: string }) => orderService.shipOrder(id, { logisticsCompany, trackingNumber }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useConfirmReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => orderService.confirmReceipt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => orderService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};



