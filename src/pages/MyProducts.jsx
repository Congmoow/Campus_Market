import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, Eye, Heart, Edit, Trash2, Plus, Filter, Search, MoreVertical } from 'lucide-react';
import { userApi, productApi } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import EditProductModal from '../components/EditProductModal';

// 格式化时间函数
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const MyProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, ON_SALE, SOLD
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [confirmingProduct, setConfirmingProduct] = useState(null);
  const [confirmNewStatus, setConfirmNewStatus] = useState(null); // 'SOLD' or 'ON_SALE'
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await productApi.getCategories();
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (error) {
      console.error('加载分类失败', error);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await userApi.getMyProducts();
      if (res.success) {
        setProducts(res.data.content || []);
      }
    } catch (error) {
      console.error('加载商品失败', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    // 过滤掉已删除的商品
    if (p.status === 'DELETED') return false;
    if (filter !== 'ALL' && p.status !== filter) return false;
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // 状态标签样式
  const getStatusBadge = (status) => {
    switch(status) {
      case 'ON_SALE':
        // 在售商品不再展示状态角标
        return null;
      case 'SOLD':
        // 已售出由大号“卖掉了”贴纸体现，这里不再额外显示文字角标
        return null;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">未知</span>;
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'ON_SALE' ? 'SOLD' : 'ON_SALE';
    setShowActionMenu(null);
    setConfirmError('');
    setConfirmingProduct(product);
    setConfirmNewStatus(newStatus);
  };

  const handleEdit = async (product) => {
    setShowActionMenu(null);
    try {
      const res = await productApi.getDetail(product.id);
      if (res.success) {
        setEditingProduct({ ...product, ...res.data });
        setShowEditModal(true);
      } else {
        alert(res.message || '加载商品详情失败');
      }
    } catch (error) {
      console.error('加载商品详情失败', error);
      alert('加载商品详情失败，请稍后重试');
    }
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      const res = await productApi.update(editingProduct.id, updatedData);
      if (res.success) {
        showToast('success', '商品信息更新成功');
        setShowEditModal(false);
        setEditingProduct(null);
        // 为保证数据最新，重新加载列表
        loadProducts();
      } else {
        showToast('error', res.message || '更新失败');
      }
    } catch (error) {
      console.error('更新商品失败', error);
      showToast('error', '更新商品失败，请稍后重试');
      throw error;
    }
  };

  const handleDelete = async (product) => {
    const confirmText = '确认删除该商品？删除后将不再显示在列表中。';
    if (!window.confirm(confirmText)) return;

    setDeletingId(product.id);
    try {
      // 使用后端软删除接口：DELETE /api/products/{id}
      const res = await productApi.delete(product.id);
      if (res.success) {
        // 后端采用软删除（状态改为 DELETED），前端直接从列表移除
        setProducts(prev => prev.filter(p => p.id !== product.id));
        alert('商品已删除');
      } else {
        alert(res.message || '删除商品失败');
      }
    } catch (error) {
      console.error('删除商品失败', error);
      alert('删除商品失败，请稍后重试');
    } finally {
      setDeletingId(null);
      setShowActionMenu(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-slate-900 flex items-center gap-3"
            >
              <span className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <Package size={28} />
              </span>
              我的发布
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 mt-2 ml-1"
            >
              管理你发布的所有商品，查看状态和浏览数据
            </motion.p>
          </div>

          <Link to="/publish">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus size={20} />
              发布新商品
            </motion.button>
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            {['ALL', 'ON_SALE', 'SOLD'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f === 'ALL' ? '全部' : f === 'ON_SALE' ? '在售' : '已售出'}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="搜索商品标题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 border-none rounded-xl bg-slate-50 focus:bg-white ring-1 ring-slate-200 focus:ring-blue-500 focus:shadow-sm transition-all text-sm"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse shadow-sm border border-slate-100"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-100 transition-all duration-300"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {/* Image Container */}
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  <img 
                    src={product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/400'} 
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(product.status)}
                  </div>

					{product.status === 'SOLD' && (
						<div className="absolute inset-0 pointer-events-none">
							<img
								src="/images/sold-out.jpg"
								alt="已售出"
								className="w-full h-full object-cover opacity-90"
							/>
						</div>
					)}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 line-clamp-1 text-lg group-hover:text-blue-600 transition-colors">{product.title}</h3>
                  </div>
                  
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10 leading-relaxed">
                    {product.description || '暂无描述'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-xl font-bold text-red-500 font-mono">
                      ¥{product.price}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-slate-400 text-xs gap-3">
                        <span className="flex items-center gap-1" title="发布时间">
                          <Clock size={12} />
                          {formatTime(product.createdAt).split(' ')[0]}
                        </span>
                        <span className="flex items-center gap-1" title="浏览量">
                          <Eye size={12} />
                          {product.viewCount || 0}
                        </span>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionMenu(showActionMenu === product.id ? null : product.id);
                          }}
                          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <MoreVertical size={16} className="text-inherit" />
                        </button>
                        {/* 操作菜单 */}
                        {showActionMenu === product.id && (
                          <div
                            className="absolute bottom-full right-0 mb-2 w-40 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleEdit(product)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-slate-700 flex items-center gap-2"
                            >
                              <Edit size={14} /> 编辑信息
                            </button>
                            <button
                              onClick={() => handleToggleStatus(product)}
                              disabled={updatingId === product.id}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-slate-700 flex items-center gap-2 disabled:opacity-60"
                            >
                              {product.status === 'ON_SALE' ? (
                                <><Package size={14} /> 标记已售</>
                              ) : (
                                <><Package size={14} /> 重新上架</>
                              )}
                            </button>
                            <div className="h-px bg-slate-100 my-1" />
                            <button
                              onClick={() => handleDelete(product)}
                              disabled={deletingId === product.id}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 disabled:opacity-60"
                            >
                              <Trash2 size={14} /> 删除商品
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-32 bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Package size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">暂无相关商品</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
              {searchTerm || filter !== 'ALL' ? '换个搜索词或筛选条件试试看吧' : '你还没有发布过任何商品，快去发布第一件闲置吧！'}
            </p>
            {!searchTerm && filter === 'ALL' && (
              <Link to="/publish">
                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all">
                  发布闲置
                </button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 编辑商品弹窗 */}
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        categories={categories}
        onSave={handleSaveEdit}
      />
      {/* 标记已售 / 重新上架 确认弹窗 */}
      <AnimatePresence>
        {confirmingProduct && confirmNewStatus && (
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
                onClick={() => !confirmLoading && (setConfirmingProduct(null), setConfirmNewStatus(null))}
              >
                关闭
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${confirmNewStatus === 'SOLD' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  <Package size={20} />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-slate-900">
                    {confirmNewStatus === 'SOLD' ? '标记为已售出？' : '重新上架该商品？'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {confirmNewStatus === 'SOLD'
                      ? '标记后商品将移动到「已售出」，不会再显示在首页最新发布和在售列表中。'
                      : '重新上架后，商品将重新出现在买家可见的在售列表中。'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl px-4 py-3 text-left text-sm text-slate-600 mb-4">
                <div className="line-clamp-1 font-medium text-slate-900 mb-1">{confirmingProduct.title}</div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>价格：<span className="font-semibold text-slate-900">¥{confirmingProduct.price}</span></span>
                  {confirmingProduct.createdAt && (
                    <span>{new Date(confirmingProduct.createdAt).toLocaleDateString('zh-CN')}</span>
                  )}
                </div>
              </div>

              {confirmError && (
                <div className="mb-3 text-xs text-red-500 text-left">{confirmError}</div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
                  onClick={() => !confirmLoading && (setConfirmingProduct(null), setConfirmNewStatus(null))}
                >
                  再想想
                </button>
                <button
                  className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-500/30 hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  disabled={confirmLoading}
                  onClick={async () => {
                    if (!confirmingProduct || !confirmNewStatus) return;
                    try {
                      setConfirmLoading(true);
                      setConfirmError('');
                      const res = await productApi.updateStatus(confirmingProduct.id, confirmNewStatus);
                      if (res.success) {
                        setProducts(prev => prev.map(p => p.id === confirmingProduct.id ? { ...p, status: confirmNewStatus } : p));
                        setConfirmingProduct(null);
                        setConfirmNewStatus(null);
                      } else {
                        setConfirmError(res.message || '更新商品状态失败，请稍后重试');
                      }
                    } catch (e) {
                      console.error('更新商品状态失败', e);
                      setConfirmError('更新商品状态失败，请稍后重试');
                    } finally {
                      setConfirmLoading(false);
                    }
                  }}
                >
                  {confirmLoading ? '处理中...' : (confirmNewStatus === 'SOLD' ? '标记已售出' : '重新上架')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 全局 Toast 提示 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`fixed bottom-6 right-6 z-50 max-w-xs rounded-2xl border px-4 py-3 shadow-lg text-sm ${{
              success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
              error: 'bg-red-50 border-red-200 text-red-700',
            }[toast.type] || 'bg-slate-50 border-slate-200 text-slate-700'}`}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <div className="flex-1 leading-snug">{toast.message}</div>
              <button
                className="ml-2 text-xs text-slate-400 hover:text-slate-600"
                onClick={() => setToast(null)}
              >
                关闭
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyProducts;
