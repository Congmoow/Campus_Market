import { Empty, Button, Spin, Row, Col } from '../../ui';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../../components/ProductCard';
import { useUserStore } from '../../store/userStore';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/productService';
import { useAuthModalStore } from '../../store/authModalStore';
import styles from './index.module.css';

export const FavoritesPage = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const { openModal } = useAuthModalStore();
  const { data: favData, isLoading } = useQuery({
    queryKey: ['myFavorites', { page: 0, size: 100 }],
    queryFn: () => productService.getMyFavorites({ page: 0, size: 100 }),
    enabled: !!user,
  });
  
  const favorites = favData?.content || [];

  if (!user) {
    return (
      <div className={styles.empty}>
        <Empty description="请先登录查看收藏" />
        <Button type="primary" onClick={() => { sessionStorage.setItem('pendingRedirect', '/favorites'); openModal('login'); navigate('/'); }}>
          去登录
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.favoritesPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>我的收藏</h1>
          <p>共 {favorites.length} 件商品</p>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <Spin size="large" />
          </div>
        ) : favorites.length > 0 ? (
          <Row gutter={[16, 16]}>
            {favorites.map((product: any) => (
              <Col key={product.id} xs={12} sm={8} md={6} lg={4}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        ) : (
          <div className={styles.emptyState}>
            <Empty description="还没有收藏任何商品" />
            <Button type="primary" onClick={() => navigate('/products')}>
              去逛逛
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

