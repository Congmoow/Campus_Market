import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { HomePage } from '../pages/Home';
import { ProductListPage } from '../pages/ProductList';
import { ProductDetailPage } from '../pages/ProductDetail';
import { PublishPage } from '../pages/Publish';
import { ProfilePage } from '../pages/Profile';
import { ProfileEditPage } from '../pages/Profile/Edit';
import { FavoritesPage } from '../pages/Favorites';
import { MyProductsPage } from '../pages/MyProducts';
import { OrdersPage } from '../pages/Orders';
import { HistoryPage } from '../pages/History';
import { useUserStore } from '../store/userStore';
import { ChatPage } from '../pages/Chat';
import { useAuthModalStore } from '../store/authModalStore';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { token } = useUserStore();
  const location = useLocation();
  const authModalStore = useAuthModalStore();

  useEffect(() => {
    if (!token) {
      const redirectPath = location.pathname + location.search;
      window.sessionStorage.setItem('pendingRedirect', redirectPath);
      authModalStore.openModal('login');
    }
  }, [token, location.pathname, location.search, authModalStore]);

  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/products" element={<MainLayout><ProductListPage /></MainLayout>} />
      <Route path="/products/:id" element={<MainLayout><ProductDetailPage /></MainLayout>} />
      <Route path="/publish" element={<MainLayout><RequireAuth><PublishPage /></RequireAuth></MainLayout>} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="/profile" element={<MainLayout><RequireAuth><ProfilePage /></RequireAuth></MainLayout>} />
      <Route path="/profile/edit" element={<MainLayout><RequireAuth><ProfileEditPage /></RequireAuth></MainLayout>} />
      <Route path="/favorites" element={<MainLayout><RequireAuth><FavoritesPage /></RequireAuth></MainLayout>} />
      <Route path="/my-products" element={<MainLayout><RequireAuth><MyProductsPage /></RequireAuth></MainLayout>} />
      <Route path="/history" element={<MainLayout><HistoryPage /></MainLayout>} />
      
      {/* Placeholder routes */}
      <Route path="/messages" element={<MainLayout><div style={{ padding: '100px', textAlign: 'center' }}>消息中心（开发中）</div></MainLayout>} />
      <Route path="/orders" element={<MainLayout><RequireAuth><OrdersPage /></RequireAuth></MainLayout>} />
      <Route path="/chat" element={<MainLayout><RequireAuth><ChatPage /></RequireAuth></MainLayout>} />
      <Route path="/forgot-password" element={<MainLayout><div style={{ padding: '100px', textAlign: 'center' }}>找回密码（开发中）</div></MainLayout>} />
      
      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

