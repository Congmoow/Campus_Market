import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, GraduationCap, School, FileText } from 'lucide-react';
import { userApi, fileApi } from '../api';

// 个人资料编辑弹窗：修改昵称、专业、年级、校区、简介和头像
const EditProfileModal = ({ isOpen, onClose, currentProfile, onSuccess }) => {
  const [formData, setFormData] = useState({
    nickname: '',
    major: '',
    grade: '',
    campus: '',
    bio: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (currentProfile && isOpen) {
      setFormData({
        nickname: currentProfile.nickname || '',
        major: currentProfile.major || '',
        grade: currentProfile.grade || '',
        campus: currentProfile.campus || '',
        bio: currentProfile.bio || '',
        avatarUrl: currentProfile.avatarUrl || '',
      });
    }
  }, [currentProfile, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setError('');
    setUploadingAvatar(true);

    try {
      const res = await fileApi.uploadImage(file, 'avatars');
      if (res.success && res.data && res.data.url) {
        setFormData(prev => ({ ...prev, avatarUrl: res.data.url }));
      } else {
        setError(res.message || '头像上传失败，请稍后重试');
      }
    } catch (err) {
      setError('头像上传失败，请稍后重试');
    } finally {
      setUploadingAvatar(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await userApi.updateProfile(formData);
      if (res.success) {
        onSuccess && onSuccess(res.data);
        onClose();
      } else {
        setError(res.message || '更新失败');
      }
    } catch (err) {
      setError('更新失败，请稍后重试');
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
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
        >
          {/* 顶部标题栏 */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-6 text-white relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold">编辑个人信息</h3>
            <p className="text-blue-100 text-sm mt-1">完善你的个人资料，让大家更了解你</p>
          </div>

          {/* 表单区域 */}
          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="头像预览"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">暂无头像</span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">自定义头像</p>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors">
                      {uploadingAvatar ? '上传中...' : '选择图片'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={uploadingAvatar}
                      />
                    </label>
                    {formData.avatarUrl && (
                      <button
                        type="button"
                        className="text-xs text-slate-400 hover:text-red-500"
                        onClick={() => setFormData(prev => ({ ...prev, avatarUrl: '' }))}
                      >
                        清除
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">建议使用正方形图片，大小不超过2MB</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 ml-1 flex items-center gap-1">
                  <User size={14} /> 昵称
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  placeholder="给自己起个好听的昵称"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 ml-1 flex items-center gap-1">
                    <GraduationCap size={14} /> 专业
                  </label>
                  <input
                    type="text"
                    name="major"
                    value={formData.major}
                    onChange={handleInputChange}
                    placeholder="如：计算机科学与技术"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 ml-1 flex items-center gap-1">
                    <School size={14} /> 年级
                  </label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    placeholder="如：2021级"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 ml-1 flex items-center gap-1">
                  <MapPin size={14} /> 校区
                </label>
                <input
                  type="text"
                  name="campus"
                  value={formData.campus}
                  onChange={handleInputChange}
                  placeholder="如：南校区 / 北校区"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 ml-1 flex items-center gap-1">
                  <FileText size={14} /> 个人简介
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="介绍一下自己吧，让大家更了解你～"
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? '保存中...' : '保存修改'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditProfileModal;
