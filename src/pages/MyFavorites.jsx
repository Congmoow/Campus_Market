import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, User, ArrowRight, Trash2, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { favoriteApi } from '../api';
import { invalidateFavoriteIdsCache } from '../components/ProductCard';

const MyFavorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await favoriteApi.listMy();
      if (res.success) {
        const list = res.data || [];
        const mapped = list.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          image:
            p.thumbnail ||
            'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&q=80&w=800',
          location: p.location || '校内',
          seller: {
            name: p.sellerName || '同学',
            avatar:
              p.sellerAvatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.sellerId || p.id}`,
          },
        }));
        setFavorites(mapped);
      } else {
        setError(res.message || '加载收藏列表失败');
      }
    } catch (e) {
      setError('加载收藏列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await favoriteApi.remove(productId);
      setFavorites((prev) => prev.filter((item) => item.id !== productId));
      invalidateFavoriteIdsCache();
    } catch (e) {
      console.error('取消收藏失败', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32">
        <div className="flex items-center justify-between mb-10">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-slate-900 flex items-center gap-3"
            >
              <span className="p-2 bg-rose-100 rounded-xl text-rose-500">
                <Heart size={28} fill="currentColor" />
              </span>
              我的收藏
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 mt-2 ml-1"
            >
              这里是你心动的宝贝，共收藏了 {favorites.length} 件商品
            </motion.p>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-500">{error}</div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-sm">
            正在加载收藏的商品...
          </div>
        ) : favorites.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {favorites.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => navigate(`/product/${item.id}`)}
                  className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-500 cursor-pointer"
                >
                  {/* Image Area */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Floating Action Button - Remove */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.id);
                      }}
                      className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-rose-500 shadow-lg hover:bg-rose-500 hover:text-white transition-all duration-300 z-20"
                      title="取消收藏"
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* Overlay CTA 已移除，改为整卡片可点击跳转 */}
                  </div>

                  {/* Info Content */}
                  <div className="p-5 relative bg-white z-10">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-bold text-slate-900 line-clamp-1 text-lg group-hover:text-blue-600 transition-colors">{item.title}</h3>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-rose-500 font-mono">¥{item.price}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-slate-400 line-through decoration-slate-300">¥{item.originalPrice}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden">
                          <img src={item.seller.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{item.seller.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                        <MapPin size={10} />
                        {item.location}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-rose-300 animate-bounce">
              <Heart size={48} fill="currentColor" className="opacity-50" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">还没遇到心动的吗？</h3>
            <p className="text-slate-500 mb-8">去集市逛逛，发现更多好物</p>
            <Link to="/market">
              <button className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium shadow-xl shadow-slate-900/20 transition-all flex items-center gap-2">
                <ShoppingCart size={20} />
                前往集市
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFavorites;
