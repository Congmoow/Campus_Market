import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { productService } from '../services/productService';
import type { ProductQuery, ProductListResponse } from '../types/product';
import { useUserStore } from '../store/userStore';
import { useAuthModalStore } from '../store/authModalStore';

export const useProducts = (query: ProductQuery = {}): UseQueryResult<ProductListResponse, Error> => {
  return useQuery<ProductListResponse, Error>({
    queryKey: ['products', query],
    queryFn: () => productService.getProducts(query),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { token } = useUserStore();
  const { openModal } = useAuthModalStore();
  
  return useMutation({
    mutationFn: async (productId: number) => {
      const hasToken = !!token || !!localStorage.getItem('token');
      if (!hasToken) {
        try {
          const redirectPath = window.location.pathname + window.location.search;
          window.sessionStorage.setItem('pendingRedirect', redirectPath);
        } catch {}
        openModal('login');
        throw new Error('UNAUTHORIZED');
      }
      return productService.toggleFavorite(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
      queryClient.invalidateQueries({ queryKey: ['myFavorites'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 401) {
        try {
          const redirectPath = window.location.pathname + window.location.search;
          window.sessionStorage.setItem('pendingRedirect', redirectPath);
        } catch {}
        openModal('login');
      }
    },
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'ACTIVE' | 'RESERVED' | 'SOLD' | 'DELETED' }) =>
      productService.updateProductStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

