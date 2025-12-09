import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import EditProfileModal from '../components/EditProfileModal';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, ShieldCheck, MessageCircle } from 'lucide-react';
import { userApi } from '../api';

import welcomeSvg from '../assets/welcome.svg';

// 将后端时间字符串格式化为“几分钟前 / 几小时前 / 几天前 / 日期”文案
const formatTime = (timeStr) => {
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

// 用户个人主页：展示头像、基本信息以及该用户的在售 / 已售商品
const UserProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState('ON_SALE'); // ON_SALE or SOLD

  const currentUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isCurrentUser = currentUser && String(currentUser.userId || currentUser.id) === id;

  const loadProductsByStatus = async (status) => {
    try {
      setLoading(true);
      setError('');

      const productsRes = await userApi.getUserProducts(id, status);
      if (productsRes.success) {
        const list = productsRes.data?.content || [];
        const mapped = list.map(p => ({
          id: p.id,
          title: p.title,
          price: p.price,
          description: '',
          image: p.thumbnail || 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&q=80&w=800',
          location: p.location || '校内',
          timeAgo: formatTime(p.createdAt),
          seller: {
            name: p.sellerName || (profile?.nickname || profile?.username || '同学'),
            avatar: p.sellerAvatar || profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.sellerId || p.id}`,
          },
        }));
        setProducts(mapped);
      } else {
        setError(productsRes.message || '加载商品列表失败');
      }
    } catch (e) {
      setError('加载商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const profileRes = await userApi.getProfile(id);
      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
      } else {
        setError(profileRes.message || '加载用户信息失败');
      }

      // 默认加载在售商品
      await loadProductsByStatus('ON_SALE');
    } catch (e) {
      setError('加载用户主页失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleProductTabClick = (tab) => {
    if (tab === activeProductTab) return;
    setActiveProductTab(tab);
    const status = tab === 'SOLD' ? 'SOLD' : 'ON_SALE';
    loadProductsByStatus(status);
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const handleEditSuccess = (updatedProfile) => {
    setProfile(updatedProfile);

    try {
      const stored = localStorage.getItem('user');
      if (!stored) return;
      const user = JSON.parse(stored);
      // 仅在当前用户编辑自己的资料时同步本地缓存
      if (String(user.id) === String(updatedProfile.id)) {
        const updatedUser = {
          ...user,
          nickname: updatedProfile.nickname || user.nickname || user.username,
          avatarUrl: updatedProfile.avatarUrl || user.avatarUrl,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('user-profile-updated'));
        }
      }
    } catch (e) {
      // 本地缓存更新失败时忽略
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      
      <div className="pt-32 max-w-5xl mx-auto px-4 sm:px-6">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 mb-8">
          {/* 顶部背景横幅 */}
          <div className="h-40 bg-gradient-to-r from-blue-600 to-cyan-500 relative rounded-t-3xl overflow-visible">
            <img
              src={welcomeSvg}
              alt="个人主页欢迎插画"
              className="absolute right-80 -top-24 h-72 sm:h-72 pointer-events-none select-none opacity-90"
            />
            {isCurrentUser && (
               <button 
                 onClick={() => setShowEditModal(true)}
                 className="absolute top-16 right-16 bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
               >
                 编辑个人信息
               </button>
            )}
          </div>
          
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="w-32 h-32 rounded-full shadow-xl">
                <img 
                  src={profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id || id || profile?.username || 'user'}`}
                  alt={profile?.nickname || profile?.username || '用户头像'} 
                  className="w-full h-full rounded-full bg-slate-100 object-cover"
                />
              </div>
              
              {!isCurrentUser && (
                <div className="flex gap-3 mb-2">
                  <Link to="/chat">
                    <button className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2">
                      <MessageCircle size={18} />
                      联系Ta
                    </button>
                  </Link>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* 左侧：用户基本信息 */}
              <div className="md:w-1/3 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    {profile?.nickname || profile?.username || '同学'}
                    <ShieldCheck className="text-blue-500" size={20} />
                  </h1>
                  <p className="text-slate-500 mt-1">{profile?.major || '专业未设置'} · {profile?.grade || '年级未设置'}</p>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-green-500" />
                    <span>信用分：<span className="font-bold text-slate-900">{profile?.credit ?? 700}</span> (极好)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{profile?.campus || '校内'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{profile?.joinAt ? new Date(profile.joinAt).toLocaleDateString('zh-CN') : '加入时间未知'}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm">个人简介</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {profile?.bio || '这个同学还没有填写个人简介～'}
                  </p>
                </div>
              </div>

              {/* 右侧：该用户的商品列表 */}
              <div className="flex-1">
                <div className="flex items-center gap-10 mb-6 border-b border-slate-100 pb-4">
                  <div
                    className={`relative cursor-pointer pb-1 border-b-2 transition-colors ${
                      activeProductTab === 'ON_SALE'
                        ? 'border-blue-500 text-slate-900'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                    onClick={() => handleProductTabClick('ON_SALE')}
                  >
                    <span className="text-lg font-bold">在售商品</span>
                    <span className="absolute -top-2 -right-4 bg-blue-100 text-blue-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {profile?.sellingCount ?? products.length}
                    </span>
                  </div>
                  <div
                    className={`relative cursor-pointer pb-1 border-b-2 transition-colors ${
                      activeProductTab === 'SOLD'
                        ? 'border-blue-500 text-slate-900'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                    onClick={() => handleProductTabClick('SOLD')}
                  >
                    <span className="text-lg font-bold">已卖出 {profile?.soldCount ?? 0}</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {loading ? (
                    <div className="col-span-full text-center py-12 text-slate-400 text-sm">
                      {activeProductTab === 'ON_SALE' ? '正在加载在售商品...' : '正在加载已卖出商品...'}
                    </div>
                  ) : products.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-400 text-sm">
                      {activeProductTab === 'ON_SALE' ? '暂无在售商品' : '暂无已卖出的商品'}
                    </div>
                  ) : (
                    products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isSold={activeProductTab === 'SOLD'}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentProfile={profile}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default UserProfile;
