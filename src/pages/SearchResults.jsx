import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, PackageX, ArrowLeft, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { productApi } from '../api';

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
    image:
      p.thumbnail ||
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&q=80&w=800',
    location: p.location || '校内',
    timeAgo: formatTime(createdAt),
    seller: {
      name: p.sellerName || '同学',
      avatar:
        p.sellerAvatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.sellerId || p.id}`,
    },
  };
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const res = await productApi.getList({ keyword: query, page: 0, size: 20 });

        if (res.success) {
          const list = res.data?.content || [];
          setProducts(list.filter((p) => p.status === 'ON_SALE'));
        } else {
          setError(res.message || '搜索出错了');
        }
      } catch (e) {
        setError('网络似乎开了小差，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      <Navbar />

      <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link
            to="/market"
            className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-4 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            返回市场
          </Link>

          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              "{query}" 的搜索结果
            </h1>
            <span className="text-slate-400 font-medium">
              {!loading && `共找到 ${products.length} 件宝贝`}
            </span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl aspect-[3/4] animate-pulse shadow-sm border border-slate-100"
                />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <PackageX size={32} />
              </div>
              <p className="text-slate-600 mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:underline"
              >
                刷新试试
              </button>
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Search size={40} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">没有找到相关商品</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                换个关键词试试？或者看看现在的热门推荐吧
              </p>
              <Link to="/market">
                <button className="px-8 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all hover:shadow-lg flex items-center gap-2">
                  <Sparkles size={18} />
                  浏览全部好物
                </button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {products.map((p) => (
                <motion.div key={p.id} variants={itemVariants} layout>
                  <ProductCard product={mapToCardProduct(p)} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchResults;
