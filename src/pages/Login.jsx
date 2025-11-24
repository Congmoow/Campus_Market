import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, School, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // 模拟登录成功，跳转回首页
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-200/30 rounded-full blur-3xl opacity-50 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-100/40 rounded-full blur-3xl opacity-50 translate-x-1/3 translate-y-1/4 pointer-events-none"></div>

      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/50">
        
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

          <div className="relative z-10 space-y-6">
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
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col justify-center"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-1">
                {isLogin ? "账号登录" : "创建账号"}
              </h3>
              <p className="text-slate-500 text-sm mb-8">
                {isLogin ? "使用学号或手机号登录" : "请填写真实信息以便通过认证"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 ml-1">姓名</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        placeholder="真实姓名"
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
                      placeholder={isLogin ? "请输入学号或手机号" : "请输入10-12位学号"}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 ml-1">密码</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
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
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-4"
                >
                  {isLogin ? "登录" : "立即注册"}
                  <ArrowRight size={18} />
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Login;
