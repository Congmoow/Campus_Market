import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器：自动携带 Token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：处理全局错误（如 401 未登录）
instance.interceptors.response.use(
  (response) => {
    // 假设后端返回格式为 { success: true, data: ... }
    // 如果直接返回数据内容，可以 return response.data;
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token 过期或未登录，清除 Token 并跳转（或弹窗）
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 可以在这里触发一个全局事件让 App 弹出登录框，或者直接刷新页面
      // window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default instance;
