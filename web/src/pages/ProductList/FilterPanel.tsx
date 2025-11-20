import { useState, useEffect } from 'react';
import { Form, Select, Slider, Button, Divider, Checkbox } from '../../ui';
import { CATEGORIES, CAMPUSES, CONDITIONS } from '../../utils/constants';
import styles from './FilterPanel.module.css';

interface FilterPanelProps {
  onFilterChange: (filters: any) => void;
  initialCategoryId?: number;
}

export const FilterPanel = ({ onFilterChange, initialCategoryId }: FilterPanelProps) => {
  const [form] = Form.useForm();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  useEffect(() => {
    if (initialCategoryId != null) {
      form.setFieldValue('categoryId', initialCategoryId);
    }
  }, [initialCategoryId, form]);

  const applyFilters = (nextPrice?: [number, number]) => {
    const values = form.getFieldsValue();
    const filters: any = { ...values };
    const pr = nextPrice ?? priceRange;
    const isFiveKPlus = pr[1] >= 6000;
    if (isFiveKPlus) {
      filters.minPrice = Math.max(pr[0], 5000);
      if ('maxPrice' in filters) delete filters.maxPrice;
    } else {
      filters.minPrice = pr[0];
      filters.maxPrice = pr[1];
    }
    onFilterChange(filters);
  };

  const handleReset = () => {
    form.resetFields();
    setPriceRange([0, 1000]);
    onFilterChange({});
  };

  const handleSubmit = (_values: any) => {
    // 不再通过提交按钮触发
  };

  return (
    <div className={styles.filterPanel}>
      <div className={styles.header}>
        <h3>筛选条件</h3>
        <Button type="link" size="small" onClick={handleReset}>
          重置
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        onValuesChange={() => applyFilters()}
      >
        <Form.Item label="分类" name="categoryId">
          <Select placeholder="请选择分类" allowClear>
            {CATEGORIES.map(cat => {
              const IconComponent = cat.icon;
              return (
                <Select.Option key={cat.id} value={cat.id}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconComponent />
                    <span>{cat.name}</span>
                  </span>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>

        <Form.Item label="校区" name="campus">
          <Select placeholder="请选择校区" allowClear>
            {CAMPUSES.map(campus => (
              <Select.Option key={campus} value={campus}>
                {campus}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Divider />

        <Form.Item label="成色" name="condition">
          <Checkbox.Group style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {CONDITIONS.map(cond => (
              <Checkbox key={cond.value} value={cond.value}>
                <span style={{ color: cond.color }}>●</span> {cond.label}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </Form.Item>

        <Divider />

        <Form.Item label={`价格区间：${priceRange[1] >= 6000 ? '¥5000+' : `¥${priceRange[0]} - ¥${priceRange[1]}`}`}>
          <Slider
            range
            value={priceRange}
            onChange={(value) => { const v = value as [number, number]; setPriceRange(v); applyFilters(v); }}
            max={6000}
            step={10}
            marks={{
              0: '¥0',
              1000: '¥1k',
              2000: '¥2k',
              3000: '¥3k',
              5000: '¥5k',
              6000: '¥5k+',
            }}
          />
        </Form.Item>
      </Form>
    </div>
  );
};

