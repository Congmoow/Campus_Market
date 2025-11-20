export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  categoryId: number;
  categoryName?: string;
  campus: string;
  status: 'ACTIVE' | 'RESERVED' | 'SOLD' | 'DELETED';
  images: string[];
  coverImage?: string;
  seller: {
    id: number;
    nickname: string;
    avatar?: string;
    campus: string;
    rating?: number;
  };
  views: number;
  favorites: number;
  favorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQuery {
  page?: number;
  size?: number;
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  campus?: string;
  status?: 'ACTIVE' | 'RESERVED' | 'SOLD' | 'DELETED';
  sortBy?: 'createdAt' | 'price' | 'views';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductListResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  parentId?: number;
}

