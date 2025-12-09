import request from './axios';

export const authApi = {
  login: (data) => request.post('/auth/login', data),
  register: (data) => request.post('/auth/register', data),
  me: () => request.get('/auth/me'),
  resetPassword: (data) => request.post('/auth/reset-password', data),
};

export const productApi = {
  getLatest: () => request.get('/products/latest'),
  getList: (params) => request.get('/products', { params }),
  getDetail: (id) => request.get(`/products/${id}`),
  increaseView: (id) => request.post(`/products/${id}/view`),
  create: (data) => request.post('/products', data),
  update: (id, data) => request.put(`/products/${id}`, data),
  delete: (id) => request.delete(`/products/${id}`),
  getCategories: () => request.get('/categories'),
  updateStatus: (id, status) => request.patch(`/products/${id}/status`, { status }),
};

export const userApi = {
  getProfile: (id) => request.get(`/users/${id}`),
  getMyProducts: (status) => request.get('/users/me/products', { params: { status } }),
  getUserProducts: (id, status) => request.get(`/users/${id}/products`, { params: { status } }),
  updateProfile: (data) => request.put('/users/me', data),
};

export const orderApi = {
  create: (data) => request.post('/orders', data),
  getDetail: (id) => request.get(`/orders/${id}`),
  getMyOrders: (role, status) => request.get('/orders/me', { params: { role, status } }),
  confirm: (id) => request.post(`/orders/${id}/confirm`),
  ship: (id) => request.post(`/orders/${id}/ship`),
  cancel: (id) => request.post(`/orders/${id}/cancel`),
};

export const chatApi = {
  getList: () => request.get('/chats'),
  getMessages: (sessionId) => request.get(`/chats/${sessionId}/messages`),
  sendMessage: (sessionId, data) => request.post(`/chats/${sessionId}/messages`, data),
  startChat: (productId) => request.post('/chats/start', { productId }),
  markAllRead: () => request.post('/chats/read-all'),
  recallMessage: (sessionId, messageId) => request.post(`/chats/${sessionId}/messages/${messageId}/recall`),
};

export const fileApi = {
  /**
   * 上传图片
   * @param {File} file 文件
   * @param {string} type 类型: avatars(头像), products(商品图片), chat(聊天图片)
   */
  uploadImage: (file, type = 'products') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return request.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const favoriteApi = {
  listMy: () => request.get('/favorites'),
  add: (productId) => request.post(`/favorites/${productId}`),
  remove: (productId) => request.delete(`/favorites/${productId}`),
};
