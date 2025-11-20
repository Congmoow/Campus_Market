import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Row, Col, Tag, Button, Descriptions, Divider, Spin, Empty, Message, Modal, Form, Radio, Input, Alert } from '../../ui';
import { HeartOutlined, HeartFilled, CheckCircleOutlined, BarChartOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { ImageGallery } from './ImageGallery';
import { ProductCard } from '../../components/ProductCard';
import { useProduct, useToggleFavorite } from '../../hooks/useProducts';
import { formatPrice, formatTime, formatNumber } from '../../utils/format';
import { CONDITIONS } from '../../utils/constants';
import styles from './index.module.css';
import { chatService } from '../../services/chatService';
import { useCreateOrder } from '../../hooks/useOrders';
import UserAvatar from '../../components/common/UserAvatar';
import { useUserStore } from '../../store/userStore';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  const { user } = useUserStore();
  const historyKey = user ? `browsingHistory:${user.id}` : 'browsingHistory:guest';

  const { data: product, isLoading } = useProduct(productId);
  const toggleFavorite = useToggleFavorite();
  const [isFavorited, setIsFavorited] = useState(false);
  const [buyVisible, setBuyVisible] = useState(false);
  const [buyForm] = Form.useForm();
  const createOrder = useCreateOrder();

  useEffect(() => {
    if (product && typeof product.favorited === 'boolean') {
      setIsFavorited(!!product.favorited);
    }
  }, [product]);

  const handleFavorite = () => {
    const prev = isFavorited;
    const next = !prev;
    setIsFavorited(next);
    toggleFavorite.mutate(productId, {
      onSuccess: () => {
        Message.success(next ? '收藏成功' : '取消收藏成功');
      },
      onError: () => {
        setIsFavorited(prev);
        Message.error(next ? '收藏失败' : '取消收藏失败');
      }
    });
  };

  const handleContactSeller = async () => {
    try {
      if (product?.seller?.id) {
        const conv = await chatService.openConversation({ peerId: product.seller.id, name: product.seller.nickname, avatar: product.seller.avatar });
        if (conv?.id) {
          const params = new URLSearchParams();
          params.set('cid', String(conv.id));
          params.set('sid', String(product.seller.id));
          if (conv.threadId) {
            params.set('thread', String(conv.threadId));
          }
          navigate(`/chat?${params.toString()}`);
          return;
        }
      }
    } catch {}
    if (product?.seller?.id) {
      const params = new URLSearchParams();
      params.set('sid', String(product.seller.id));
      navigate(`/chat?${params.toString()}`);
    } else {
      navigate(`/chat`);
    }
  };

  // 进入详情页写入浏览历史（必须放在任何 return 之前，避免 Hooks 顺序变化）
  useEffect(() => {
    if (!product) return;
    try {
      const stored = localStorage.getItem(historyKey);
      const history: any[] = stored ? JSON.parse(stored) : [];
      const simplified = {
        id: product.id,
        title: product.title,
        price: product.price,
        coverImage: product.coverImage,
        images: product.images,
        status: product.status,
        campus: product.campus,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        condition: product.condition,
        favorites: product.favorites,
        seller: product.seller,
        createdAt: product.createdAt,
        views: product.views,
        updatedAt: product.updatedAt,
        description: product.description,
      };
      const filtered = history.filter((item) => item?.id !== product.id);
      filtered.unshift(simplified);
      const trimmed = filtered.slice(0, 30);
      localStorage.setItem(historyKey, JSON.stringify(trimmed));
    } catch (error) {
      console.warn('更新浏览历史失败', error);
    }
  }, [product, historyKey]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.empty}>
        <Empty description="商品不存在" />
        <Button type="primary" onClick={() => navigate('/')}>
          返回首页
        </Button>
      </div>
    );
  }

  const condition = CONDITIONS.find(c => c.value === product.condition);

  const descriptionItems = [
    { key: 'status', label: '商品状态', children: product.status === 'ACTIVE' ? '在售' : '已下架' },
    { key: 'campus', label: '所在校区', children: product.campus },
    { key: 'condition', label: '商品成色', children: condition?.label || '未知' },
    product.categoryName ? { key: 'category', label: '所属分类', children: product.categoryName } : null,
    { key: 'updatedAt', label: '更新时间', children: formatTime(product.updatedAt) },
  ].filter(Boolean) as { key: string; label: string; children: React.ReactNode }[];

  return (
    <div className={styles.detailPage}>
      <div className={styles.container}>
        <Row gutter={24} className={styles.cardSection}>
          {/* Left: Images */}
          <Col xs={24} lg={12}>
            <div className={styles.leftColumn}>
              <div className={styles.sellerCard}>
                <div className={styles.sellerInfo}>
                  <UserAvatar
                    size={52}
                    src={product.seller?.avatar}
                    name={product.seller?.nickname || '卖家'}
                  />
                  <div className={styles.sellerMeta}>
                    <span className={styles.sellerName}>{product.seller?.nickname || '卖家'}</span>
                    <span className={styles.sellerSub}>
                      发布于 {formatTime(product.createdAt)}
                      {product.campus ? ` · ${product.campus}` : ''}
                    </span>
                  </div>
                </div>
                <div className={styles.sellerActions}>
                  <Button
                    size="middle"
                    type="primary"
                    className={styles.sellerContactButton}
                    onClick={handleContactSeller}
                  >
                    联系卖家
                  </Button>
                </div>
              </div>
              <ImageGallery images={product.images} />
            </div>
          </Col>

          {/* Right: Product Info */}
          <Col xs={24} lg={12} className={styles.rightColumn}>
            <div className={styles.productInfo}>
              <div className={styles.productBody}>
                <div className={styles.header}>
                  <h1 className={styles.title}>{product.title}</h1>
                  <div className={styles.viewStats}>
                    <BarChartOutlined />
                    <span>{formatNumber(product.views)} 次浏览</span>
                  </div>
                </div>
                <Divider />

                <div className={styles.price}>{formatPrice(product.price)}</div>
                <div className={styles.guarantees}>
                  <span className={styles.guaranteeItem}><CheckCircleOutlined style={{ color: '#00b42a' }} /> 当面验货</span>
                  <span className={styles.guaranteeItem}><CheckCircleOutlined style={{ color: '#165dff' }} /> 信息真实</span>
                  <span className={styles.guaranteeItem}><CheckCircleOutlined style={{ color: '#ff7d00' }} /> 低价优选</span>
                </div>

                <div className={styles.tags}>
                        {condition && (
                          <Tag
                            color={condition.color}
                            onClick={() => navigate(`/products?condition=${encodeURIComponent(product.condition)}`)}
                            style={{ cursor: 'pointer', fontSize: 16 }}
                          >
                            {condition.label}
                          </Tag>
                        )}
                        <Tag
                          color="blue"
                          onClick={() => navigate(`/products?campus=${encodeURIComponent(product.campus)}`)}
                          style={{ cursor: 'pointer', fontSize: 16 }}
                        >
                          {product.campus}
                        </Tag>
                        {product.categoryName && (
                          <Tag
                            onClick={() => navigate(`/products?categoryId=${product.categoryId}`)}
                            style={{ cursor: 'pointer', fontSize: 16 }}
                          >
                            {product.categoryName}
                          </Tag>
                        )}
                </div>

                <Divider />

                <div className={styles.description}>
                  <h3>商品描述</h3>
                  <p>{product.description || '暂无描述'}</p>
                </div>

                <Divider />

                <Descriptions column={2} className={styles.specs} items={descriptionItems} />
              </div>

              {/* 收藏 + 立即购买 */}
              <div className={styles.actions}>
                <Button
                  size="large"
                  className={styles.contactButton}
                  onClick={handleFavorite}
                  icon={isFavorited ? <HeartFilled style={{ color: '#f53f3f' }} /> : <HeartOutlined />}
                >
                  收藏
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setBuyVisible(true)}
                  className={styles.buyButton}
                >
                  立即购买（线下支付）
                </Button>
              </div>
            </div>

            {/* 交易提醒：仅右侧独立区域 */}
            <div className={styles.tradeNotice}>
              <Alert
                type="warning"
                showIcon={false}
                message={
                  <div>
                    <p style={{ marginBottom: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ExclamationCircleOutlined style={{ color: '#f77234' }} />
                      交易提示
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>建议当面交易，验货后付款</li>
                      <li>警惕异常低价，谨防诈骗</li>
                      <li>保护个人隐私信息</li>
                    </ul>
                  </div>
                }
              />
            </div>
          </Col>
        </Row>

        {/* Recommended Products */}
        <div className={styles.recommended}>
          <h2>相似推荐</h2>
          <Row gutter={[20, 24]}>
            {/* Mock data - would fetch similar products in real app */}
            {[].map((p: any) => (
              <Col key={p.id} xs={24} sm={12} md={12} lg={8}>
                <ProductCard product={p} />
              </Col>
            ))}
          </Row>
          {[].length === 0 && (
            <Empty description="暂无推荐商品" />
          )}
        </div>
      </div>

      {/* 下单弹窗 */}
      <Modal
        title="下单"
        open={buyVisible}
        onCancel={() => setBuyVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={buyForm}
          layout="vertical"
          onFinish={async (vals) => {
            try {
              await createOrder.mutateAsync({
                productId,
                quantity: 1,
                shippingMethod: vals.shippingMethod || 'DELIVERY',
                shippingAddress: vals.shippingAddress,
              });
              Message.success('下单成功');
              setBuyVisible(false);
              navigate('/orders');
            } catch (e: any) {
              const msg = e?.response?.data?.message || e?.message || '下单失败';
              Message.error(msg);
            }
          }}
          initialValues={{ shippingMethod: 'DELIVERY' }}
        >
          <Form.Item name="shippingMethod" label="配送方式">
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="DELIVERY">快递</Radio.Button>
              <Radio.Button value="PICKUP">自提</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue }) =>
              getFieldValue('shippingMethod') !== 'PICKUP' ? (
                <Form.Item
                  name="shippingAddress"
                  label="收货地址"
                  rules={[{ required: true, message: '请输入收货地址' }]}
                >
                  <Input placeholder="请输入收货地址" />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={createOrder.isPending}>
              提交订单
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      {/* 移动端底部固定操作栏 */}
      <div className={styles.stickyBar}>
        <div className={styles.stickyPrice}>{formatPrice(product.price)}</div>
        <div className={styles.stickyActions}>
          <Button size="large" className={styles.contactButton} onClick={handleFavorite} icon={isFavorited ? <HeartFilled style={{ color: '#f53f3f' }} /> : <HeartOutlined />}>收藏</Button>
          <Button type="primary" size="large" className={styles.buyButton} onClick={() => setBuyVisible(true)}>立即联系</Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

