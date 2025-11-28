import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Send, Image as ImageIcon, Smile } from 'lucide-react';
import { chatApi } from '../api';

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
// - 当天消息：显示 HH:mm
// - 一周内（非当天）：显示星期几
// - 同一月内、非当周：显示几号
// - 更早：显示完整日期
const formatMessageTimeLabel = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const now = new Date();

  const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startNow = startOfDay(now);
  const startMsg = startOfDay(d);
  const diffDays = Math.floor((startNow - startMsg) / (24 * 60 * 60 * 1000));

  const isToday = diffDays === 0;
  const isSameMonth = now.getFullYear() === d.getFullYear() && now.getMonth() === d.getMonth();

  if (isToday) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  if (diffDays > 0 && diffDays < 7) {
    const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdayNames[d.getDay()];
  }

  if (isSameMonth) {
    return `${d.getDate()}号`;
  }

  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const shouldShowTimeDivider = (messages, index) => {
  if (index === 0) return true;
  const cur = new Date(messages[index].createdAt);
  const prev = new Date(messages[index - 1].createdAt);
  return cur.getTime() - prev.getTime() > 5 * 60 * 1000; // 超过 5 分钟显示一次
};

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

  const scrollToBottom = (behavior = 'smooth') => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

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

  const handleSelectSession = async (session) => {
    if (session.id === currentSessionId) return;
    setCurrentSessionId(session.id);
    setHasInitialScroll(false);
    await loadMessages(session.id);
  };

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

  const canRecall = (msg) => {
    if (!currentUser || !msg || !msg.createdAt) return false;
    if (msg.type === 'RECALL') return false;
    if (msg.senderId !== currentUser.id) return false;
    const created = new Date(msg.createdAt).getTime();
    if (Number.isNaN(created)) return false;
    const diff = Date.now() - created;
    return diff <= 2 * 60 * 1000;
  };

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
          {/* Sidebar - Chat List */}
          <div className="w-80 border-r border-slate-100 flex flex-col hidden md:flex">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900">消息</h2>
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

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-slate-50/30">
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center gap-4">
              {activeSession ? (
                <Link to={`/user/${activeSession.partnerId}`} className="flex items-center gap-3 group">
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
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {activeSession.partnerName || '同学'}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-xs text-slate-500">在线</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="text-sm text-slate-400">请选择左侧会话开始聊天</div>
              )}
              {activeSession && activeSession.productId && (
                <Link
                  to={`/product/${activeSession.productId}`}
                  className="flex items-center gap-3 text-right"
                >
                  <div className="h-10 w-px bg-blue-500/70 rounded-full" />
                  {activeSession.productThumbnail && (
                    <img
                      src={activeSession.productThumbnail}
                      alt={activeSession.productTitle || '商品缩略图'}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 mb-0.5">正在沟通的商品</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {activeSession.productTitle || '商品详情'}
                    </p>
                    {activeSession.productPrice != null && (
                      <p className="mt-0.5 text-xs font-bold text-blue-600">
                        ¥{activeSession.productPrice}
                      </p>
                    )}
                  </div>
                </Link>
              )}
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 min-h-[260px] overflow-y-auto p-4 space-y-4 no-scrollbar"
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

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2 mb-2 relative">
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
                  <div className="absolute bottom-12 left-0 z-10 w-64 rounded-2xl bg-white border border-slate-100 shadow-lg p-3">
                    <div className="text-xs text-slate-400 mb-2">常用表情</div>
                    <div className="grid grid-cols-8 gap-1 text-xl">
                      {['😀','😁','😂','🤣','😊','😍','😎','😘','🤔','🥰','😅','😢','😡','👍','👎','🙏','👏','🎉','❤️','🔥','⭐','✅','❌'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="hover:bg-slate-100 rounded-md flex items-center justify-center"
                          onClick={() => handleEmojiSelect(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-end gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={activeSession ? '输入消息...' : '请选择左侧会话后再发送'}
                  rows={1}
                  className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 resize-none"
                  disabled={!activeSession}
                />
                <button
                  onClick={handleSend}
                  className={`p-3 rounded-xl transition-all ${
                    message.trim() && activeSession && !sending
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:scale-105'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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
