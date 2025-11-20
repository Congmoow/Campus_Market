import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select, Pagination, Empty, Drawer, Button, Tag, Row, Col } from '../../ui';
import { FilterOutlined } from '@ant-design/icons';
import { ProductCard } from '../../components/ProductCard';
import { FilterPanel } from './FilterPanel';
import { useProducts } from '../../hooks/useProducts';
import { useToggleFavorite } from '../../hooks/useProducts';
import { useResponsive } from '../../hooks/useResponsive';
import { SORT_OPTIONS } from '../../utils/constants';
import type { ProductQuery } from '../../types/product';
import styles from './index.module.css';
import SkeletonList from '../../components/common/SkeletonList';
import { CATEGORIES, CONDITIONS } from '../../utils/constants';

export const ProductListPage = () => {
  const [searchParams] = useSearchParams();
  const responsive = useResponsive();
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  const [query, setQuery] = useState<ProductQuery>({
    page: 0,
    size: 20,
    keyword: searchParams.get('keyword') || undefined,
    categoryId: searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: productsData, isLoading } = useProducts(query);
  const toggleFavorite = useToggleFavorite();

  useEffect(() => {
    const keyword = searchParams.get('keyword');
    const categoryId = searchParams.get('categoryId');
    
    setQuery(prev => ({
      ...prev,
      keyword: keyword || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
    }));
  }, [searchParams]);

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [ProductQuery['sortBy'], ProductQuery['sortOrder']];
    setQuery(prev => ({ ...prev, sortBy, sortOrder, page: 0 }));
  };

  const handleFilterChange = (filters: any) => {
    setQuery(prev => ({ ...prev, ...filters, page: 0 }));
    setDrawerVisible(false);
  };

  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page: page - 1 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFavorite = (productId: number) => {
    toggleFavorite.mutate(productId);
  };

  const filterPanel = <FilterPanel onFilterChange={handleFilterChange} initialCategoryId={query.categoryId} />;

  const chips = (() => {
    const arr: { key: string; label: string; onClose: () => void }[] = [];
    if (query.categoryId) {
      const cat = CATEGORIES.find(c => c.id === query.categoryId);
      if (cat) arr.push({ key: 'categoryId', label: `分类：${cat.name}` , onClose: () => setQuery(prev => ({ ...prev, categoryId: undefined, page: 0 })) });
    }
    if (query.campus) arr.push({ key: 'campus', label: `校区：${query.campus}` , onClose: () => setQuery(prev => ({ ...prev, campus: undefined, page: 0 })) });
    if ((query as any).condition) {
      const val = (query as any).condition;
      const conds = Array.isArray(val) ? val : [val];
      conds.forEach((c: string, idx: number) => {
        const conf = CONDITIONS.find(x => x.value === c);
        arr.push({ key: `condition-${idx}`, label: `成色：${conf?.label || c}`, onClose: () => {
          const remain = conds.filter((x: string) => x !== c);
          setQuery(prev => ({ ...prev, condition: remain.length ? remain : undefined, page: 0 } as any));
        }});
      });
    }
    return arr;
  })();

  return (
    <div className={styles.listPage}>
      <div className={styles.container}>
        <Row gutter={24}>
          {/* Desktop Filter Panel */}
          {responsive.lg && (
            <Col span={5}>
              {filterPanel}
            </Col>
          )}

          {/* Product List */}
          <Col span={responsive.lg ? 19 : 24}>
            <div className={styles.toolbar}>
              <div className={styles.resultInfo}>
                {productsData && (
                  <span>找到 <strong>{productsData.totalElements}</strong> 件商品</span>
                )}
              </div>
              
              <div className={styles.actions}>
                {!responsive.lg && (
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => setDrawerVisible(true)}
                  >
                    筛选
                  </Button>
                )}
                
                <Select
                  placeholder="排序方式"
                  defaultValue="createdAt-desc"
                  onChange={handleSortChange}
                  style={{ width: 160 }}
                >
                  {SORT_OPTIONS.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>

            {isLoading ? (
              <SkeletonList count={responsive.lg ? 12 : 8} />
            ) : productsData && productsData.content.length > 0 ? (
              <>
                {chips.length > 0 && (
                  <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {chips.map(c => (
                      <Tag key={c.key} closable onClose={c.onClose} className={styles.filterTag}>{c.label}</Tag>
                    ))}
                  </div>
                )}
                <Row gutter={[16, 16]} className={styles.productGrid}>
                  {productsData.content.map(product => (
                    <Col key={product.id} xs={12} sm={8} md={6} lg={6}>
                      <ProductCard product={product} onFavorite={handleFavorite} />
                    </Col>
                  ))}
                </Row>

                {productsData.totalPages > 1 && (
                  <div className={styles.pagination}>
                    <Pagination
                      current={query.page! + 1}
                      total={productsData.totalElements}
                      pageSize={query.size}
                      onChange={handlePageChange}
                      showTotal={(total) => `共 ${total} 件`}
                      showSizeChanger={false}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className={styles.empty}>
                <Empty description="暂无商品" />
              </div>
            )}
          </Col>
        </Row>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        width="80%"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        title="筛选条件"
        footer={null}
      >
        {filterPanel}
      </Drawer>
    </div>
  );
};

