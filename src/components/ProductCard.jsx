import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { favoriteApi } from '../api';

// 商品卡片组件：展示商品缩略图、价格、位置、卖家信息，并支持收藏/取消收藏
// 使用模块级缓存避免对收藏列表的重复请求
let favoriteIdsCache = null; // Set<number>
let favoriteIdsPromise = null;

const loadFavoriteIds = async () => {
  if (favoriteIdsCache) return favoriteIdsCache;
  if (!favoriteIdsPromise) {
    favoriteIdsPromise = (async () => {
      try {
        const res = await favoriteApi.listMy();
        if (res.success) {
          const ids = new Set((res.data || []).map((p) => p.id));
          favoriteIdsCache = ids;
          return ids;
        }
      } catch (e) {
        // 静默失败，视为没有收藏
      }
      const empty = new Set();
      favoriteIdsCache = empty;
      return empty;
    })();
  }
  return favoriteIdsPromise;
};

export const invalidateFavoriteIdsCache = () => {
  favoriteIdsCache = null;
  favoriteIdsPromise = null;
};

const ProductCard = ({ product, isSold = false }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteTip, setFavoriteTip] = useState('');

  useEffect(() => {
    let mounted = true;
    if (!product?.id) return;
    (async () => {
      const ids = await loadFavoriteIds();
      if (!mounted) return;
      setIsFavorite(ids.has(product.id));
    })();
    return () => {
      mounted = false;
    };
  }, [product?.id]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    if (!product?.id) return;

    const next = !isFavorite;
    setIsFavorite(next);
    try {
      if (next) {
        await favoriteApi.add(product.id);
        if (favoriteIdsCache) favoriteIdsCache.add(product.id);
      } else {
        await favoriteApi.remove(product.id);
        if (favoriteIdsCache) favoriteIdsCache.delete(product.id);
      }
      setFavoriteTip(next ? '已加入收藏' : '已取消收藏');
      setTimeout(() => {
        setFavoriteTip('');
      }, 1500);
    } catch (err) {
      // 接口失败时回滚本地状态，避免与实际不一致
      console.error('收藏操作失败', err);
      setIsFavorite(!next);
      setFavoriteTip('收藏操作失败，请稍后重试');
      setTimeout(() => {
        setFavoriteTip('');
      }, 2000);
    }
  };
  return (
    <Link to={`/product/${product.id}`} className="block h-full">
      <motion.div
        whileHover={{ y: -8 }}
        className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 h-full flex flex-col"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {isSold && (
            <div className="absolute inset-0 pointer-events-none">
              <img
                src="/images/sold-out.jpg"
                alt="已售出"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
            <button 
              className={`p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition-all shadow-sm hover:shadow-md transform hover:scale-110 ${
                isFavorite ? 'text-rose-500' : 'text-slate-600 hover:text-red-500'
              }`}
              onClick={handleToggleFavorite}
            >
              <Heart size={18} className={isFavorite ? 'fill-rose-500' : ''} />
            </button>
            {favoriteTip && (
              <div className="px-3 py-1 rounded-full bg-slate-900/90 text-white text-xs shadow-lg whitespace-nowrap">
                {favoriteTip}
              </div>
            )}
          </div>
          
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-slate-700 shadow-sm flex items-center gap-1">
              <MapPin size={12} className="text-blue-500" />
              {product.location}
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {product.title}
            </h3>
            <span className="font-bold text-lg text-blue-600">
              ¥{product.price}
            </span>
          </div>
          
          <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <img 
                src={product.seller.avatar} 
                alt={product.seller.name}
                className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
              />
              <span className="truncate max-w-[80px]">{product.seller.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{product.timeAgo}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
