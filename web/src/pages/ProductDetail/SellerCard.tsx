import { Button, Rate, Divider } from '../../ui';
import { UserOutlined, MessageOutlined } from '@ant-design/icons';
import UserAvatar from '../../components/common/UserAvatar';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types/product';
import styles from './SellerCard.module.css';

interface SellerCardProps {
  seller: Product['seller'];
}

export const SellerCard = ({ seller }: SellerCardProps) => {
  const navigate = useNavigate();

  const handleChat = () => {
    navigate(`/chat?sellerId=${seller.id}`);
  };

  const hasRating = typeof seller.rating === 'number' && !Number.isNaN(seller.rating as number);

  return (
    <div className={styles.sellerCard}>
      <div className={styles.header}>
        <h3>卖家信息</h3>
      </div>

      <div className={styles.sellerInfo}>
        <UserAvatar
          size={80}
          src={seller.avatar}
          name={seller.nickname || '卖家'}
        />

        <div className={styles.info}>
          <div className={styles.nickname}>{seller.nickname}</div>
          <div className={styles.campus}>{seller.campus}</div>
          {hasRating && (
            <div className={styles.rating}>
              <Rate value={seller.rating as number} allowHalf disabled />
              <span className={styles.ratingText}>({(seller.rating as number).toFixed(1)})</span>
            </div>
          )}
        </div>
      </div>

      <Divider />

      <Button
        type="primary"
        size="large"
        icon={<MessageOutlined />}
        onClick={handleChat}
        block
      >
        联系卖家
      </Button>

      <div className={styles.tips}>
        <p>交易提示</p>
        <ul>
          <li>建议当面交易，验货后付款</li>
          <li>警惕异常低价，谨防诈骗</li>
          <li>保护个人隐私信息</li>
        </ul>
      </div>
    </div>
  );
};

