import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../utils/constants';
import styles from './index.module.css';
import { RightOutlined } from '@ant-design/icons';

// 模拟子分类标签，用于视觉展示
const SUB_TAGS: Record<number, string[]> = {
  1: ['手机', '平板', '耳机', '充电宝'],
  2: ['教材', '考研', '小说', '笔记'],
  3: ['收纳', '台灯', '插座', '雨伞'],
  4: ['球拍', '滑板', '瑜伽', '健身'],
  5: ['男装', '女装', '鞋靴', '箱包'],
  6: ['彩妆', '护肤', '香水', '个护'],
  7: ['笔', '本子', '画材', '计算器'],
  8: ['乐器', '绿植', '票务', '其他'],
};

export const CategoryNav = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/products?categoryId=${categoryId}`);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h3>全部类目</h3>
      </div>
      <div className={styles.list}>
        {CATEGORIES.map((category) => {
          const IconComponent = category.icon;
          return (
            <div
              key={category.id}
              className={styles.item}
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className={styles.iconWrapper}>
                <IconComponent className={styles.icon} />
              </div>
              <div className={styles.content}>
                <span className={styles.title}>{category.name}</span>
                <div className={styles.tags}>
                  {SUB_TAGS[category.id]?.map((tag, i) => (
                    <span key={i} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <RightOutlined className={styles.arrow} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
