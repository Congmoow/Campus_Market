import { useState } from 'react';
import { Empty, Button, Row, Col, Message } from '../../ui';
import { DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../../components/ProductCard';
import { useToggleFavorite } from '../../hooks/useProducts';
import styles from './index.module.css';
import type { Product } from '../../types/product';
import { useUserStore } from '../../store/userStore';

export const HistoryPage = () => {
  const navigate = useNavigate();
  const toggleFavorite = useToggleFavorite();
  const { user } = useUserStore();
  const historyKey = user ? `browsingHistory:${user.id}` : 'browsingHistory:guest';
  
  // 从 localStorage 获取浏览历史
  const [history, setHistory] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(historyKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleFavorite = (productId: number) => {
    toggleFavorite.mutate(productId);
  };

  const handleClearAll = () => {
    localStorage.removeItem(historyKey);
    setHistory([]);
    Message.success('已清空浏览记录');
  };

  const handleRemoveItem = (productId: number) => {
    const newHistory = history.filter(p => p.id !== productId);
    localStorage.setItem(historyKey, JSON.stringify(newHistory));
    setHistory(newHistory);
    Message.success('已删除该记录');
  };

  if (history.length === 0) {
    return (
      <div className={styles.historyPage}>
        <div className={styles.container}>
          <div className={styles.emptyContainer}>
            <Empty 
              description={
                <div className={styles.emptyContent}>
                  <ClockCircleOutlined style={{ fontSize: 64, color: '#86909c', marginBottom: 16 }} />
                  <h3>暂无浏览记录</h3>
                  <p>快去浏览心仪的商品吧~</p>
                </div>
              }
            />
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/products')}
              style={{ marginTop: 24 }}
            >
              去逛逛
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.historyPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <ClockCircleOutlined className={styles.titleIcon} />
            <div>
              <h1 className={styles.title}>浏览历史</h1>
              <p className={styles.subtitle}>共 {history.length} 条记录</p>
            </div>
          </div>
          
          <Button 
            type="primary" 
            danger
            icon={<DeleteOutlined />}
            onClick={handleClearAll}
          >
            清空记录
          </Button>
        </div>

        <div className={styles.historyList}>
          <Row gutter={[20, 20]}>
            {history.map(product => (
              <Col key={product.id} xs={12} sm={8} md={6} lg={6} xl={4}>
                <div className={styles.historyItem}>
                  <ProductCard 
                    product={product} 
                    onFavorite={handleFavorite} 
                  />
                  <div className={styles.itemOverlay}>
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(product.id);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
};

