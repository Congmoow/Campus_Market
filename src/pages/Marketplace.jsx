import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { Filter } from 'lucide-react';
import { productApi } from '../api';
import openRafiki from '../assets/open-rafiki.svg';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const SORT_OPTIONS = ["最新发布", "价格最低", "价格最高", "最多浏览"];

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

const Marketplace = () => {
  const [categories, setCategories] = useState([{ id: null, name: '全部' }]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [sortBy, setSortBy] = useState('最新发布');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortKey = (label) => {
    switch (label) {
      case '价格最低':
        return 'priceAsc';
      case '价格最高':
        return 'priceDesc';
      case '最多浏览':
        return 'viewDesc';
      default:
        return 'latest';
    }
  };

  const loadProducts = async (categoryId, sortLabel, currentMaxPrice) => {
    try {
      setLoading(true);
      setError('');
      const params = {
        sort: sortKey(sortLabel),
        page: 0,
        size: 20,
        maxPrice: currentMaxPrice < 1000 ? currentMaxPrice : undefined
      };
      if (categoryId) {
        params.categoryId = categoryId;
      }
      const res = await productApi.getList(params);
      if (res.success) {
        setProducts(res.data?.content || []);
      } else {
        setError(res.message || '加载商品列表失败');
      }
    } catch (e) {
      setError('加载商品列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await productApi.getCategories();
        if (res.success && Array.isArray(res.data)) {
          setCategories([{ id: null, name: '全部' }, ...res.data]);
        }
      } catch (e) {
        // 分类加载失败时忽略，仍然可以看全部商品
      }
    };
    init();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(selectedCategoryId, sortBy, maxPrice);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, sortBy, maxPrice]);

  // 只展示实际在售的商品，过滤掉已删除 / 已售出等状态
  const visibleProducts = products.filter((p) => p.status === 'ON_SALE');

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      
      <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Filters */}
        <div className="mb-8">
          <div className="flex items-start gap-6">
            <div className="hidden md:block w-64 h-64 lg:w-72 lg:h-72 flex-shrink-0">
              <img
                src={openRafiki}
                alt="发现好物插画"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">发现好物</h1>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 pb-2 lg:pb-0">
                    {categories.map((cat) => (
                      <button
                        key={cat.id ?? 'all'}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                          selectedCategoryId === cat.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                            : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Sort & Filter Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsSortOpen((prev) => !prev)}
                        className="inline-flex items-center justify-between gap-2 min-w-[120px] px-4 py-2 bg-white rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-100 shadow-sm transition-all"
                      >
                        <span>{sortBy}</span>
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 text-slate-500 transition-colors transform transition-transform duration-300 ${
                            isSortOpen ? 'rotate-180' : 'rotate-0'
                          }`}
                        >
                          <Filter size={14} />
                        </span>
                      </button>

                      {isSortOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-lg border border-slate-100 py-1 z-20">
                          {SORT_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setSortBy(opt);
                                setIsSortOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between rounded-xl transition-colors ${
                                sortBy === opt
                                  ? 'bg-blue-50 text-blue-600 font-semibold'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>{opt}</span>
                              {sortBy === opt && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Range Slider */}
                <div className="px-2 max-w-2xl mt-8">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-4">
                    <span className="ml-1">价格区间</span>
                    <span className="text-slate-600">
                      ¥0 - {maxPrice === 1000 ? '¥1k+' : `¥${maxPrice}`}
                    </span>
                  </div>
                  <div className="px-2">
                    <Slider
                      min={0}
                      max={1000}
                      step={10}
                      value={maxPrice}
                      onChange={(value) => setMaxPrice(value)}
                      marks={{
                        0: '¥0',
                        200: '¥200',
                        400: '¥400',
                        600: '¥600',
                        800: '¥800',
                        1000: '¥1k+',
                      }}
                      trackStyle={{ backgroundColor: '#334155', height: 6 }} // slate-700
                      railStyle={{ backgroundColor: '#e2e8f0', height: 6 }}   // slate-200
                      handleStyle={{
                        borderColor: '#334155',
                        height: 20,
                        width: 20,
                        marginTop: -7,
                        backgroundColor: '#ffffff',
                        opacity: 1,
                        borderWidth: 4,
                        boxShadow: 'none',
                      }}
                      dotStyle={{
                        borderColor: '#e2e8f0',
                        backgroundColor: '#ffffff',
                        borderWidth: 4,
                        bottom: -9,
                        width: 20,
                        height: 20,
                      }}
                      activeDotStyle={{
                        borderColor: '#334155',
                        backgroundColor: '#ffffff',
                        borderWidth: 4,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Grid */}
        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-slate-400 text-sm">正在加载商品...</div>
          ) : visibleProducts.length === 0 ? (
            <div className="col-span-full text-center text-slate-400 text-sm">当前没有在售商品，试试其他分类或稍后再来看看～</div>
          ) : (
            visibleProducts.map((p) => <ProductCard key={p.id} product={mapToCardProduct(p)} />)
          )}
        </div>
        
        {/* Load More */}
        {!loading && visibleProducts.length > 8 && (
          <div className="mt-16 text-center">
            <button className="px-8 py-3 bg-white border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md">
              加载更多商品
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
