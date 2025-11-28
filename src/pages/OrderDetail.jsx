import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Package, 
  Clock, 
  CreditCard, 
  MapPin, 
  MessageCircle, 
  CheckCircle, 
  Truck, 
  ShoppingBag, 
  Copy, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { orderApi, chatApi } from '../api';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await orderApi.getDetail(id);
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
  }, [id]);

  const handleContact = async () => {
    if (!order || !order.productId) {
      navigate('/chat');
      return;
    }
    try {
      const res = await chatApi.startChat(order.productId);
      if (res.success && res.data) {
        const sessionId = res.data.id;
        navigate(sessionId ? `/chat?sessionId=${sessionId}` : '/chat');
      } else {
        navigate('/chat');
      }
    } catch (e) {
      console.error('发起聊天失败', e);
      navigate('/chat');
    }
  };

  const handleConfirmReceipt = async () => {
    if (!order) return;
    try {
      setConfirmLoading(true);
      const res = await orderApi.confirm(order.id);
      if (res.success && res.data) {
        setOrder(prev => ({ ...prev, status: res.data.status }));
      } else {
        alert(res.message || '确认收货失败');
      }
    } catch (e) {
      console.error('确认收货失败', e);
      alert('确认收货失败，请稍后重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'PENDING':
        return { 
          label: '进行中', 
          desc: '等待双方交易，请保持沟通',
          color: 'text-orange-600', 
          bg: 'bg-orange-50', 
          border: 'border-orange-100',
          icon: Clock,
          progress: 1
        };
      case 'DONE':
        return { 
          label: '已完成', 
          desc: '交易顺利完成，期待下次合作',
          color: 'text-emerald-600', 
          bg: 'bg-emerald-50', 
          border: 'border-emerald-100',
          icon: CheckCircle,
          progress: 3
        };
      case 'CANCELLED':
        return { 
          label: '已取消', 
          desc: '订单已取消',
          color: 'text-slate-500', 
          bg: 'bg-slate-100', 
          border: 'border-slate-200',
          icon: Package,
          progress: 0
        };
      default:
        return { 
          label: status, 
          desc: '状态未知',
          color: 'text-slate-600', 
          bg: 'bg-slate-50', 
          border: 'border-slate-200',
          icon: Package,
          progress: 0
        };
    }
  };

  const currentUser = React.useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">加载订单详情...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">无法加载订单</h2>
          <p className="text-slate-500 mb-8">{error || '找不到该订单信息'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  const statusCfg = getStatusConfig(order.status);
  const StatusIcon = statusCfg.icon;
  
  // 判断当前用户角色
  // 如果当前用户ID等于订单买家ID，则我是买家，对方是卖家
  // 否则（或我是卖家），对方是买家
  const isBuyer = currentUser && String(currentUser.id) === String(order.buyerId);
  
  // 获取对方信息
  const partnerName = isBuyer ? (order.sellerName || order.sellerId || '卖家') : (order.buyerName || order.buyerId || '买家');
  const partnerRole = isBuyer ? '卖家' : '买家';
  const partnerId = isBuyer ? order.sellerId : order.buyerId;
  const rawAvatar = isBuyer ? order.sellerAvatar : order.buyerAvatar;
  const avatar = rawAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(partnerId || partnerName)}`;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <Navbar />
      
      {/* Top Background Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-blue-50 via-indigo-50/50 to-transparent pointer-events-none" />

      <motion.div 
        className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-28"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Navigation */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-400 transition-colors">
            <ChevronLeft size={18} />
          </div>
          <span className="font-medium">返回列表</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Card */}
            <motion.div 
              variants={itemVariants}
              className={`relative overflow-hidden rounded-3xl p-8 ${statusCfg.bg} border ${statusCfg.border} shadow-sm`}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <StatusIcon size={32} className={statusCfg.color} />
                  <h1 className={`text-2xl font-bold ${statusCfg.color}`}>{statusCfg.label}</h1>
                </div>
                <p className="text-slate-600 opacity-80 font-medium ml-11">{statusCfg.desc}</p>
                
                {/* Progress Steps (Simplified) */}
                <div className="mt-8 ml-2 flex items-center gap-2 relative">
                  {[1, 2, 3].map((step, idx) => {
                    const active = statusCfg.progress >= step;
                    return (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center gap-2 relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500 ${
                            active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-400 border border-slate-200'
                          }`}>
                            {step}
                          </div>
                        </div>
                        {step < 3 && (
                          <div className={`h-1 flex-1 rounded-full mx-2 transition-colors duration-500 ${
                            statusCfg.progress > step ? 'bg-blue-600' : 'bg-slate-200'
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-500 mt-2 px-1">
                  <span>已拍下</span>
                  <span className="text-center">交易中</span>
                  <span className="text-right">已完成</span>
                </div>
              </div>
              
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-48 h-48 bg-white opacity-40 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-current opacity-5 blur-2xl rounded-full pointer-events-none" />
            </motion.div>

            {/* Combined Order Info Card */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Package size={20} className="text-blue-500" />
                  <h2>订单详情</h2>
                </div>
              </div>
              
              <div className="p-6">
                {/* Product Section */}
                <div className="flex gap-6 mb-8 pb-8 border-b border-slate-50 border-dashed">
                  <div className="w-28 h-28 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 shadow-inner flex-shrink-0">
                    <img 
                      src={order.productImage} 
                      alt={order.productTitle} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-relaxed">
                        {order.productTitle}
                      </h3>
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium border border-slate-100">
                        <TagIcon type="二手" />
                        <span>{order.condition || '九成新'}</span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold text-blue-600 tracking-tight">
                        <span className="text-base align-top mr-0.5 font-normal text-slate-500">¥</span>{order.price}
                      </div>
                      <span className="text-slate-400 text-sm font-medium">x1</span>
                    </div>
                  </div>
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-1 gap-y-4">
                  <InfoRow label="订单编号" value={order.id} copyable />
                  <InfoRow label="创建时间" value={new Date(order.createdAt).toLocaleString('zh-CN')} />
                  <InfoRow label="交易方式" value="线下面交" />
                  <InfoRow label="支付方式" value="在线支付" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Counterparty Card */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6"
            >
              <div className="text-center">
                <div 
                  className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-1 mb-4 relative group cursor-pointer"
                  onClick={() => navigate(`/user/${partnerId}`)}
                >
                  <img 
                    src={avatar} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
                </div>
                <h3 
                  className="text-lg font-bold text-slate-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => navigate(`/user/${partnerId}`)}
                >
                  {partnerName}
                </h3>
                <p className="text-sm text-slate-500 mb-6">{partnerRole}</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleContact}
                    className="col-span-2 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  >
                    <MessageCircle size={18} />
                    联系对方
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Actions Card */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-24"
            >
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600 rounded-full" />
                订单操作
              </h3>
              <div className="space-y-3">
                {order.status === 'PENDING' && (
                  <button 
                    onClick={handleConfirmReceipt}
                    disabled={confirmLoading}
                    className="w-full py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {confirmLoading ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                    确认收货
                  </button>
                )}
                
                <button className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  <AlertCircle size={18} />
                  举报/投诉
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-50">
                <p className="text-xs text-slate-400 leading-relaxed text-center">
                  如遇交易纠纷，请及时联系客服介入处理。
                  <br />
                  为了您的资金安全，请勿脱离平台交易。
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const InfoRow = ({ label, value, copyable }) => (
  <div className="flex justify-between items-center text-sm group">
    <span className="text-slate-500">{label}</span>
    <div className="flex items-center gap-2 text-slate-900 font-medium">
      <span className="font-mono">{value}</span>
      {copyable && (
        <button 
          onClick={() => navigator.clipboard.writeText(value)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
          title="复制"
        >
          <Copy size={14} />
        </button>
      )}
    </div>
  </div>
);

const TagIcon = ({ type }) => {
  // Simplified tag component
  return null;
};

export default OrderDetail;
