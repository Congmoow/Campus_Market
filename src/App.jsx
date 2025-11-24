import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Publish from './pages/Publish';
import UserProfile from './pages/UserProfile';
import MyProducts from './pages/MyProducts';
import MyOrders from './pages/MyOrders';
import MyFavorites from './pages/MyFavorites';
import SearchResults from './pages/SearchResults';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Chat from './pages/Chat';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/market" element={<Marketplace />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/user/:id" element={<UserProfile />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/my-products" element={<MyProducts />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/my-favorites" element={<MyFavorites />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
