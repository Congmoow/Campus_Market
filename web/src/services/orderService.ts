import { api } from './apiClient';

export type OrderStatus = 'CREATED' | 'SHIPPED' | 'RECEIVED' | 'COMPLETED' | 'CANCELLED';
export type ShippingMethod = 'DELIVERY' | 'PICKUP';

export interface OrderDto {
  id: number;
  buyerId: number;
  sellerId: number;
  productId: number;
  quantity: number;
  priceTotal: number;
  paymentMethod: 'OFFLINE';
  shippingMethod: ShippingMethod;
  shippingAddress?: string;
  logisticsCompany?: string;
  trackingNumber?: string;
  status: OrderStatus;
  titleSnapshot?: string;
  coverSnapshot?: string;
  priceSnapshot?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const orderService = {
  async createOrder(payload: { productId: number; quantity?: number; shippingMethod: ShippingMethod; shippingAddress?: string }): Promise<OrderDto> {
    const { data } = await api.post('/v1/orders', payload);
    return data;
  },

  async getMyOrders(params: { role?: 'buyer' | 'seller'; status?: OrderStatus; page?: number; size?: number }): Promise<PageResult<OrderDto>> {
    const { data } = await api.get('/v1/orders/my', { params });
    return data;
  },

  async getOrder(id: number): Promise<OrderDto> {
    const { data } = await api.get(`/v1/orders/${id}`);
    return data;
  },

  async shipOrder(id: number, body: { logisticsCompany?: string; trackingNumber?: string }): Promise<OrderDto> {
    const { data } = await api.put(`/v1/orders/${id}/ship`, body);
    return data;
  },

  async confirmReceipt(id: number): Promise<OrderDto> {
    const { data } = await api.put(`/v1/orders/${id}/confirm-receipt`, {});
    return data;
  },

  async cancelOrder(id: number): Promise<OrderDto> {
    const { data } = await api.put(`/v1/orders/${id}/cancel`, {});
    return data;
  },
};



