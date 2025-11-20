import { Carousel, Spin, Empty } from '../../ui';
import { CategoryNav } from '../../components/CategoryNav';
import { ProductCard } from '../../components/ProductCard';
import { useProducts } from '../../hooks/useProducts';
import { useToggleFavorite } from '../../hooks/useProducts';
import styles from './index.module.css';
import type { Product } from '../../types/product';
import { FireOutlined } from '@ant-design/icons';

// Banner configurations with gradients and illustrations
const banners = [
  {
    id: 1,
    title: '毕业季·好物清仓',
    subtitle: '学长学姐带不走的，都是留给你的宝藏',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
    icon: '🎓',
    color: '#e11d48',
  },
  {
    id: 2,
    title: '数码装备·升级换代',
    subtitle: '高性价比二手电子产品，学生党的最爱',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    icon: '💻',
    color: '#7c3aed',
  },
  {
    id: 3,
    title: '教材漂流·知识传递',
    subtitle: '环保循环，让知识以更低的价格延续',
    gradient: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
    icon: '📚',
    color: '#059669',
  },
  {
    id: 4,
    title: '校园生活·闲置流转',
    subtitle: '让闲置物品流动起来，发现身边的惊喜',
    gradient: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
    icon: '🚲',
    color: '#2563eb',
  },
];

export const HomePage = () => {
  const { data: productsData, isLoading } = useProducts({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    // 仅显示在售商品
    // @ts-ignore
    status: 'ACTIVE',
  });

  const toggleFavorite = useToggleFavorite();

  const handleFavorite = (productId: number) => {
    toggleFavorite.mutate(productId);
  };

  const products = ((productsData as { content?: Product[] } | undefined)?.content ?? []) as Product[];

  const hasProducts = products.length > 0;

  return (
    <div className={styles.homePage}>
      <div className={styles.container}>
        {/* Top Banner Section */}
        <section className={styles.topSection}>
          <div className={styles.bannerSection}>
            <Carousel
              autoplay
              autoplaySpeed={5000}
              arrows
              effect="fade"
              style={{ height: 420 }}
            >
              {banners.map(banner => (
                <div key={banner.id}>
                  <div 
                    className={styles.banner}
                    style={{ background: banner.gradient }}
                  >
                    <div className={styles.bannerContent}>
                      <div className={styles.bannerIcon}>{banner.icon}</div>
                      <div className={styles.bannerText}>
                        <h2 style={{ color: banner.color }}>{banner.title}</h2>
                        <p style={{ color: banner.color, opacity: 0.8 }}>{banner.subtitle}</p>
                      </div>
                    </div>
                    <div className={styles.bannerDecor} />
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Main Content Split Layout */}
        <div className={styles.mainContent}>
          {/* Left: Products List */}
          <div className={styles.leftContent}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <FireOutlined className={styles.hotIcon} />
                  <span>热门商品</span>
                </h2>
              </div>

              {isLoading ? (
                <div className={styles.loading}>
                  <Spin size="large" />
                </div>
              ) : hasProducts ? (
                <div className={styles.productsRow}>
                  {products.map(product => (
                    <div key={product.id} className={styles.cardWrapper}>
                      <ProductCard product={product} onFavorite={handleFavorite} />
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="暂无商品" />
              )}
            </section>
          </div>

          {/* Right: Category Sidebar */}
          <div className={styles.rightSidebar}>
            <div className={styles.stickySidebar}>
              <CategoryNav />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

