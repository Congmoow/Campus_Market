import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Heart, Share2, MessageCircle, ShieldCheck, ShoppingBag, Eye } from 'lucide-react';
import { productApi, chatApi, favoriteApi } from '../api';
import { invalidateFavoriteIdsCache } from '../components/ProductCard';

const formatTimeFromString = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) return `${diffMinutes || 1}分钟前`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}小时前`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN');
};

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteTip, setFavoriteTip] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await productApi.getDetail(id);
        if (res.success) {
          const p = res.data;
          const timeAgo = formatTimeFromString(p.createdAt);
          const images = p.images && p.images.length > 0
            ? p.images
            : ['https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&q=80&w=800'];
          const sellerAvatar = p.sellerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.sellerId || p.sellerName || p.id}`;

          setProduct({
            id: p.id,
            title: p.title,
            price: p.price,
            originalPrice: p.originalPrice,
            description: p.description,
            images,
            location: p.location || '校内',
            timeAgo,
            viewCount: p.viewCount ?? 0,
            seller: {
              id: p.sellerId,
              name: p.sellerName || '同学',
              major: '在校学生',
              credit: '信用良好',
              avatar: sellerAvatar,
            },
          });
        } else {
          setError(res.message || '加载商品详情失败');
        }
      } catch (e) {
        setError('加载商品详情失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadDetail();
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        await productApi.increaseView(id);
      } catch (e) {
        // 浏览量增加失败不影响主流程，静默忽略
      }
    })();
  }, [id]);

  // 根据当前用户收藏列表初始化详情页爱心状态
  useEffect(() => {
    let cancelled = false;
    const loadFavoriteState = async () => {
      if (!id) return;
      try {
        const res = await favoriteApi.listMy();
        if (!res.success || cancelled) return;
        const list = res.data || [];
        const ids = new Set(list.map((p) => p.id));
        setIsFavorite(ids.has(Number(id)));
      } catch (e) {
        // 静默失败，不影响其他逻辑
      }
    };

    loadFavoriteState();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!product?.id) return;
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      if (next) {
        await favoriteApi.add(product.id);
      } else {
        await favoriteApi.remove(product.id);
      }
      invalidateFavoriteIdsCache();
      setFavoriteTip(next ? '已加入收藏' : '已取消收藏');
      setTimeout(() => {
        setFavoriteTip('');
      }, 1500);
    } catch (e) {
      console.error('收藏操作失败', e);
      setIsFavorite(!next);
      setFavoriteTip('收藏操作失败，请稍后重试');
      setTimeout(() => {
        setFavoriteTip('');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      
      <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading && (
          <div className="text-center text-slate-400 text-sm py-20">正在加载商品详情...</div>
        )}
        {error && !loading && (
          <div className="text-center text-red-500 text-sm py-20">{error}</div>
        )}
        {!loading && !error && product && (
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100 group">
              <img 
                src={product.images[0]} 
                alt={product.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all opacity-80 hover:opacity-100">
                   <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-start justify-between mb-4">
                 <h1 className="text-3xl font-bold text-slate-900 leading-tight">{product.title}</h1>
                 <div className="flex gap-2 items-center">
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-600 shadow-sm"
                      title="浏览量"
                    >
                      <Eye size={16} />
                      {(product.viewCount ?? 0)} 人看过
                    </span>
                    <button className="p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <Share2 size={20} />
                    </button>
                    <div className="relative">
                      <button
                        className={`p-2.5 rounded-full bg-slate-100 transition-colors ${
                          isFavorite
                            ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
                            : 'text-slate-600 hover:bg-red-50 hover:text-red-500'
                        }`}
                        onClick={handleToggleFavorite}
                      >
                        <Heart size={20} className={isFavorite ? 'fill-rose-500' : ''} />
                      </button>
                      {favoriteTip && (
                        <div className="absolute right-0 mt-2 px-3 py-1 rounded-full bg-slate-900/90 text-white text-xs shadow-lg whitespace-nowrap">
                          {favoriteTip}
                        </div>
                      )}
                    </div>
                 </div>
              </div>
              
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-4xl font-bold text-blue-600">¥{product.price}</span>
                <span className="text-lg text-slate-400 line-through">原价 ¥{product.originalPrice}</span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-8">
                <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                    <MapPin size={14} className="text-blue-500" />
                    {product.location}
                </span>
                <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                    <Clock size={14} className="text-blue-500" />
                    {product.timeAgo}
                </span>
                <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                    <ShieldCheck size={14} className="text-green-500" />
                    {product.seller.credit}
                </span>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold mb-3 text-slate-900">商品描述</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                </p>
              </div>
            </div>

            {/* Seller Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <Link to={product.seller.id ? `/user/${product.seller.id}` : '#'} className="flex items-center gap-4 group">
                    <img src={product.seller.avatar} alt="" className="w-14 h-14 rounded-full bg-slate-100 ring-2 ring-slate-50 group-hover:ring-blue-200 transition-all" />
                    <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{product.seller.name}</h3>
                        <p className="text-sm text-slate-500">{product.seller.major}</p>
                    </div>
                </Link>
                <Link to={product.seller.id ? `/user/${product.seller.id}` : '#'}>
                    <button className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors text-sm">
                        查看主页
                    </button>
                </Link>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 sticky bottom-0 bg-slate-50/80 backdrop-blur-md p-4 -mx-4 lg:static lg:p-0 lg:bg-transparent lg:mx-0">
                <Link to={`/checkout/${product.id}`} className="flex-1">
                    <button className="w-full py-4 bg-blue-600 text-white rounded-full font-bold text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2">
                        <ShoppingBag size={22} />
                        <span>拍下</span>
                    </button>
                </Link>
                <div className="flex-1">
                    <button
                      className="w-full py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2 hover:border-slate-300 active:scale-95"
                      onClick={async () => {
                        if (!product) return;
                        try {
                          const res = await chatApi.startChat(product.id);
                          if (res.success && res.data) {
                            const sessionId = res.data.id;
                            if (sessionId) {
                              navigate(`/chat?sessionId=${sessionId}`);
                            } else {
                              navigate('/chat');
                            }
                          } else {
                            alert(res.message || '发起聊天失败，请稍后重试');
                          }
                        } catch (e) {
                          console.error('发起聊天失败', e);
                          alert('发起聊天失败，请稍后重试');
                        }
                      }}
                    >
                        <MessageCircle size={20} />
                        联系卖家
                    </button>
                </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
