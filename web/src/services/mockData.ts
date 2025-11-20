import type { Product } from '../types/product';

// Mock product data for development
export const mockProducts: Product[] = [
  {
    id: 1,
    title: 'iPhone 13 Pro 256GB 石墨色',
    description: '自用 iPhone 13 Pro，256GB 石墨色，9成新，无磕碰无划痕，电池健康度92%，附原装充电器和数据线，包装盒完整。仅限校内当面交易。',
    price: 5299,
    condition: 'LIKE_NEW',
    categoryId: 1,
    categoryName: '电子产品',
    campus: '东校区',
    status: 'ACTIVE',
    images: [
      'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800',
      'https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?w=800',
    ],
    seller: {
      id: 101,
      nickname: '小明同学',
      campus: '东校区',
      rating: 4.8,
    },
    views: 234,
    favorites: 18,
    createdAt: '2025-10-10T10:30:00Z',
    updatedAt: '2025-10-10T10:30:00Z',
  },
  {
    id: 2,
    title: '高等数学第七版上下册',
    description: '同济大学高等数学教材，上下册全新，只用过一个学期，几乎没有笔记和勾画。适合数学专业或需要学习高数的同学。',
    price: 35,
    condition: 'LIKE_NEW',
    categoryId: 2,
    categoryName: '图书教材',
    campus: '西校区',
    status: 'ACTIVE',
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
    ],
    seller: {
      id: 102,
      nickname: '学霸小红',
      campus: '西校区',
      rating: 5.0,
    },
    views: 89,
    favorites: 12,
    createdAt: '2025-10-09T14:20:00Z',
    updatedAt: '2025-10-09T14:20:00Z',
  },
  {
    id: 3,
    title: 'MacBook Air M2 13寸 8+256',
    description: '2023年购入的 MacBook Air M2，午夜色，8GB+256GB 配置。外观完美无划痕，原装充电器和包装齐全。因升级设备出售，支持验机。',
    price: 7200,
    condition: 'LIKE_NEW',
    categoryId: 1,
    categoryName: '电子产品',
    campus: '东校区',
    status: 'ACTIVE',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
    ],
    seller: {
      id: 103,
      nickname: '程序猿',
      campus: '东校区',
      rating: 4.9,
    },
    views: 456,
    favorites: 42,
    createdAt: '2025-10-08T09:15:00Z',
    updatedAt: '2025-10-08T09:15:00Z',
  },
  {
    id: 4,
    title: 'IKEA 书桌椅套装 白色',
    description: '宜家购买的书桌椅套装，白色简约风格，适合宿舍或出租屋。使用半年，八成新，功能完好。因毕业离校低价转让，不包邮只支持自提。',
    price: 280,
    condition: 'GOOD',
    categoryId: 3,
    categoryName: '生活用品',
    campus: '南校区',
    status: 'ACTIVE',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800',
    ],
    seller: {
      id: 104,
      nickname: '毕业学长',
      campus: '南校区',
      rating: 4.7,
    },
    views: 178,
    favorites: 23,
    createdAt: '2025-10-07T16:45:00Z',
    updatedAt: '2025-10-07T16:45:00Z',
  },
  {
    id: 5,
    title: '羽毛球拍 YONEX 弓箭11',
    description: 'YONEX 弓箭11羽毛球拍，已穿线（BG65），九成新，手胶完好。附带球拍包和6个羽毛球。适合初中级水平球友。',
    price: 450,
    condition: 'LIKE_NEW',
    categoryId: 4,
    categoryName: '运动器材',
    campus: '北校区',
    status: 'ACTIVE',
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
    ],
    seller: {
      id: 105,
      nickname: '羽毛球爱好者',
      campus: '北校区',
      rating: 4.6,
    },
    views: 132,
    favorites: 15,
    createdAt: '2025-10-06T11:30:00Z',
    updatedAt: '2025-10-06T11:30:00Z',
  },
  {
    id: 6,
    title: 'iPad Pro 11寸 2021款 128GB',
    description: 'iPad Pro 11寸 2021款，深空灰，128GB WiFi版。配备 Apple Pencil 2 和妙控键盘。屏幕无划痕，边框有轻微使用痕迹。',
    price: 4500,
    condition: 'GOOD',
    categoryId: 1,
    categoryName: '电子产品',
    campus: '东校区',
    status: 'RESERVED',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
    ],
    seller: {
      id: 106,
      nickname: '设计小姐姐',
      campus: '东校区',
      rating: 4.9,
    },
    views: 298,
    favorites: 35,
    createdAt: '2025-10-05T13:20:00Z',
    updatedAt: '2025-10-11T09:15:00Z',
  },
  {
    id: 7,
    title: 'Nike 跑鞋 Air Zoom Pegasus 39',
    description: 'Nike Air Zoom Pegasus 39 跑鞋，男款42码，黑白配色。穿过3次，几乎全新，鞋盒完整。因尺码不合适转让。',
    price: 520,
    condition: 'NEW',
    categoryId: 5,
    categoryName: '服饰鞋包',
    campus: '西校区',
    status: 'ACTIVE',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    ],
    seller: {
      id: 107,
      nickname: '跑步达人',
      campus: '西校区',
      rating: 4.8,
    },
    views: 156,
    favorites: 19,
    createdAt: '2025-10-04T10:00:00Z',
    updatedAt: '2025-10-04T10:00:00Z',
  },
  {
    id: 8,
    title: '机械键盘 Cherry MX 青轴',
    description: 'Cherry MX Board 3.0机械键盘，青轴，87键无冲。使用一年，功能完好，键帽清洗干净。适合打字和编程。',
    price: 380,
    condition: 'GOOD',
    categoryId: 1,
    categoryName: '电子产品',
    campus: '东校区',
    status: 'ACTIVE',
    images: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800',
    ],
    seller: {
      id: 108,
      nickname: 'Code Warrior',
      campus: '东校区',
      rating: 4.7,
    },
    views: 201,
    favorites: 27,
    createdAt: '2025-10-03T15:40:00Z',
    updatedAt: '2025-10-03T15:40:00Z',
  },
];

// Function to get mock products (simulates API call)
export const getMockProducts = (page = 0, size = 20) => {
  const start = page * size;
  const end = start + size;
  return {
    content: mockProducts.slice(start, end),
    totalElements: mockProducts.length,
    totalPages: Math.ceil(mockProducts.length / size),
    page,
    size,
  };
};

// Function to get mock product by ID
export const getMockProductById = (id: number) => {
  return mockProducts.find(p => p.id === id);
};

