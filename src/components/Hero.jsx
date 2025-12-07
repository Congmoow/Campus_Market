import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, BookOpen, Bike } from 'lucide-react';
import { Link } from 'react-router-dom';
import LazyLottie from './LazyLottie';
import shoppingCartAnimation from '../assets/shopping-cart.json';
import mobileEarnAnimation from '../assets/men-using-mobile-and-earn-money.json';


const FloatingIcon = ({ icon: Icon, delay, className }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: -20 }}
    transition={{
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      delay: delay
    }}
    className={`absolute hidden lg:flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl shadow-blue-500/10 ${className}`}
  >
    <Icon size={32} className="text-blue-600" />
  </motion.div>
);

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-100/50 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-100/40 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl opacity-40 -translate-x-1/4 translate-y-1/4"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* 左侧购物车动画 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute left-0 top-1/2 -translate-y-1/2 hidden xl:block"
        >
          <div className="w-[200px] h-[200px]">
            <LazyLottie 
              animationData={shoppingCartAnimation}
              loop={true}
              className="w-full h-full drop-shadow-lg"
            />
          </div>
        </motion.div>

        {/* 右侧手机赚钱动画 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:block"
        >
          <div className="w-[350px] h-[350px]">
            <LazyLottie 
              animationData={mobileEarnAnimation}
              loop={true}
              className="w-full h-full drop-shadow-lg"
            />
          </div>
        </motion.div>

        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-blue-100 shadow-sm"
          >
            <Sparkles size={16} />
            <span>校园安全交易首选平台</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight"
          >
            让闲置好物
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mt-2">
              在校园里流动起来
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            连接全校师生，打造最安全、便捷的二手交易社区。
            <br className="hidden sm:block" />
            书籍教材、数码产品、生活好物，一站式搞定。
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/market" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2 group">
                立即开始探索
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
