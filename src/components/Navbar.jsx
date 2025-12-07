import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, User, ShoppingBag, Menu, X, LogOut, Settings, Heart, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import AuthModal from './AuthModal';
import { userApi, chatApi } from '../api';

const formatNotificationTime = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // 初始化登录状态和用户信息
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });
  
  // 暂时使用模拟的消息通知数据，后续再接入后端接口
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const unreadCount = notifications.reduce((sum, n) => sum + (n.unreadCount || 0), 0);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unreadCount: 0 })));
    try {
      await chatApi.markAllRead();
    } catch (e) {
      console.error('标记消息已读失败', e);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!isLoggedIn) {
        setNotifications([]);
        return;
      }
      setNotificationsLoading(true);
      try {
        const res = await chatApi.getList();
        if (res.success) {
          const list = res.data || [];
          const mapped = list.map((s) => {
            const name = s.partnerName || '同学';
            const seed = s.partnerId || name;
            const avatar = s.partnerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
            return {
              id: s.id,
              sessionId: s.id,
              fromName: name,
              avatarUrl: avatar,
              preview: s.lastMessage || '暂无聊天记录',
              time: formatNotificationTime(s.lastTime),
              unreadCount: s.unreadCount || 0,
            };
          });
          setNotifications(mapped);
        }
      } catch (e) {
        console.error('加载通知失败', e);
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadNotifications();
  }, [isLoggedIn]);

  // 登录后从后端同步一次用户资料（含头像），并写回 localStorage，保证全站统一头像
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const baseUser = JSON.parse(userStr);
        if (!baseUser?.id) return;

        // 如果已经有头像 URL 就不重复请求
        if (baseUser.avatarUrl) {
          setCurrentUser(baseUser);
          return;
        }

        const res = await userApi.getProfile(baseUser.id);
        if (res.success && res.data) {
          const updatedUser = {
            ...baseUser,
            nickname: res.data.nickname || baseUser.nickname || baseUser.username,
            avatarUrl: res.data.avatarUrl || baseUser.avatarUrl,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        }
      } catch (e) {
        // 同步失败时静默忽略，保持现有头像占位
      }
    };

    if (isLoggedIn) {
      syncProfile();
    }
  }, [isLoggedIn]);

  // 监听 storage 变化（处理多窗口或组件间同步）
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      const userStr = localStorage.getItem('user');
      setCurrentUser(userStr ? JSON.parse(userStr) : null);
    };
    
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  useEffect(() => {
    const handleProfileUpdated = () => {
      const userStr = localStorage.getItem('user');
      setCurrentUser(userStr ? JSON.parse(userStr) : null);
    };
    window.addEventListener('user-profile-updated', handleProfileUpdated);
    return () => window.removeEventListener('user-profile-updated', handleProfileUpdated);
  }, []);

  const handleSearchSubmit = () => {
    const q = searchKeyword.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLoginSuccess = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    const userStr = localStorage.getItem('user');
    setCurrentUser(userStr ? JSON.parse(userStr) : null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    navigate('/');
  };

  // 获取头像 URL 或默认头像（统一使用后端 avatarUrl 字段）
  const avatarUrl = currentUser?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id || currentUser?.username || 'guest'}`;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
          isScrolled
            ? "bg-white/80 backdrop-blur-md border-slate-200/50 py-3 shadow-sm"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
                <ShoppingBag size={24} />
              </div>
              <span className={cn(
                "text-xl font-bold tracking-tight transition-colors",
                isScrolled ? "text-slate-900" : "text-slate-800"
              )}>
                校园<span className="text-blue-600">集市</span>
              </span>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="搜索你感兴趣的物品..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                  }
                }}
                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-full bg-slate-100/50 focus:bg-white ring-1 ring-transparent focus:outline-none focus:ring-blue-500/20 focus:shadow-lg transition-all duration-300 text-sm placeholder:text-slate-400"
              />
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Notifications */}
              <div className="relative group" onMouseEnter={() => { if (unreadCount > 0) { markAllNotificationsRead(); } }}>
                <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
                  <Bell size={20} />
                  {isLoggedIn && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] leading-[18px] rounded-full border-2 border-white flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* 消息概览下拉框 */}
                {isLoggedIn && (
                  <div className="absolute right-0 top-full pt-2 w-80 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200 ease-out z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                        <span className="text-sm font-semibold text-slate-900">消息通知</span>
                        {unreadCount > 0 && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {unreadCount} 条未读
                          </span>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-xs text-slate-400 text-center">暂无新消息</div>
                        ) : (
                          notifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => navigate(`/chat?sessionId=${n.sessionId}`)}
                              className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 text-left"
                            >
                              <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-xs font-medium text-slate-500">
                                {n.avatarUrl ? (
                                  <img src={n.avatarUrl} alt={n.fromName} className="w-full h-full object-cover" />
                                ) : (
                                  n.fromName?.[0] || '聊'
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-slate-900 truncate">{n.fromName}</span>
                                  <span className="text-[11px] text-slate-400 ml-2 whitespace-nowrap">{n.time}</span>
                                </div>
                                <p className="text-xs text-slate-500 truncate">{n.preview}</p>
                              </div>
                              {n.unreadCount > 0 && (
                                <span className="mt-1 w-2 h-2 rounded-full bg-blue-500"></span>
                              )}
                            </button>
                          ))
                        )}
                      </div>

                      <div
                        className="px-4 py-2 border-t border-slate-100 text-xs text-blue-600 hover:bg-blue-50 cursor-pointer text-center"
                        onClick={() => navigate('/chat')}
                      >
                        查看全部消息
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar / Login Area */}
              {isLoggedIn ? (
                <div className="relative group">
                  <Link to={`/user/${currentUser?.id}`} className="block w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <img 
                        src={avatarUrl} 
                        alt="User" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Hover Menu */}
                  <div className="absolute right-0 top-full pt-2 w-56 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200 ease-out z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 overflow-hidden">
                      <Link to={`/user/${currentUser?.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors mb-1">
                        <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden">
                           <img src={avatarUrl} alt="" className="w-full h-full object-cover"/>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{currentUser?.nickname || currentUser?.username}</p>
                        </div>
                      </Link>
                      <div className="h-px bg-slate-100 my-1" />
                      <Link to="/my-products" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                        <Package size={16} />
                        我的发布
                      </Link>
                      <Link to="/my-orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                        <ShoppingBag size={16} />
                        我的订单
                      </Link>
                      <Link to="/my-favorites" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                        <Heart size={16} />
                        我的收藏
                      </Link>
                      <div className="h-px bg-slate-100 my-1" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut size={16} />
                        退出登录
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <User size={20} />
                </button>
              )}

              <Link to="/publish">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full shadow-lg shadow-blue-500/30 font-medium transition-all"
                >
                  <Plus size={18} />
                  <span>发布闲置</span>
                </motion.button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="relative">
                <button
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
                  onClick={() => {
                    const next = !showMobileNotifications;
                    setShowMobileNotifications(next);
                    if (next && unreadCount > 0) {
                      markAllNotificationsRead();
                    }
                  }}
                >
                  <Bell size={20} />
                  {isLoggedIn && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] leading-[18px] rounded-full border-2 border-white flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {isLoggedIn && showMobileNotifications && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                    <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-900">消息通知</span>
                      {unreadCount > 0 && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {unreadCount} 条未读
                        </span>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-xs text-slate-400 text-center">暂无新消息</div>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => {
                              navigate(`/chat?sessionId=${n.sessionId}`);
                              setShowMobileNotifications(false);
                            }}
                            className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 text-left"
                          >
                            <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-xs font-medium text-slate-500">
                              {n.avatarUrl ? (
                                <img src={n.avatarUrl} alt={n.fromName} className="w-full h-full object-cover" />
                              ) : (
                                n.fromName?.[0] || '聊'
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-slate-900 truncate">{n.fromName}</span>
                                <span className="text-[11px] text-slate-400 ml-2 whitespace-nowrap">{n.time}</span>
                              </div>
                              <p className="text-xs text-slate-500 truncate">{n.preview}</p>
                            </div>
                            {n.unreadCount > 0 && (
                              <span className="mt-1 w-2 h-2 rounded-full bg-blue-500"></span>
                            )}
                          </button>
                        ))
                      )}
                    </div>

                    <button
                      className="w-full px-4 py-2 border-t border-slate-100 text-xs text-blue-600 hover:bg-blue-50 text-center"
                      onClick={() => {
                        navigate('/chat');
                        setShowMobileNotifications(false);
                      }}
                    >
                      查看全部消息
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  setShowMobileNotifications(false);
                }}
                className="p-2 text-slate-600"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-[70px] z-40 bg-white/95 backdrop-blur-lg md:hidden p-4"
          >
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="搜索..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                    setIsMobileMenuOpen(false);
                  }
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 border-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <Link to="/publish" className="w-full">
                <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30">
                  发布闲置
                </button>
              </Link>
              
              <div className="flex flex-col gap-2 mt-4">
                {isLoggedIn ? (
                  <>
                    <Link to={`/user/${currentUser?.id}`} className="p-3 hover:bg-slate-50 rounded-lg flex items-center gap-3 text-slate-700">
                      <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover"/>
                      </div>
                      {currentUser?.nickname || "个人主页"}
                    </Link>
                    <Link to="/my-products" className="p-3 hover:bg-slate-50 rounded-lg flex items-center gap-3 text-slate-700">
                      <Package size={20} /> 我的发布
                    </Link>
                    <Link to="/my-orders" className="p-3 hover:bg-slate-50 rounded-lg flex items-center gap-3 text-slate-700">
                      <ShoppingBag size={20} /> 我的订单
                    </Link>
                    <Link to="/my-favorites" className="p-3 hover:bg-slate-50 rounded-lg flex items-center gap-3 text-slate-700">
                      <Heart size={20} /> 我的收藏
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="p-3 hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-3 text-left"
                    >
                      <LogOut size={20} /> 退出登录
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-3 hover:bg-slate-50 rounded-lg flex items-center gap-3 text-slate-700 text-left"
                  >
                    <User size={20} /> 登录 / 注册
                  </button>
                )}
                <div className="p-3 hover:bg-slate-50 rounded-lg flex items-center gap-3 text-slate-700">
                  <Bell size={20} /> 消息通知
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
