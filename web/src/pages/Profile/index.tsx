import { Button, Tabs, Empty, Spin, Badge, Row, Col } from '../../ui';
import {
  EditOutlined,
  HeartOutlined,
  StarOutlined,
  HistoryOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  TagOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { ProductCard } from '../../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/productService';
import styles from './index.module.css';
import { resolveAsset } from '../../utils/url';
import UserAvatar from '../../components/common/UserAvatar';

export const ProfilePage = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const { data: myProducts, isLoading: loadingMy } = useQuery({
    queryKey: ['myProducts', { page: 0, size: 200 }],
    queryFn: () => productService.getMyProducts({ page: 0, size: 200 }),
    enabled: !!user,
  });
  const { data: myFavorites, isLoading: loadingFav } = useQuery({
    queryKey: ['myFavorites', { page: 0, size: 200 }],
    queryFn: () => productService.getMyFavorites({ page: 0, size: 200 }),
    enabled: !!user,
  });
  const [activeTab, setActiveTab] = useState<'works' | 'favorites' | 'history'>('works');
  const historyKey = user ? `browsingHistory:${user.id}` : 'browsingHistory:guest';
  const browsingHistory: any[] = (() => {
    try {
      const stored = localStorage.getItem(historyKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })();

  if (!user) {
    return (
      <div className={styles.empty}>
        <p>请先登录</p>
        <Button type="primary" onClick={() => navigate('/login')}>
          去登录
        </Button>
      </div>
    );
  }

  const works = (myProducts?.content || []) as any[];
  const favoritesList = (myFavorites?.content || []) as any[];
  const activeCount = works.filter((p: any) => p.status === 'ACTIVE').length;
  const soldCount = works.filter((p: any) => p.status === 'SOLD').length;
  const favoriteCount = myFavorites?.totalElements || (favoritesList?.length ?? 0);

  const renderGrid = (list: any[]) => {
    if (!list || list.length === 0) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Empty description="暂无内容" />
        </div>
      );
    }
    return (
      <Row gutter={[16, 16]}>
        {list.map((product: any) => (
          <Col key={product.id} xs={12} sm={8} md={6} lg={6} xl={4}>
            {/* 复用 ProductCard 渲染商品 */}
            {/* @ts-ignore */}
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className={styles.profilePage}>
      {/* 封面横幅 */}
      <div
        className={styles.coverBanner}
        style={
          user.coverImage
            ? {
                backgroundImage: `url(${resolveAsset(user.coverImage)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }
            : undefined
        }
      />

      <div className={styles.container}>
        {/* 个人信息卡片 */}
        <div className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <UserAvatar
              size={120}
              src={user.avatar}
              name={user.nickname}
              className={styles.avatar}
            />
          </div>

          <div className={styles.profileMain}>
            <div className={styles.profileHeader}>
              <div className={styles.nameSection}>
                <div className={styles.nameRow}>
                  <h1 className={styles.username}>{user.nickname}</h1>
                  <span className={styles.campusTag}>
                    <EnvironmentOutlined className={styles.campusIcon} />
                    <span>{user.campus || '未设置校区'}</span>
                  </span>
                </div>
                <span className={styles.userId}>ID: {user.id}</span>
              </div>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                size="large"
                className={styles.editButton}
                onClick={() => navigate('/profile/edit')}
              >
                编辑资料
              </Button>
            </div>

            {/* 统计数据 */}
            <div className={styles.statsGrid}>
              <div
                className={styles.statItem}
                onClick={() => setActiveTab('works')}
              >
                <TagOutlined className={styles.statIcon} style={{ color: '#165dff' }} />
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{activeCount}</span>
                  <span className={styles.statLabel}>在售商品</span>
                </div>
              </div>
              <div
                className={styles.statItem}
                onClick={() => setActiveTab('works')}
              >
                <CheckCircleOutlined className={styles.statIcon} style={{ color: '#00b42a' }} />
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{soldCount}</span>
                  <span className={styles.statLabel}>已售商品</span>
                </div>
              </div>
              <div
                className={styles.statItem}
                onClick={() => setActiveTab('favorites')}
              >
                <HeartOutlined className={styles.statIcon} style={{ color: '#ff7d00' }} />
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{favoriteCount}</span>
                  <span className={styles.statLabel}>我的收藏</span>
                </div>
              </div>
              <div
                className={styles.statItem}
                onClick={() => setActiveTab('history')}
              >
                <EyeOutlined className={styles.statIcon} style={{ color: '#f7ba1e' }} />
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{browsingHistory.length}</span>
                  <span className={styles.statLabel}>浏览历史</span>
                </div>
              </div>
            </div>

            {/* 详细信息 */}
            <div className={styles.infoGrid}>
              {user.email && (
                <div className={styles.infoItem}>
                  <MailOutlined className={styles.infoIcon} />
                  <span>{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className={styles.infoItem}>
                  <PhoneOutlined className={styles.infoIcon} />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs 内容区 */}
        <div className={styles.tabsContainer}>
          <Tabs 
            activeKey={activeTab} 
            onChange={(key) => setActiveTab(key as any)}
            className={styles.tabs}
            type="line"
            items={[
              {
                key: 'works',
                label: (
                  <span className={styles.tabTitle}>
                    <StarOutlined />
                    <span>我的作品</span>
                    <Badge count={works.length} className={styles.tabBadge} />
                  </span>
                ),
              },
              {
                key: 'favorites',
                label: (
                  <span className={styles.tabTitle}>
                    <HeartOutlined />
                    <span>我的收藏</span>
                    <Badge count={favoriteCount} className={styles.tabBadge} />
                  </span>
                ),
              },
              {
                key: 'history',
                label: (
                  <span className={styles.tabTitle}>
                    <HistoryOutlined />
                    <span>浏览历史</span>
                    <Badge count={browsingHistory.length} className={styles.tabBadge} />
                  </span>
                ),
              },
            ]}
          />

          <div className={styles.tabContent}>
            {(loadingMy || loadingFav) ? (
              <div className={styles.loadingContainer}>
                <Spin size="large" />
                <p>加载中...</p>
              </div>
            ) : (
              <>
                {activeTab === 'works' && renderGrid(works)}
                {activeTab === 'favorites' && renderGrid(favoritesList)}
                {activeTab === 'history' && renderGrid(browsingHistory)}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

