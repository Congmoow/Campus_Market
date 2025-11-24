import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <h1 className="text-9xl font-black text-slate-200">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-slate-800 bg-slate-50 px-4">
              页面走丢了
            </span>
          </div>
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 text-lg mb-10"
        >
          你访问的页面似乎不存在，或者已经被删除了。
          <br />
          如果是点击商品链接进来的，可能商品已经下架啦。
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/">
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 justify-center">
              <Home size={18} />
              返回首页
            </button>
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold border border-slate-200 transition-all flex items-center gap-2 justify-center"
          >
            <ArrowLeft size={18} />
            返回上一页
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
