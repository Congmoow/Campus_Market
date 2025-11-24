import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Send, Paperclip, MoreVertical, Phone, Video, Image as ImageIcon, Smile } from 'lucide-react';
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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-6 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-[calc(100vh-6rem)]">
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
                        <p className="text-sm text-slate-500 truncate">{session.lastMessage || '点击开始聊天'}</p>
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
            <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center">
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
              <div className="flex items-center gap-2 text-slate-500">
                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <Phone size={20} />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <Video size={20} />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-[260px] overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">加载消息中...</div>
              ) : !activeSession ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">请选择左侧会话</div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">暂无消息，发送第一条吧～</div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const isMe = currentUser && msg.senderId === currentUser.id;
                    return (
                      <React.Fragment key={msg.id}>
                        {shouldShowTimeDivider(messages, index) && (
                          <div className="flex justify-center my-2 text-[11px] text-slate-400">
                            <span>{formatMessageTimeLabel(msg.createdAt)}</span>
                          </div>
                        )}
                        <div
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`rounded-2xl px-4 py-3 shadow-sm ${
                                isMe
                                  ? 'bg-blue-600 text-white rounded-tr-none'
                                  : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                              }`}
                            >
                              {msg.type === 'IMAGE' ? (
                                <img src={msg.content} alt="sent image" className="rounded-lg max-w-full" />
                              ) : (
                                <p className="leading-relaxed">{msg.content}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2 mb-2">
                 <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                   <ImageIcon size={20} />
                 </button>
                 <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                   <Paperclip size={20} />
                 </button>
                 <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                   <Smile size={20} />
                 </button>
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
