import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Send, Image as ImageIcon, Smile, ChevronDown, MessageCircle } from 'lucide-react';
import { chatApi } from '../api';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const formatTime = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
};

// 聊天气泡上方的时间分割显示规则：
// - 同一会话内，相邻消息间隔 5 分钟内共用一条时间
// - 当天消息：直接显示时间，如 10:30
// - 昨天消息：显示 "昨天 HH:mm"
// - 本周内（前天~7天内）：显示星期几 + 时间，如 星期三 09:15
// - 今年内但超过一周：显示月日 + 时间，如 11月25日 20:00
// - 跨年消息：显示完整日期，如 2024年12月1日 10:30
const formatMessageTimeLabel = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const now = new Date();

  // 计算日期差（天数）
  const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startNow = startOfDay(now);
  const startMsg = startOfDay(d);
  const diffDays = Math.floor((startNow - startMsg) / (24 * 60 * 60 * 1000));

  // 格式化时间部分 HH:mm
  const timeStr = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  // 当天：直接显示时间
  if (diffDays === 0) {
    return timeStr;
  }

  // 昨天：显示 "昨天 HH:mm"
  if (diffDays === 1) {
    return `昨天 ${timeStr}`;
  }

  // 本周内（前天~7天内）：显示星期几 + 时间
  if (diffDays >= 2 && diffDays < 7) {
    const weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${weekdayNames[d.getDay()]} ${timeStr}`;
  }

  // 今年内但超过一周：显示月日 + 时间
  const isSameYear = now.getFullYear() === d.getFullYear();
  if (isSameYear) {
    return `${d.getMonth() + 1}月${d.getDate()}日 ${timeStr}`;
  }

  // 跨年消息：显示完整日期
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${timeStr}`;
};

// 判断当前消息前后是否需要插入时间分割线
const shouldShowTimeDivider = (messages, index) => {
  if (index === 0) return true;
  const cur = new Date(messages[index].createdAt);
  const prev = new Date(messages[index - 1].createdAt);
  return cur.getTime() - prev.getTime() > 5 * 60 * 1000; // 超过 5 分钟显示一次
};

// 聊天页面：包含左侧会话列表 + 右侧消息窗口 + 底部输入区
const Chat = () => {
  const [message, setMessage] = useState('');
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hasInitialScroll, setHasInitialScroll] = useState(false);
  const [showProduct, setShowProduct] = useState(true);

  const currentUser = useMemo(() => {
    try {
      const str = localStorage.getItem('user');
      return str ? JSON.parse(str) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const location = useLocation();

  const initialSessionId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const sid = params.get('sessionId');
    return sid ? Number(sid) : null;
  }, [location.search]);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const imageInputRef = useRef(null);

  // 将消息列表滚动到底部，behavior 控制滚动动画（smooth / auto）
  const scrollToBottom = (behavior = 'smooth') => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  // 每当消息列表变化时，根据是否为首次进入决定是否平滑滚动到底部
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const behavior = hasInitialScroll ? 'smooth' : 'auto';
    const timer = setTimeout(() => {
      scrollToBottom(behavior);
    }, 0);

    if (!hasInitialScroll) {
      setHasInitialScroll(true);
    }

    return () => clearTimeout(timer);
  }, [messages, hasInitialScroll]);

  // 加载当前用户的所有会话列表，并优先选中 URL 中指定的会话
  const loadSessions = async (preferredSessionId) => {
    setLoadingSessions(true);
    try {
      const res = await chatApi.getList();
      if (res.success) {
        const list = res.data || [];
        setSessions(list);
        if (list.length > 0) {
          let target = list[0];
          if (preferredSessionId) {
            const found = list.find(s => s.id === preferredSessionId);
            if (found) {
              target = found;
            }
          }
          setCurrentSessionId(target.id);
          setHasInitialScroll(false);
          await loadMessages(target.id);
        }
      } else {
        alert(res.message || '加载会话列表失败');
      }
    } catch (error) {
      console.error('加载会话列表失败', error);
      alert('加载会话列表失败，请稍后重试');
    } finally {
      setLoadingSessions(false);
    }
  };

  // 加载指定会话下的历史消息
  const loadMessages = async (sessionId) => {
    setLoadingMessages(true);
    try {
      const res = await chatApi.getMessages(sessionId);
      if (res.success) {
        setMessages(res.data || []);
      } else {
        alert(res.message || '加载消息失败');
      }
    } catch (error) {
      console.error('加载消息失败', error);
      alert('加载消息失败，请稍后重试');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadSessions(initialSessionId);
  }, [initialSessionId]);

  // 在左侧点击某个会话时切换当前会话并刷新消息列表
  const handleSelectSession = async (session) => {
    if (session.id === currentSessionId) return;
    setCurrentSessionId(session.id);
    setHasInitialScroll(false);
    await loadMessages(session.id);
  };

  // 发送文本消息，并更新本地消息列表与会话列表中的预览
  const handleSend = async () => {
    if (!message.trim() || !currentSessionId) return;
    setSending(true);
    try {
      const res = await chatApi.sendMessage(currentSessionId, {
        type: 'TEXT',
        content: message.trim(),
      });
      if (res.success) {
        setMessages(prev => [...prev, res.data]);
        setMessage('');
        // 更新会话列表中的最后一条消息
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, lastMessage: res.data.content, lastTime: res.data.createdAt } : s));
      } else {
        alert(res.message || '发送消息失败');
      }
    } catch (error) {
      console.error('发送消息失败', error);
      alert('发送消息失败，请稍后重试');
    } finally {
      setSending(false);
    }
  };

  const activeSession = useMemo(
    () => sessions.find(s => s.id === currentSessionId) || null,
    [sessions, currentSessionId]
  );

  const myAvatarUrl = useMemo(() => {
    if (!currentUser) return null;
    const seed = currentUser.id || currentUser.username || 'user';
    return currentUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }, [currentUser]);

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleImageButtonClick = () => {
    if (!activeSession || !imageInputRef.current || sending) return;
    imageInputRef.current.click();
  };

  // 选择图片后，将图片读为 DataURL 并作为 IMAGE 类型消息发送
  const handleImageChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !currentSessionId) {
      return;
    }

    // 允许再次选择同一张图片
    e.target.value = '';

    try {
      setSending(true);

      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      if (!dataUrl || typeof dataUrl !== 'string') {
        alert('读取图片失败，请稍后重试');
        return;
      }

      const sendRes = await chatApi.sendMessage(currentSessionId, {
        type: 'IMAGE',
        content: dataUrl,
      });

      if (sendRes.success) {
        setMessages((prev) => [...prev, sendRes.data]);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? { ...s, lastMessage: '[图片]', lastTime: sendRes.data.createdAt }
              : s
          )
        );
      } else {
        alert(sendRes.message || '发送图片失败');
      }
    } catch (err) {
      console.error('发送图片失败', err);
      alert('发送图片失败，请稍后重试');
    } finally {
      setSending(false);
    }
  };

  // 是否允许撤回某条消息：仅本人发送且在 2 分钟内
  const canRecall = (msg) => {
    if (!currentUser || !msg || !msg.createdAt) return false;
    if (msg.type === 'RECALL') return false;
    if (msg.senderId !== currentUser.id) return false;
    const created = new Date(msg.createdAt).getTime();
    if (Number.isNaN(created)) return false;
    const diff = Date.now() - created;
    return diff <= 2 * 60 * 1000;
  };

  // 撤回消息：调用后端撤回接口，并在本地将消息替换为 RECALL 类型
  const handleRecall = async (msg) => {
    if (!currentSessionId || !msg || !canRecall(msg)) return;
    const isLast = messages.length > 0 && messages[messages.length - 1].id === msg.id;
    try {
      const res = await chatApi.recallMessage(currentSessionId, msg.id);
      if (res.success && res.data) {
        const recalled = res.data;
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? recalled : m)));
        if (isLast) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === currentSessionId
                ? { ...s, lastMessage: '你撤回了一条消息', lastTime: recalled.createdAt }
                : s
            )
          );
        }
      } else {
        alert(res.message || '撤回失败，请稍后重试');
      }
    } catch (error) {
      console.error('撤回消息失败', error);
      const msgText = error?.response?.data?.message || '撤回失败，可能已超过可撤回时间';
      alert(msgText);
    }
  };

  return (

    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-6 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex h-full min-h-[520px]">
          {/* 左侧会话列表区域 */}
          <div className="w-80 border-r border-slate-100 flex flex-col hidden md:flex">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-blue-500" />
                <h2 className="font-bold text-lg text-slate-900">消息</h2>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingSessions ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">加载中...</div>
              ) : sessions.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">暂无会话</div>
              ) : (
                sessions.map((session) => {
                  const isActive = session.id === currentSessionId;
                  const name = session.partnerName || '同学';
                  const seed = session.partnerId || name;
                  const avatar = session.partnerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
                  return (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session)}
                      className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                        isActive ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative">
                        <img src={avatar} alt={name} className="w-12 h-12 rounded-full bg-slate-100" />
                        {session.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border-2 border-white">
                            {session.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">{name}</h3>
                          <span className="text-xs text-slate-400">{formatTime(session.lastTime)}</span>
                        </div>
                        <p className="text-sm text-slate-500 truncate">{session.lastMessage || '暂无聊天记录'}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 右侧聊天主区域 */}
          <div className="flex-1 flex flex-col bg-white">
            {/* 聊天顶部：对方信息与正在沟通的商品 */}
            <div className="bg-white border-b border-slate-100">
              {activeSession ? (
                <div className="flex flex-col">
                  {/* 对方信息 */}
                  <Link to={`/user/${activeSession.partnerId}`} className="flex items-center gap-3 p-4 group">
                    {(() => {
                      const headerSeed = activeSession.partnerId || activeSession.partnerName || 'user';
                      const headerAvatar = activeSession.partnerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(headerSeed)}`;
                      return (
                        <img
                          src={headerAvatar}
                          alt=""
                          className="w-10 h-10 rounded-full bg-slate-100 group-hover:ring-2 group-hover:ring-blue-200 transition-all"
                        />
                      );
                    })()}
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {activeSession.partnerName || '同学'}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-xs text-slate-500">在线</span>
                      </div>
                    </div>
                  </Link>
                  {/* 商品卡片 - 闲鱼风格，白色底色与聊天区域一体 */}
                  {activeSession.productId && (
                    <div className="mx-4 mb-3">
                      <div 
                        className="flex items-center justify-between text-xs text-slate-400 cursor-pointer px-1 py-1"
                        onClick={() => setShowProduct(!showProduct)}
                      >
                        <span>正在沟通的商品</span>
                        <ChevronDown 
                          size={18} 
                          className={`text-slate-400 transition-transform duration-200 ${showProduct ? 'rotate-180' : ''}`}
                        />
                      </div>
                      {showProduct && (
                        <Link
                          to={`/product/${activeSession.productId}`}
                          className="flex items-center gap-4 px-2 py-3 hover:bg-slate-50 rounded-xl transition-colors mt-1"
                        >
                          {activeSession.productThumbnail && (
                            <img
                              src={activeSession.productThumbnail}
                              alt={activeSession.productTitle || '商品缩略图'}
                              className="w-20 h-20 rounded-lg object-cover bg-white flex-shrink-0 border border-slate-200"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-medium text-slate-900 truncate">
                              {activeSession.productTitle || '商品详情'}
                            </p>
                            {activeSession.productPrice != null && (
                              <p className="mt-1 text-lg font-bold text-orange-500">
                                ¥{activeSession.productPrice}
                              </p>
                            )}
                          </div>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-sm text-slate-400">请选择左侧会话开始聊天</div>
              )}
            </div>

            {/* 消息列表区域 */}
            <div
              ref={messagesContainerRef}
              className="flex-1 min-h-[260px] overflow-y-auto p-4 space-y-4 no-scrollbar bg-neutral-50"
            >
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">加载消息中...</div>
              ) : !activeSession ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">请选择左侧会话</div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">暂无消息，发送第一条吧～</div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = currentUser && msg.senderId === currentUser.id;
                  const isRecalled = msg.type === 'RECALL';
                  const showRecall = isMe && canRecall(msg);
                  return (
                    <React.Fragment key={msg.id}>
                      {shouldShowTimeDivider(messages, index) && (
                        <div className="flex justify-center my-2 text-[11px] text-slate-400">
                          <span>{formatMessageTimeLabel(msg.createdAt)}</span>
                        </div>
                      )}

                      {isRecalled ? (
                        <div className="flex justify-center my-1 text-[11px] text-slate-400">
                          <span className="px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200">
                            {isMe ? '你撤回了一条消息' : '对方撤回了一条消息'}
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`flex gap-2 ${isMe ? 'items-center justify-end' : 'items-end justify-start'}`}
                        >
                          <div className="max-w-[70%] flex flex-col gap-1">
                            <div className="relative">
                              <div
                                className={`rounded-2xl px-4 py-3 shadow-sm ${
                                  isMe
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                }`}
                              >
                                {msg.type === 'IMAGE' ? (
                                  <img
                                    src={msg.content}
                                    alt="sent image"
                                    className="rounded-lg max-w-full"
                                    onLoad={() => scrollToBottom('auto')}
                                  />
                                ) : (
                                  <p className="leading-relaxed">{msg.content}</p>
                                )}
                              </div>
                              {isMe && (
                                <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rotate-45" />
                              )}
                            </div>
                            {showRecall && (
                              <button
                                type="button"
                                onClick={() => handleRecall(msg)}
                                className="self-end text-[11px] text-slate-400 hover:text-red-500 transition-colors"
                              >
                                撤回
                              </button>
                            )}
                          </div>
                          {isMe && myAvatarUrl && (
                            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                              <img src={myAvatarUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 底部输入区域（表情 / 图片 / 文本输入 / 发送按钮） */}
            <div className="px-4 py-3 bg-white border-t border-slate-100 flex flex-col gap-3">
              <div className="flex gap-2 relative">
                <button
                  type="button"
                  onClick={handleImageButtonClick}
                  disabled={!activeSession || sending}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ImageIcon size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  disabled={!activeSession}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Smile size={20} />
                </button>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />

                {showEmojiPicker && (
                  <div className="absolute bottom-12 left-0 z-10">
                   <Picker
                    data={data}
                    onEmojiSelect={(emoji) => handleEmojiSelect(emoji.native)}
                    theme="light"
                  />
                </div>
              )} 
              </div>
              <div className="flex items-end gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={activeSession ? '输入消息...' : '请选择左侧会话后再发送'}
                  rows={3}
                  className="flex-1 bg-white border-none px-1 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 resize-none"
                  disabled={!activeSession}
                />
                <button
                  onClick={handleSend}
                  className={`p-3 rounded-xl transition-all ${
                    message.trim() && activeSession && !sending
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:scale-105'
                      : 'bg-blue-600 text-white opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!message.trim() || !activeSession || sending}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
