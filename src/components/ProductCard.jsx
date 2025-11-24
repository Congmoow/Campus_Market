import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { favoriteApi } from '../api';

const ProductCard = ({ product }) => {
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
          
          <div className="absolute top-3 right-3">
            <button 
              className="p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-white text-slate-600 hover:text-red-500 transition-all shadow-sm hover:shadow-md transform hover:scale-110"
              onClick={(e) => {
                e.preventDefault();
                if (!product?.id) return;
                try {
                  favoriteApi.add(product.id);
                } catch (err) {
                  // 静默失败，后续可接入全局提示
                  console.error('收藏失败', err);
                }
              }}
            >
              <Heart size={18} />
            </button>
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
