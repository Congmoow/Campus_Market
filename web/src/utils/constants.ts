import {
  MobileOutlined,
  BookOutlined,
  HomeOutlined,
  ToolOutlined,
  SkinOutlined,
  SmileOutlined,
  EditOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

export const CATEGORIES = [
  { id: 1, name: '电子产品', icon: MobileOutlined },
  { id: 2, name: '图书教材', icon: BookOutlined },
  { id: 3, name: '生活用品', icon: HomeOutlined },
  { id: 4, name: '运动器材', icon: ToolOutlined },
  { id: 5, name: '服饰鞋包', icon: SkinOutlined },
  { id: 6, name: '美妆护肤', icon: SmileOutlined },
  { id: 7, name: '文具办公', icon: EditOutlined },
  { id: 8, name: '其他', icon: AppstoreOutlined },
];

export const CAMPUSES = [
  '南浔校区',
  '下沙校区',
];

export const CONDITIONS = [
  { value: 'NEW', label: '全新', color: '#00b42a' },
  { value: 'LIKE_NEW', label: '几乎全新', color: '#0fc6c2' },
  { value: 'GOOD', label: '良好', color: '#3491fa' },
  { value: 'FAIR', label: '一般', color: '#f7ba1e' },
  { value: 'POOR', label: '较差', color: '#f53f3f' },
];

export const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: '最新发布' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'views-desc', label: '最多浏览' },
];

