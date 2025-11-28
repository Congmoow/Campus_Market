import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CheckCircle, Clock, Package, ChevronRight, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../api';

const MyOrders = () => {
  const [activeTab, setActiveTab] = useState('BUY'); // BUY, SELL
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // ALL, PENDING, DONE, CANCELLED
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmingOrder, setConfirmingOrder] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const role = activeTab; // BUY or SELL
        const status = selectedStatus === 'ALL' ? undefined : selectedStatus;
        const res = await orderApi.getMyOrders(role, status);
        if (res.success) {
          setOrders(res.data || []);
        } else {
          setError(res.message || '加载订单失败');
        }
      } catch (e) {
        console.error('加载订单失败', e);
        setError('加载订单失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [activeTab, selectedStatus]);

  const filteredOrders = orders;

  const getStatusConfig = (status) => {
    switch(status) {
      case 'PENDING':
        return { label: '进行中', color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock };
      case 'DONE':
        return { label: '已收货', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle };
      case 'CANCELLED':
        return { label: '已取消', color: 'text-slate-500', bg: 'bg-slate-100', icon: Package };
      default:
        return { label: status, color: 'text-slate-600', bg: 'bg-slate-50', icon: Package };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-32">
        {/* Header */}
        <div className="mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-slate-900 flex items-center gap-3"
          >
            <span className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
              <ShoppingBag size={28} />
            </span>
            我的订单
          </motion.h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-200 mb-8">
          {['BUY', 'SELL'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 text-lg font-medium transition-all relative ${
                activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'BUY' ? '我买到的' : '我卖出的'}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Filter & List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
          {/* Status Filter */}
          <div className="p-6 border-b border-slate-50 flex gap-2 overflow-x-auto no-scrollbar">
            {['ALL', 'PENDING', 'DONE'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedStatus === status 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status === 'ALL' ? '全部订单' : 
                 status === 'PENDING' ? '进行中' :
                 '已收货'}
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="text-center py-20 text-slate-400 text-sm">加载中...</div>
            ) : error ? (
              <div className="text-center py-20 text-red-500 text-sm">{error}</div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => {
                const statusCfg = getStatusConfig(order.status);
                const StatusIcon = statusCfg.icon;
                const isBuy = activeTab === 'BUY';
                const otherName = isBuy ? (order.sellerName || '同学') : (order.buyerName || '同学');
                const seed = isBuy ? (order.sellerId || otherName) : (order.buyerId || otherName);
                const avatar = isBuy
                  ? (order.sellerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`)
                  : (order.buyerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/40 hover:border-blue-100 transition-all duration-300 group"
                  >
                    {/* Order Header */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50">
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="font-mono">#{order.id}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span>{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                        <StatusIcon size={14} />
                        <span className="text-xs font-bold">{statusCfg.label}</span>
                      </div>
                    </div>

                    {/* Order Content */}
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="w-32 h-32 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-100">
                        <img 
                          src={order.productImage} 
                          alt={order.productTitle} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{order.productTitle}</h3>
                            <span className="text-lg font-bold text-slate-900">¥{order.price}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-5 h-5 rounded-full bg-slate-100 overflow-hidden">
                              <img 
                                src={avatar}
                                alt="" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-sm text-slate-500">
                              {isBuy ? `卖家：${otherName}` : `买家：${otherName}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                           <button
                             className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
                             onClick={() => navigate(`/order/${order.id}`)}
                           >
                             查看详情 <ChevronRight size={16} />
                           </button>
                           {isBuy && order.status === 'PENDING' && (
                             <button
                               className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors flex items-center gap-2"
                               onClick={() => {
                                 setConfirmError('');
                                 setConfirmingOrder(order);
                               }}
                             >
                               确认收货
                             </button>
                           )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <ShoppingBag size={32} />
                </div>
                <p className="text-slate-500">暂无相关订单记录</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 确认收货弹窗 */}
      <AnimatePresence>
        {confirmingOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 relative"
            >
              <button
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-sm"
                onClick={() => !confirmLoading && setConfirmingOrder(null)}
              >
                关闭
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle size={22} />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-slate-900">确认已收货？</h3>
                  <p className="text-xs text-slate-500 mt-0.5">确认后订单状态将变为「已收货」，无法再次修改。</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl px-4 py-3 text-left text-sm text-slate-600 mb-4">
                <div className="line-clamp-1 font-medium text-slate-900 mb-1">{confirmingOrder.productTitle}</div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>金额：<span className="font-semibold text-slate-900">¥{confirmingOrder.price}</span></span>
                  <span>{new Date(confirmingOrder.createdAt).toLocaleString('zh-CN')}</span>
                </div>
              </div>

              {confirmError && (
                <div className="mb-3 text-xs text-red-500 text-left">{confirmError}</div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
                  onClick={() => !confirmLoading && setConfirmingOrder(null)}
                >
                  再想想
                </button>
                <button
                  className="px-5 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold shadow-md shadow-emerald-500/30 hover:bg-emerald-700 transition-colors disabled:bg-emerald-400"
                  disabled={confirmLoading}
                  onClick={async () => {
                    if (!confirmingOrder) return;
                    try {
                      setConfirmLoading(true);
                      setConfirmError('');
                      const res = await orderApi.confirm(confirmingOrder.id);
                      if (res.success && res.data) {
                        const updatedStatus = res.data.status;
                        setOrders(prev => prev.map(o => o.id === confirmingOrder.id ? { ...o, status: updatedStatus } : o));
                        setConfirmingOrder(null);
                      } else {
                        setConfirmError(res.message || '确认收货失败，请稍后重试');
                      }
                    } catch (e) {
                      console.error('确认收货失败', e);
                      setConfirmError('确认收货失败，请稍后重试');
                    } finally {
                      setConfirmLoading(false);
                    }
                  }}
                >
                  {confirmLoading ? '确认中...' : '确认收货'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyOrders;
