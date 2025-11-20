import { useCallback, useEffect, useMemo, useState, Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Empty, Input, List, Message, Spin } from '../../ui';
import { SearchOutlined, SendOutlined } from '@ant-design/icons';
import styles from './index.module.css';
import { chatService, ConversationDto, MessageDto } from '../../services/chatService';
import { useUserStore } from '../../store/userStore';
import { useAuthModalStore } from '../../store/authModalStore';
import UserAvatar from '../../components/common/UserAvatar';
import { formatChatTime } from '../../utils/format';

export const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { openModal } = useAuthModalStore();
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
    (async () => {
      // 未登录直接返回，避免不必要的 401
      if (!user) {
        setConversations([]);
        setLoadingConvs(false);
        return;
      }
      try {
        setLoadingConvs(true);
        const data = await chatService.getConversations();
        setConversations(data);
        const params = new URLSearchParams(location.search);
        const fromCid = params.get('cid');
        const fromSid = params.get('sid');
        const fromThread = params.get('thread');

        let nextId: number | null = null;

        if (fromCid) {
          const cidNum = Number(fromCid);
          if (Number.isFinite(cidNum)) {
            const byCid = data.find(c => c.id === cidNum);
            if (byCid) nextId = byCid.id;
          }
        }

        if (nextId == null && fromThread) {
          const threadNum = Number(fromThread);
          if (Number.isFinite(threadNum)) {
            const byThread = data.find(c => (c as any).threadId === threadNum);
            if (byThread) nextId = byThread.id;
          }
        }

        if (nextId == null && fromSid) {
          const sidNum = Number(fromSid);
          if (Number.isFinite(sidNum)) {
            const byPeer = data.find(c => c.peerId === sidNum);
            if (byPeer) nextId = byPeer.id;
          }
        }

        if (nextId == null && fromSid) {
          const sidNum = Number(fromSid);
          if (Number.isFinite(sidNum)) {
            try {
              const created = await chatService.openConversation({ peerId: sidNum });
              // 刷新会话列表并选中新建会话
              const refreshed = await chatService.getConversations();
              setConversations(refreshed);
              nextId = created?.id ?? null;
            } catch {}
          }
        }

        if (nextId == null && data.length > 0) {
          nextId = data[0].id;
        }

        if (nextId != null) setActiveId(nextId);
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 401) {
          localStorage.removeItem('token');
          openModal('login');
          navigate('/');
          return;
        }
      } finally {
        setLoadingConvs(false);
      }
    })();
  }, [location.search, user]);

  const getConversationDisplay = useCallback((c?: ConversationDto | null) => {
    if (!c) return '对方';
    if (c.name && c.name.trim()) return c.name;
    return c.peerId ? `用户${c.peerId}` : '对方';
  }, []);

  const filteredConversations = useMemo(() => {
    const q = search.trim();
    const list = q ? conversations.filter(c => getConversationDisplay(c).includes(q)) : conversations;
    // 未读置顶
    return [...list].sort((a,b) => (b.unreadCount || 0) - (a.unreadCount || 0));
  }, [search, conversations, getConversationDisplay]);

  const msgs = useMemo(
    () => messages.filter(m => m.conversationId === activeId),
    [activeId, messages]
  );

  useEffect(() => {
    (async () => {
      if (!activeId) return;
      setLoadingMsgs(true);
      try {
        const data = await chatService.getMessages(activeId, 0, 200);
        setMessages(data);
        // mark as read
        await chatService.markRead(activeId);
        setConversations(prev => prev.map(c => c.id === activeId ? { ...c, unreadCount: 0 } : c));
      } finally {
        setLoadingMsgs(false);
      }
    })();
  }, [activeId]);

  const handleSend = async () => {
    if (!input.trim() || !activeId) return;
    const optimistic = {
      id: Date.now(),
      conversationId: activeId,
      fromMe: true,
      content: input,
      time: new Date().toLocaleTimeString().slice(0,5)
    } as MessageDto;
    setMessages(prev => [...prev, optimistic]);
    const content = input;
    setInput('');
    try {
      const saved = await chatService.sendMessage(activeId, content);
      setMessages(prev => prev.map(m => m.id === optimistic.id ? saved : m));
    } catch (e) {
      Message.error('发送失败');
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setInput(content);
    }
  };

  return (
    <div className={styles.chatPage}>
      <div className={styles.container}>
        <div className={styles.panel}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.searchBox}>
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="搜索联系人"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.conversationList}>
              <List
                dataSource={filteredConversations}
                renderItem={(item) => {
                  const displayName = getConversationDisplay(item);
                  return (
                    <List.Item
                      key={item.id}
                      style={{ padding: 0, border: 'none' }}
                    >
                      <div
                        className={`${styles.conversationItem} ${activeId === item.id ? styles.active : ''} ${item.unreadCount ? styles.conversationItemUnread : ''}`}
                        onClick={() => setActiveId(item.id)}
                      >
                        <UserAvatar src={item.avatar} name={displayName} size={55} />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-1,#1d2129)' }}>{displayName}</div>
                          <div style={{ color: 'var(--color-text-3,#86909c)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.lastMessageFromPeer || item.lastMessage || '最近无消息'}</div>
                        </div>
                        {typeof item.unreadCount === 'number' && item.unreadCount > 0 && (
                          <div style={{ marginLeft: 'auto', background: 'var(--primary-6,#165dff)', color: '#fff', borderRadius: 999, padding: '2px 6px', fontSize: 12 }}>
                            {item.unreadCount}
                          </div>
                        )}
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            <div className={styles.header}>
              <div style={{ fontWeight: 600, color: 'var(--color-text-1,#1d2129)' }}>
                {(() => {
                  const conv = conversations.find(c => c.id === activeId);
                  if (!conv) return '未选择会话';
                  return getConversationDisplay(conv);
                })()}
              </div>
            </div>
            <div className={styles.messages}>
              {activeId ? (
                loadingMsgs ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><Spin /></div>
                ) : msgs.length ? (() => {
                  let lastDividerTime: number | null = null;
                  const FIVE_MIN = 5 * 60 * 1000;

                  return msgs.map(m => {
                    const conv = conversations.find(c => c.id === activeId);
                    const otherName = getConversationDisplay(conv);
                    const nick = m.fromMe ? (user?.nickname || '我') : otherName;
                    const isImage = /\.(png|jpe?g|gif|webp)$/i.test(m.content) && /^https?:/i.test(m.content);

                    let showDivider = false;
                    let timeLabel = '';

                    if (m.time) {
                      const d = new Date(m.time);
                      if (!Number.isNaN(d.getTime())) {
                        const ts = d.getTime();
                        if (lastDividerTime === null || Math.abs(ts - lastDividerTime) > FIVE_MIN) {
                          lastDividerTime = ts;
                          timeLabel = formatChatTime(m.time);
                          showDivider = true;
                        }
                      } else if (lastDividerTime === null) {
                        // 无法解析为时间的字符串，仅在第一条时展示一次
                        timeLabel = formatChatTime(m.time);
                        showDivider = !!timeLabel;
                        lastDividerTime = Date.now();
                      }
                    }

                    return (
                      <Fragment key={m.id}>
                        {showDivider && timeLabel && (
                          <div className={styles.timeDivider}>{timeLabel}</div>
                        )}
                        <div className={`${styles.msgRow} ${m.fromMe ? styles.me : ''}`}>
                          <UserAvatar src={m.fromMe ? user?.avatar : conv?.avatar} name={nick} size={55} />
                          <div className={styles.messageMeta}>
                            <div className={styles.messageSender}>{nick}</div>
                            <div className={`${styles.bubble} ${m.fromMe ? styles.me : ''}`}>
                              {isImage ? (
                                <a href={m.content} target="_blank" rel="noreferrer">
                                  <img src={m.content} alt="图片" className={styles.bubbleImage} />
                                </a>
                              ) : (
                                m.content
                              )}
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    );
                  });
                })() : <Empty description="暂无消息" />
              ) : (
                <Empty description="请选择会话" />
              )}
            </div>
            <div className={styles.inputBar}>
              <Input.TextArea
                autoSize={{ minRows: 1, maxRows: 4 }}
                placeholder="输入消息..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
              />
              <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
                发送
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


