import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Zap, Shield, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productApi } from '../api';

const FEATURES = [
  {
    icon: Zap,
    title: "极速发布",
    desc: "30秒快速发布闲置，智能识别分类"
  },
  {
    icon: Shield,
    title: "实名认证",
    desc: "接入校园统一认证，交易更安心"
  },
  {
    icon: RefreshCw,
    title: "当面交易",
    desc: "校内线下自提，省去快递烦恼"
  }
];

// 将后端的 ProductListItemDto 转成前端卡片需要的结构
const mapToCardProduct = (p) => {
  const createdAt = p.createdAt ? new Date(p.createdAt) : null;

  const formatTime = (date) => {
    if (!date || isNaN(date.getTime())) return '';
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 60) return `${diffMinutes || 1}分钟前`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}小时前`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return {
    id: p.id,
    title: p.title,
    price: p.price,
    description: '',
    image: p.thumbnail || 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&q=80&w=800',
    location: p.location || '校内',
    timeAgo: formatTime(createdAt),
    seller: {
      name: p.sellerName || '同学',
      avatar: p.sellerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.sellerId || p.id}`,
    },
  };
};

const Home = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await productApi.getLatest();
        if (res.success) {
          setLatestProducts(res.data || []);
        } else {
          setError(res.message || '加载最新商品失败');
        }
      } catch (err) {
        setError('加载最新商品失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Hero />
      
      {/* Features Section */}
      <section className="py-16 bg-white relative border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-6 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors group cursor-default">
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300 text-blue-600 ring-1 ring-slate-100">
                  <feature.icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">最新发布</h2>
              <p className="text-slate-500">看看同学们刚刚发布了什么好东西</p>
            </div>
            <Link 
              to="/market" 
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 group"
            >
              查看全部 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mb-4">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {loading ? (
              <div className="col-span-full text-center text-slate-400 text-sm">正在加载最新商品...</div>
            ) : latestProducts.length === 0 ? (
              <div className="col-span-full text-center text-slate-400 text-sm">暂时还没有商品，去发布一个吧～</div>
            ) : (
              latestProducts.map((p) => (
                <ProductCard key={p.id} product={mapToCardProduct(p)} />
              ))
            )}
          </div>
          
          <div className="mt-12 text-center sm:hidden">
            <Link 
              to="/market" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
            >
              查看全部 
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            你也有一堆闲置物品吗？
          </h2>
          <p className="text-blue-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            别让它们在角落里吃灰。只需几步，轻松变现，还能帮助有需要的同学。
          </p>
          <Link to="/publish">
             <button className="px-10 py-5 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
              立即发布闲置
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
