import { Card, Tag, Badge } from '../../ui';
import { BitsAnimated } from '../../ui/reactBits';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types/product';
import { formatPrice } from '../../utils/format';
import { CONDITIONS } from '../../utils/constants';
import { resolveAsset } from '../../utils/url';
import styles from './index.module.css';

interface ProductCardProps {
  product: Product;
  onFavorite?: (id: number) => void;
}

export const ProductCard = ({ product, onFavorite }: ProductCardProps) => {
  const navigate = useNavigate();

  const condition = CONDITIONS.find(c => c.value === product.condition);
  const firstImage = Array.isArray(product.images) ? product.images[0] : undefined;
  let coverImage = resolveAsset(product.coverImage || firstImage || '/placeholder.jpg') || '/placeholder.jpg';

  const handleClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <BitsAnimated.View hoverScale={1.02} style={{ borderRadius: 16 }}>
      <Card
        className={styles.card}
        hoverable
        cover={
          <div className={styles.cover} onClick={handleClick}>
            <img src={coverImage} alt={product.title} loading="lazy" />
            {product.status === 'RESERVED' && (
              <Badge count="已预订" className={styles.statusBadge} />
            )}
            {product.status === 'SOLD' && (
              <Badge count="已售出" status="default" className={styles.statusBadge} />
            )}
            <div className={styles.tags}>
              {condition && (
                <Tag
                  color={condition.color}
                  onClick={(e) => { e.stopPropagation(); navigate(`/products?condition=${product.condition}`); }}
                  style={{ cursor: 'pointer' }}
                >
                  {condition.label}
                </Tag>
              )}
              <Tag
                color="#165dff"
                onClick={(e) => { e.stopPropagation(); navigate(`/products?campus=${encodeURIComponent(product.campus || '')}`); }}
                style={{ cursor: 'pointer' }}
              >
                {product.campus || '未设置校区'}
              </Tag>
            </div>
          </div>
        }
      >
        <div className={styles.content} onClick={handleClick}>
          <h3 className={styles.title}>{product.title}</h3>
          <p className={styles.description}>
            {product.description || '暂无描述'}
          </p>
          <div className={styles.price}>{formatPrice(product.price)}</div>
        </div>
      </Card>
    </BitsAnimated.View>
  );
}
;

