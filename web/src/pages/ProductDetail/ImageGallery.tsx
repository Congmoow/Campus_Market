import { useState } from 'react';
import { Image } from '../../ui';
import { EyeOutlined } from '@ant-design/icons';
import styles from './ImageGallery.module.css';

interface ImageGalleryProps {
  images: string[];
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={styles.gallery}>
        <div className={styles.placeholder}>暂无图片</div>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.thumbnails}>
        {images.map((image, index) => (
          <div
            key={index}
            className={`${styles.thumbnail} ${
              index === currentIndex ? styles.active : ''
            }`}
            onClick={() => setCurrentIndex(index)}
          >
            <img src={image} alt={`缩略图 ${index + 1}`} />
          </div>
        ))}
        {images.length === 1 && (
          <div className={styles.noMore}>暂无更多图片</div>
        )}
      </div>

      <div className={styles.mainImage}>
        <Image
          src={images[currentIndex]}
          alt="商品图片"
          width="100%"
          style={{ objectFit: 'contain' }}
          preview={{
            mask: (
              <>
                <EyeOutlined />
                <span style={{ marginLeft: 8 }}>预览</span>
              </>
            ),
          }}
        />
      </div>
    </div>
  );
};
