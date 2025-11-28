import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Upload, X, DollarSign, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productApi, fileApi } from '../api';

const Publish = () => {
  const [images, setImages] = useState([]); // [{id, preview, url, uploading}]
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const categories = ["数码产品", "书籍教材", "生活用品", "衣物鞋帽", "美妆护肤", "运动器材", "其他"];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const preview = URL.createObjectURL(file);
      const tempId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      setImages(prev => [...prev, { id: tempId, preview, url: '', uploading: true }]);
      uploadImage(file, tempId, preview);
    });
  };

  const uploadImage = async (file, id, preview) => {
    try {
      const res = await fileApi.uploadImage(file);
      if (res.success && res.data?.url) {
        setImages(prev => prev.map(img => img.id === id ? { ...img, url: res.data.url, uploading: false } : img));
      } else {
        setImages(prev => prev.filter(img => img.id !== id));
        setError(res.message || '图片上传失败，请重试');
        URL.revokeObjectURL(preview);
      }
    } catch (err) {
      setImages(prev => prev.filter(img => img.id !== id));
      setError('图片上传失败，请稍后重试');
      URL.revokeObjectURL(preview);
    }
  };

  const removeImage = (index) => {
    const target = images[index];
    if (target) {
      URL.revokeObjectURL(target.preview);
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !price) {
      setError('请至少填写标题、描述和价格');
      return;
    }
    if (images.some(img => img.uploading)) {
      setError('还有图片正在上传，请稍候');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const imageUrls = images.filter(img => img.url).map(img => img.url);
      const body = {
        title,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        categoryName: category || null,
        location: location || '校内',
        imageUrls,
      };

      const res = await productApi.create(body);
      if (res.success && res.data?.id) {
        navigate(`/product/${res.data.id}`);
      } else {
        setError(res.message || '发布失败，请稍后重试');
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError('请先登录后再发布商品');
      } else {
        setError('发布失败，请稍后重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      
      <div className="pt-32 max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-8 border-b border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900">发布闲置</h1>
            <p className="text-slate-500 mt-1">填写物品信息，快速回血</p>
          </div>

          <form className="p-8 space-y-8" onSubmit={handleSubmit}>
            {/* Image Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">商品图片</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                    {img.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
                        上传中...
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 cursor-pointer hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all">
                  <Upload size={24} />
                  <span className="text-xs font-medium">上传图片</span>
                  <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">标题</label>
                <input
                  type="text"
                  placeholder="品牌型号 + 关键特点"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">详细描述</label>
                <textarea
                  rows={5}
                  placeholder="描述一下物品的新旧程度、入手渠道、转手原因等..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                />
              </div>
            </div>

            {/* Details */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">价格</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <DollarSign size={18} />
                  </div>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">原价 (选填)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <DollarSign size={18} />
                  </div>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">分类</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      category === cat
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">交易地点</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <MapPin size={18} />
                </div>
                <select
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none text-slate-600"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="">选择校区/地点</option>
                  <option value="南浔校区">南浔校区</option>
                  <option value="下沙校区">下沙校区</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {/* Submit Actions */}
            <div className="pt-6 flex items-center gap-4">
              <button type="button" className="flex-1 py-4 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">
                保存草稿
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? '发布中...' : '立即发布'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Publish;
