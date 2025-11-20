import { useState } from 'react';
import { Empty, Button, Spin, Tabs, Tag, Message, Row, Col, Popconfirm } from '../../ui';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../../components/ProductCard';
import { useUserStore } from '../../store/userStore';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/productService';
import { useUpdateProductStatus } from '../../hooks/useProducts';
import styles from './index.module.css';

export const MyProductsPage = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const updateStatus = useUpdateProductStatus();
  const { data: myProductsData, isLoading: loadingMy } = useQuery({
    queryKey: ['myProducts', { page: 0, size: 50 }],
    queryFn: () => productService.getMyProducts({ page: 0, size: 50 }),
    enabled: !!user,
  });
  
  const products = {
    active: (myProductsData?.content || []).filter(p => p.status === 'ACTIVE'),
    reserved: (myProductsData?.content || []).filter(p => p.status === 'RESERVED'),
    sold: (myProductsData?.content || []).filter(p => p.status === 'SOLD'),
    deleted: (myProductsData?.content || []).filter(p => p.status === 'DELETED'),
  };

  if (!user) {
    return (
      <div className={styles.empty}>
        <Empty description="请先登录查看我的商品" />
        <Button type="primary" onClick={() => navigate('/login')}>
          去登录
        </Button>
      </div>
    );
  }

  const currentProducts =
    activeTab === 'active'
      ? [...products.active, ...products.reserved]
      : products.sold;

  const handleUpdateStatus = (id: number, status: 'ACTIVE' | 'RESERVED' | 'SOLD' | 'DELETED') => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          Message.success('操作成功');
        },
      }
    );
  };

  const renderActions = (product: any) => {
    switch (product.status) {
      case 'ACTIVE':
        return (
          <div className={styles.cardActions}>
            <Button size="small" onClick={() => handleUpdateStatus(product.id, 'RESERVED')}>预订</Button>
            <Button size="small" onClick={() => handleUpdateStatus(product.id, 'SOLD')}>标记售出</Button>
            <Popconfirm title="确认下架该商品？" onConfirm={() => handleUpdateStatus(product.id, 'DELETED')}>
              <Button size="small" danger>下架</Button>
            </Popconfirm>
          </div>
        );
      case 'RESERVED':
        return (
          <div className={styles.cardActions}>
            <Button size="small" onClick={() => handleUpdateStatus(product.id, 'ACTIVE')}>取消预订</Button>
            <Button size="small" onClick={() => handleUpdateStatus(product.id, 'SOLD')}>标记售出</Button>
            <Popconfirm title="确认下架该商品？" onConfirm={() => handleUpdateStatus(product.id, 'DELETED')}>
              <Button size="small" danger>下架</Button>
            </Popconfirm>
          </div>
        );
      case 'SOLD':
        return (
          <div className={styles.cardActions}>
            <Button size="small" type="primary" onClick={() => handleUpdateStatus(product.id, 'ACTIVE')}>重新上架</Button>
          </div>
        );
      case 'DELETED':
        return (
          <div className={styles.cardActions}>
            <Button size="small" type="primary" onClick={() => handleUpdateStatus(product.id, 'ACTIVE')}>上架</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.myProductsPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>我的商品</h1>
            <p>管理你发布的所有商品</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/publish')}
          >
            发布新商品
          </Button>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          items={[
            {
              key: 'active',
              label: (
                <span>
                  在售 <Tag color="blue">{products.active.length + products.reserved.length}</Tag>
                </span>
              ),
            },
            {
              key: 'sold',
              label: (
                <span>
                  已售出 <Tag color="green">{products.sold.length}</Tag>
                </span>
              ),
            },
          ]}
        />

        <div className={styles.content}>
          {loading || loadingMy ? (
            <div className={styles.loading}>
              <Spin size="large" />
            </div>
          ) : currentProducts.length > 0 ? (
            <Row gutter={[16, 16]}>
              {currentProducts.map((product: any) => (
                <Col key={product.id} xs={12} sm={8} md={6} lg={4}>
                  <ProductCard product={product} />
                  {renderActions(product)}
                </Col>
              ))}
            </Row>
          ) : (
            <div className={styles.emptyState}>
              <Empty description="暂无商品" />
              {activeTab === 'active' && (
                <Button type="primary" onClick={() => navigate('/publish')}>
                  发布商品
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

