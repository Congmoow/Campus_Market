import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, School, ShieldCheck, X } from 'lucide-react';
import { authApi } from '../api';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    nickname: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await authApi.login({
          usernameOrPhone: formData.username, // 登录时复用 username 字段作为账号
          password: formData.password
        });
      } else {
        res = await authApi.register({
          username: formData.username,
          password: formData.password,
          phone: formData.phone,
          nickname: formData.nickname
        });
      }

      if (res.success) {
        // 保存 Token 和用户信息
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: res.data.userId,
          username: res.data.username,
          nickname: res.data.nickname
        }));
        
        onLoginSuccess();
        onClose();
      } else {
        // 不直接使用后端返回的 message，避免编码问题导致的乱码
        if (isLogin) {
          setError('账号或密码错误');
        } else {
          setError('注册信息有误，学号或手机号可能已被注册');
        }
      }
    } catch (err) {
      const status = err.response?.status;
      // 统一在前端给出友好的中文提示，不依赖后端 message
      if (isLogin) {
        if (status === 400 || status === 401) {
          setError('账号或密码错误');
        } else {
          setError('登录失败，请稍后重试');
        }
      } else {
        if (status === 400) {
          setError('注册信息有误，学号或手机号可能已被注册');
        } else {
          setError('注册失败，请稍后重试');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors md:text-white md:bg-white/10 md:hover:bg-white/20"
          >
            <X size={20} />
          </button>

          {/* Left Side - Branding */}
          <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-500 p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-2xl font-bold mb-2">
                <School size={32} />
                校园集市
              </div>
              <p className="text-blue-100">连接每一位同学的闲置好物</p>
            </div>

            <div className="relative z-10 space-y-6 mt-12 md:mt-0">
              <h2 className="text-3xl font-bold leading-tight">
                {isLogin ? "欢迎回来，\n同学！" : "加入我们，\n开启交易之旅"}
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
                {isLogin 
                  ? "登录你的校园账号，查看最新的闲置物品，管理你的发布和订单。" 
                  : "只需一分钟完成学号认证，即可在校内安全交易，享受便捷生活。"}
              </p>
            </div>

            <div className="relative z-10 flex gap-2 text-xs text-blue-200 mt-8">
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <ShieldCheck size={12} /> 实名认证
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <School size={12} /> 仅限本校
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-1/2 p-8 md:p-12 bg-white">
            <div className="h-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-1">
                {isLogin ? "账号登录" : "创建账号"}
              </h3>
              <p className="text-slate-500 text-sm mb-8">
                {isLogin ? "使用学号或手机号登录" : "请填写真实信息以便通过认证"}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 ml-1">昵称</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleInputChange}
                        placeholder="怎么称呼你"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 ml-1">
                    {isLogin ? "学号 / 手机号" : "学号"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder={isLogin ? "请输入学号或手机号" : "请输入10-12位学号"}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 ml-1">手机号</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail size={18} />
                      </div>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="用于接收通知"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 ml-1">密码</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="请输入密码"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                    />
                  </div>
                </div>

                {isLogin && (
                  <div className="flex justify-end">
                    <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium">忘记密码？</a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "处理中..." : (isLogin ? "登录" : "立即注册")}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                  {isLogin ? "还没有账号？" : "已有账号？"}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-1 text-blue-600 font-bold hover:underline focus:outline-none"
                  >
                    {isLogin ? "去注册" : "去登录"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
