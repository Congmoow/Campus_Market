import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2, Save, Loader2, ChevronDown } from 'lucide-react';
import { fileApi } from '../api';

const CAMPUS_OPTIONS = ['下沙校区', '南浔校区'];
const CATEGORY_OPTIONS = [
  '数码产品',
  '书籍教材',
  '生活用品',
  '衣物鞋帽',
  '美妆护肤',
  '运动器材',
  '其他',
];

const EditProductModal = ({ isOpen, onClose, product, categories, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryName: '',
    location: '',
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const campusDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const [campusOpen, setCampusOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      const initLocation = product.location && CAMPUS_OPTIONS.includes(product.location)
        ? product.location
        : '';
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        categoryName: product.categoryName || '',
        location: initLocation,
        images: product.images || []
      });
      setImageUrls(product.images || []);
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (!campusOpen && !categoryOpen) return;
    const handleClickOutside = (event) => {
      if (campusDropdownRef.current && !campusDropdownRef.current.contains(event.target)) {
        setCampusOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [campusOpen, categoryOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('请输入商品标题');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      alert('请输入有效的价格');
      return;
    }
    if (!formData.location) {
      alert('请选择发布地点');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        categoryName: formData.categoryName || null,
        location: formData.location,
        imageUrls: imageUrls,
      });
      onClose();
    } catch (error) {
      alert('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await fileApi.uploadImage(file);
      if (res.success && res.data) {
        const imageUrl = res.data.url || res.data.path || res.data;
        if (imageUrl) {
          setImageUrls(prev => [...prev, imageUrl]);
        } else {
          alert('上传成功但未返回图片地址');
        }
      } else {
        alert(res.message || '上传图片失败');
      }
    } catch (error) {
      console.error('上传图片失败', error);
      alert('上传图片失败，请稍后重试');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
            >
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-slate-900">编辑商品信息</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/80 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                    基本信息
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        商品标题 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="请输入商品标题"
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        商品描述
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                        rows={4}
                        placeholder="详细描述你的商品..."
                        maxLength={500}
                      />
                      <p className="text-xs text-slate-400 mt-1 text-right">
                        {formData.description.length}/500
                      </p>
                    </div>
                  </div>
                </div>

                {/* 价格信息 */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                    价格信息
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        售价 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        原价（选填）
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                        <input
                          type="number"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 分类和位置 */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                    其他信息
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        商品分类
                      </label>
                      <div
                        className="relative"
                        ref={categoryDropdownRef}
                      >
                        <button
                          type="button"
                          onClick={() => setCategoryOpen((open) => !open)}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-left flex items-center justify-between gap-2 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          <span className={formData.categoryName ? 'text-slate-900' : 'text-slate-400'}>
                            {formData.categoryName || '选择分类'}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform ${categoryOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {categoryOpen && (
                          <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg py-1 max-h-56 overflow-auto">
                            {CATEGORY_OPTIONS.map((name) => (
                              <button
                                type="button"
                                key={name}
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, categoryName: name }));
                                  setCategoryOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
                                  formData.categoryName === name ? 'text-blue-600 bg-blue-50' : 'text-slate-700'
                                }`}
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        发布地点 <span className="text-red-500">*</span>
                      </label>
                      <div
                        className="relative"
                        ref={campusDropdownRef}
                      >
                        <button
                          type="button"
                          onClick={() => setCampusOpen((open) => !open)}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-left flex items-center justify-between gap-2 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          <span className={formData.location ? 'text-slate-900' : 'text-slate-400'}>
                            {formData.location || '请选择校区'}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform ${campusOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {campusOpen && (
                          <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg py-1">
                            {CAMPUS_OPTIONS.map((campus) => (
                              <button
                                type="button"
                                key={campus}
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, location: campus }));
                                  setCampusOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
                                  formData.location === campus ? 'text-blue-600 bg-blue-50' : 'text-slate-700'
                                }`}
                              >
                                {campus}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 图片管理 */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                    商品图片
                  </h3>
                  
                  {/* 图片列表 */}
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`商品图 ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-lg">
                              主图
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 添加图片 */}
                  <div>
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      disabled={uploading}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          上传中...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          上传图片
                        </>
                      )}
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 pt-4 pb-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium"
                disabled={loading}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    保存修改
                  </>
                )}
              </button>
            </div>

            {/* 底部留白区域 - 让 Footer 和弹窗圆角之间有空隙 */}
            <div className="flex-shrink-0 h-3 bg-slate-50 rounded-b-2xl"></div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default EditProductModal;
