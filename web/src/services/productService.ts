import { api, ASSET_BASE_URL } from './apiClient';
import type { Product, ProductQuery, ProductListResponse } from '../types/product';
import { getMockProducts, getMockProductById } from './mockData';

// Toggle to use mock data or real API
const USE_MOCK = false;

export const productService = {
  // Get product list
  async getProducts(query: ProductQuery = {}): Promise<ProductListResponse> {
    if (USE_MOCK) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return getMockProducts(query.page, query.size);
    }
    const { data } = await api.get('/v1/products', { params: query });
    return data;
  },

  // Get product detail
  async getProductById(id: number): Promise<Product> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const product = getMockProductById(id);
      if (!product) throw new Error('Product not found');
      return product;
    }
    const { data } = await api.get(`/v1/products/${id}`);
    const normalized = {
      ...data,
      images: Array.isArray(data.images)
        ? data.images.map((img: string) =>
            typeof img === 'string' && img.startsWith('/uploads')
              ? `${ASSET_BASE_URL}${img}`
              : img
          )
        : [],
    };
    if (typeof normalized.coverImage === 'string' && normalized.coverImage.startsWith('/uploads')) {
      normalized.coverImage = `${ASSET_BASE_URL}${normalized.coverImage}`;
    }
    if (normalized.seller?.avatar && normalized.seller.avatar.startsWith('/uploads')) {
      normalized.seller.avatar = `${ASSET_BASE_URL}${normalized.seller.avatar}`;
    }
    return normalized;
  },

  // Create product
  async createProduct(product: Partial<Product>): Promise<Product> {
    const { data } = await api.post('/v1/products', product);
    return data;
  },

  // Get my products
  async getMyProducts(params: { page?: number; size?: number } = {}): Promise<ProductListResponse> {
    const { data } = await api.get('/v1/products/me', { params });
    return data;
  },

  // Get my favorites
  async getMyFavorites(params: { page?: number; size?: number } = {}): Promise<ProductListResponse> {
    const { data } = await api.get('/v1/products/favorites/me', { params });
    return data;
  },

  // Update product
  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const { data } = await api.put(`/v1/products/${id}`, product);
    return data;
  },

  // Update product status (ACTIVE | RESERVED | SOLD | DELETED)
  async updateProductStatus(id: number, status: 'ACTIVE' | 'RESERVED' | 'SOLD' | 'DELETED'): Promise<void> {
    await api.put(`/v1/products/${id}/status`, { status });
  },

  // Delete product
  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/v1/products/${id}`);
  },

  // Toggle favorite
  async toggleFavorite(id: number): Promise<void> {
    await api.post(`/v1/products/${id}/favorite`);
  },
};

