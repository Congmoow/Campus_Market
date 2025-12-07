import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { CheckCircle2, MessageCircle, ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderApi, chatApi } from '../api';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      try {
        setLoading(true);
        setError('');
        const res = await orderApi.getDetail(orderId);
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          setError(res.message || '加载订单详情失败');
        }
      } catch (e) {
        console.error('加载订单详情失败', e);
        setError('加载订单详情失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const handleContactSeller = async () => {
    if (!order || !order.productId) {
      navigate('/chat');
      return;
    }
    try {
      const res = await chatApi.startChat(order.productId);
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
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="pt-32 max-w-2xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-slate-900 mb-4"
        >
          拍下成功！
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-500 text-lg mb-8 max-w-md"
        >
          请尽快联系卖家确认交易时间和地点。记得在当面交易时仔细检查商品哦。
        </motion.p>

        {/* Order brief info */}
        {orderId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="w-full mb-8"
          >
            {loading && (
              <div className="text-xs text-slate-400 py-3">正在加载订单信息...</div>
            )}
            {!loading && error && (
              <div className="text-xs text-red-500 py-3">{error}</div>
            )}
            {!loading && !error && order && (
              <div className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 text-sm text-slate-600 flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">订单号</span>
                  <span className="font-mono text-xs text-slate-700">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">商品</span>
                  <span className="font-medium text-slate-900 line-clamp-1 max-w-[60%] text-right">{order.productTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">金额</span>
                  <span className="font-semibold text-blue-600">¥{order.price}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="w-full space-y-4"
        >
          <button
            onClick={handleContactSeller}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            联系卖家
          </button>
          
          <Link to={orderId ? `/order/${orderId}` : '/my-orders'} className="block w-full">
            <button className="w-full py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-bold border border-slate-200 transition-all flex items-center justify-center gap-2">
              查看订单详情
              <ArrowRight size={20} />
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
