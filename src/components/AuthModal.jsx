import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, X, KeyRound, ArrowLeft, Phone } from 'lucide-react';
import { authApi } from '../api';
import happyStudent from '../assets/storyset-happy-student.svg';

// 登录 / 注册 / 忘记密码统一弹窗组件
// 通过 mode 切换三种视图，并调用后端 auth 接口完成认证相关操作
const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  // 视图模式: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    nickname: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';
  const isForgot = mode === 'forgot';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setFormData({
      username: '',
      password: '',
      phone: '',
      nickname: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let res;
      if (isForgot) {
        // 忘记密码 - 重置密码
        if (formData.newPassword !== formData.confirmPassword) {
          setError('两次输入的密码不一致');
          setLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          setError('新密码长度不能少于6位');
          setLoading(false);
          return;
        }
        res = await authApi.resetPassword({
          username: formData.username,
          phone: formData.phone,
          newPassword: formData.newPassword
        });
        if (res.success) {
          setSuccess('密码重置成功！请使用新密码登录');
          setTimeout(() => {
            switchMode('login');
          }, 2000);
        } else {
          setError('密码重置失败，请检查学号和手机号是否正确');
        }
      } else if (isLogin) {
        res = await authApi.login({
          usernameOrPhone: formData.username,
          password: formData.password
        });
        if (res.success) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify({
            id: res.data.userId,
            username: res.data.username,
            nickname: res.data.nickname
          }));
          onLoginSuccess();
          onClose();
        } else {
          setError('账号或密码错误');
        }
      } else {
        res = await authApi.register({
          username: formData.username,
          password: formData.password,
          phone: formData.phone,
          nickname: formData.nickname
        });
        if (res.success) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify({
            id: res.data.userId,
            username: res.data.username,
            nickname: res.data.nickname
          }));
          onLoginSuccess();
          onClose();
        } else {
          setError('注册信息有误，学号或手机号可能已被注册');
        }
      }
    } catch (err) {
      const status = err.response?.status;
      if (isForgot) {
        if (status === 400) {
          setError('学号或手机号不正确');
        } else {
          setError('密码重置失败，请稍后重试');
        }
      } else if (isLogin) {
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
        {/* 背景遮罩层 */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>

        {/* 弹窗主体内容 */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10"
        >
          {/* 右上角关闭按钮 */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors md:text-white md:bg-white/10 md:hover:bg-white/20"
          >
            <X size={20} />
          </button>

          {/* 左侧品牌插画与文案区域 */}
          <div className="md:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-8 md:p-10 text-white flex flex-col relative overflow-hidden min-h-[480px]">
            {/* 装饰背景 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3"></div>

            {/* 插画动画区域 - 使用 Storyset SVG */}
            <div className="relative z-10 flex-1 flex items-center justify-center py-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[420px]"
              >
                <img
                  src={happyStudent}
                  alt="校园快乐学生插画"
                  className="w-full h-auto drop-shadow-2xl"
                />
              </motion.div>
            </div>

            {/* 文字内容区域 */}
            <div className="relative z-10 space-y-2">
              <motion.h2 
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-2xl font-bold leading-tight"
              >
                {isForgot ? "找回密码" : (isLogin ? "欢迎回来，同学！" : "加入我们")}
              </motion.h2>
              <motion.p 
                key={`${mode}-desc`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-blue-100 text-sm leading-relaxed"
              >
                {isForgot 
                  ? "通过学号和手机号验证身份" 
                  : (isLogin 
                    ? "登录你的校园账号，发现闲置好物" 
                    : "一分钟完成认证，开启交易之旅")}
              </motion.p>
            </div>
          </div>

          {/* 右侧表单区域（登录 / 注册 / 重置密码） */}
          <div className="md:w-1/2 p-8 md:p-12 bg-white">
            <div className="h-full flex flex-col justify-center">
              {isForgot && (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm mb-4 transition-colors"
                >
                  <ArrowLeft size={16} />
                  返回登录
                </button>
              )}

              <h3 className="text-2xl font-bold text-slate-900 mb-1">
                {isForgot ? "重置密码" : (isLogin ? "账号登录" : "创建账号")}
              </h3>
              <p className="text-slate-500 text-sm mb-8">
                {isForgot 
                  ? "请输入注册时使用的学号和手机号" 
                  : (isLogin ? "使用学号或手机号登录" : "请填写真实信息以便通过认证")}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 注册时显示昵称 */}
                {mode === 'register' && (
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

                {/* 学号输入框 */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 ml-1">
                    {isForgot ? "学号" : (isLogin ? "学号 / 手机号" : "学号")}
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
                      placeholder={isForgot ? "请输入注册时的学号" : (isLogin ? "请输入学号或手机号" : "请输入10-12位学号")}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                    />
                  </div>
                </div>

                {/* 手机号输入框 - 注册和忘记密码时显示 */}
                {(mode === 'register' || isForgot) && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 ml-1">手机号</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone size={18} />
                      </div>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={isForgot ? "请输入注册时的手机号" : "用于接收通知"}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* 登录和注册时显示密码 */}
                {!isForgot && (
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
                )}

                {/* 忘记密码时显示新密码输入 */}
                {isForgot && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 ml-1">新密码</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <KeyRound size={18} />
                        </div>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          placeholder="请输入新密码（至少6位）"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 ml-1">确认新密码</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Lock size={18} />
                        </div>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="请再次输入新密码"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 登录时显示忘记密码链接 */}
                {isLogin && (
                  <div className="flex justify-end">
                    <button 
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      忘记密码？
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "处理中..." : (isForgot ? "重置密码" : (isLogin ? "登录" : "立即注册"))}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              {!isForgot && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-500">
                    {isLogin ? "还没有账号？" : "已有账号？"}
                    <button
                      onClick={() => switchMode(isLogin ? 'register' : 'login')}
                      className="ml-1 text-blue-600 font-bold hover:underline focus:outline-none"
                    >
                      {isLogin ? "去注册" : "去登录"}
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
