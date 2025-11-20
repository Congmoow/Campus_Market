import { useMemo, useState, useEffect, useRef } from 'react';
import { Input, Button, Avatar, Dropdown, Badge, Switch, Popover } from '../../ui';
import { SearchOutlined, UploadOutlined, UserOutlined, MessageOutlined, HeartOutlined, HistoryOutlined, RightOutlined, AppstoreOutlined, ScheduleOutlined, SunOutlined, MoonOutlined, PoweroffOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { AuthModal } from '../AuthModal';
import { useAuthModalStore } from '../../store/authModalStore';
import logoImg from '../../assets/zjsu-logo.jpg';
import styles from './Header.module.css';
import { useThemeStore } from '../../store/themeStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../../services/chatService';
import UserAvatar from '../common/UserAvatar';
import { userService } from '../../services/userService';

export const Header = () => {
  const navigate = useNavigate();
  const { user, logout, setUser, token } = useUserStore();
  const queryClient = useQueryClient();
  const authModalStore = useAuthModalStore();
  const [authModalVisible, setAuthModalVisible] = useState(authModalStore.visible);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>(authModalStore.defaultTab);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { theme, setTheme } = useThemeStore();

  // 登录后立即拉取用户信息，确保头像即刻显示
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (!token) {
      fetchedRef.current = false;
      return;
    }
    if (fetchedRef.current) return; // 避免重复请求
    fetchedRef.current = true;
    userService.getMe()
      .then((profile) => {
        setUser(profile);
      })
      .catch(() => {
        // token 无效，清理登录态，避免后续接口 401 干扰
        logout();
      });
  }, [token, setUser]);

  const { data: chatConversations, refetch: refetchChatConversations } = useQuery({
    queryKey: ['chatConversations'],
    queryFn: chatService.getConversations,
    enabled: !!user,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: 'always',
    refetchIntervalInBackground: true,
  });

  const unreadTotal = useMemo(() => {
    if (!chatConversations || chatConversations.length === 0) return 0;
    return chatConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  }, [chatConversations]);
  const unreadDisplay = unreadTotal > 0 ? unreadTotal : null;
  const [searchValue, setSearchValue] = useState('');

  const messagePreviewContent = useMemo(() => {
    if (!user) {
      return <div className={styles.messagePreviewEmpty}>登录后查看消息</div>;
    }
    if (!chatConversations || chatConversations.length === 0) {
      return <div className={styles.messagePreviewEmpty}>暂无消息</div>;
    }
    const sorted = [...chatConversations].sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0));
    const items = sorted
      .filter(conv => conv.lastMessageFromPeer)
      .slice(0, 5);
    if (items.length === 0) {
      return <div className={styles.messagePreviewEmpty}>暂无消息</div>;
    }
    return (
      <div className={styles.messagePreview}>
        {items.map((conv) => (
          <div key={conv.id} className={styles.messagePreviewItem}>
            <div className={styles.messagePreviewName}>{conv.name || '未知用户'}</div>
            <div className={styles.messagePreviewMessage}>{conv.lastMessageFromPeer}</div>
          </div>
        ))}
      </div>
    );
  }, [chatConversations, user]);

  const handleNavigateChat = () => {
    queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
    const target = chatConversations?.find(conv => (conv.unreadCount || 0) > 0) || chatConversations?.[0];
    const targetParams = target ? `cid=${target.id}&thread=${target.threadId}` : '';
    const targetPath = target ? `/chat?${targetParams}` : '/chat';
    requireLogin(targetPath, () => navigate(targetPath));
  };

  useEffect(() => {
    if (authModalStore.visible) {
      setAuthModalVisible(true);
      setAuthModalTab(authModalStore.defaultTab);
    } else {
      setAuthModalVisible(false);
    }
  }, [authModalStore.visible, authModalStore.defaultTab]);

  // 登录后立刻刷新会话与用户数据，确保头像和未读数即时显示
  useEffect(() => {
    if (user) {
      // 立即刷新未读消息，避免等定时轮询
      refetchChatConversations();
    } else {
      // 登出后清理旧数据，避免红点残留
      queryClient.removeQueries({ queryKey: ['chatConversations'] });
    }
  }, [!!user, queryClient, refetchChatConversations]);

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(value)}`);
    }
  };

  const triggerSearch = () => handleSearch(searchValue);

  const openLoginModal = (redirectPath?: string) => {
    if (redirectPath) {
      window.sessionStorage.setItem('pendingRedirect', redirectPath);
    }
    authModalStore.openModal('login');
  };

  const requireLogin = (redirectPath: string, action: () => void) => {
    if (user) {
      action();
    } else {
      openLoginModal(redirectPath);
    }
  };

  const userMenu = (
    <div className={styles.userDropdown}>
      <div className={styles.userDropdownHeader}>
        <UserAvatar
          src={user?.avatar}
          name={user?.nickname || user?.email}
          size={96}
          className={styles.userDropdownAvatar}
        />
        <div className={styles.userDropdownInfo}>
          <div className={styles.userDropdownName}>{user?.nickname || '用户'}</div>
          {user?.campus && <div className={styles.userDropdownCampus}>{user.campus}</div>}
        </div>
      </div>
      <div className={styles.userDropdownMenu}>
        <div className={styles.userDropdownMenuItem}>
          <div className={styles.userDropdownMenuItemLeft}>
            {theme === 'dark' ? (
              <MoonOutlined className={styles.userDropdownMenuIcon} />
            ) : (
              <SunOutlined className={styles.userDropdownMenuIcon} />
            )}
            <div className={styles.userDropdownMenuText}>
              <span>主题模式 - {theme === 'dark' ? '暗色' : '亮色'}</span>
            </div>
          </div>
          <div className={styles.userDropdownMenuAction}>
            <Switch
              className={styles.themeSwitch}
              checked={theme === 'dark'}
              onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </div>
        <div className={styles.userDropdownDivider} />
        <div className={styles.userDropdownMenuItem} onClick={() => navigate('/profile')}>
          <div className={styles.userDropdownMenuItemLeft}>
            <UserOutlined className={styles.userDropdownMenuIcon} />
            <span>个人中心</span>
          </div>
          <RightOutlined className={styles.userDropdownMenuArrow} />
        </div>
        <div className={styles.userDropdownMenuItem} onClick={() => navigate('/my-products')}>
          <div className={styles.userDropdownMenuItemLeft}>
            <AppstoreOutlined className={styles.userDropdownMenuIcon} />
            <span>我的商品</span>
          </div>
          <RightOutlined className={styles.userDropdownMenuArrow} />
        </div>
        <div className={styles.userDropdownMenuItem} onClick={() => navigate('/orders')}>
          <div className={styles.userDropdownMenuItemLeft}>
            <ScheduleOutlined className={styles.userDropdownMenuIcon} />
            <span>我的订单</span>
          </div>
          <RightOutlined className={styles.userDropdownMenuArrow} />
        </div>
        <div className={styles.userDropdownDivider} />
        <div className={`${styles.userDropdownMenuItem} ${styles.userDropdownLogout}`} onClick={() => { logout(); navigate('/'); }}>
          <div className={styles.userDropdownMenuItemLeft}>
            <PoweroffOutlined className={styles.userDropdownMenuIcon} />
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          <img src={logoImg} alt="浙水院校徽" className={styles.logoIconImg} />
          <div className={styles.logoText}>
            {'浙水院闲置市场'.split('').map((char, index) => (
              <span key={index} className={styles.logoChar} style={{ animationDelay: `${index * 0.1}s` }}>
                {char}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.search}>
          <div className={styles.searchField}>
            <Input
              className={styles.searchInput}
              placeholder="搜索商品..."
              size="large"
              prefix={<SearchOutlined />}
              allowClear
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={triggerSearch}
            />
            <Button className={styles.searchButton} type="text" onClick={triggerSearch}>
              搜索
            </Button>
          </div>
        </div>

        <div className={styles.actions}>
          {/* 用户头像 */}
          <div className={`${styles.actionItem} ${styles.avatarItem}`}>
            {user ? (
              <Dropdown
                dropdownRender={() => userMenu}
                placement="bottom"
                trigger={['hover']}
                onOpenChange={setDropdownVisible}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}>
                  <div style={{ 
                    opacity: dropdownVisible ? 0 : 1,
                    transition: 'opacity 0.2s ease',
                    pointerEvents: dropdownVisible ? 'none' : 'auto',
                  }}>
                    <UserAvatar
                      src={user?.avatar}
                      name={user?.nickname || user?.email}
                      size={48}
                    />
                  </div>
                </div>
              </Dropdown>
            ) : (
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                onClick={() => { setAuthModalTab('login'); setAuthModalVisible(true); authModalStore.openModal('login'); }}
              >
                <Avatar size={48} style={{ cursor: 'pointer', backgroundColor: 'rgba(22, 93, 255, 0.1)', color: 'var(--brand-6, #165dff)' }}>
                  <UserOutlined />
                </Avatar>
                <span className={styles.guaranteeItem}>登录</span>
              </div>
            )}
          </div>

          {/* 消息 */}
          <Popover
            trigger="hover"
            placement="bottom"
            content={messagePreviewContent}
            mouseEnterDelay={0.4}
            mouseLeaveDelay={0.8}
            destroyTooltipOnHide
            open={messagePreviewContent ? undefined : false}
          >
            <div 
              className={styles.actionItem}
              onClick={handleNavigateChat}
            >
              <Badge count={unreadDisplay ?? 0} overflowCount={99}>
                <MessageOutlined className={styles.actionIcon} />
              </Badge>
              <span className={styles.actionText}>消息</span>
            </div>
          </Popover>

          {/* 收藏 */}
          <div 
            className={styles.actionItem}
            onClick={() => requireLogin('/favorites', () => navigate('/favorites'))}
          >
            <Badge>
              <HeartOutlined className={styles.actionIcon} />
            </Badge>
            <span className={styles.actionText}>收藏</span>
          </div>

          {/* 历史 */}
          <div 
            className={styles.actionItem}
            onClick={() => navigate('/history')}
          >
            <HistoryOutlined className={styles.actionIcon} />
            <span className={styles.actionText}>历史</span>
          </div>

          {/* 投稿按钮 */}
          <Button
            type="primary"
            onClick={() => {
              if (user) {
                navigate('/publish');
              } else {
                openLoginModal('/publish');
              }
            }}
            className={styles.publishBtn}
          >
            <UploadOutlined className={styles.publishIcon} />
            <span className={styles.publishText}>发布闲置</span>
          </Button>
        </div>
          </div>
        </header>
        <AuthModal
          visible={authModalVisible}
          onClose={() => { setAuthModalVisible(false); authModalStore.closeModal(); }}
          defaultTab={authModalTab}
        />
    </>
      );
    };



