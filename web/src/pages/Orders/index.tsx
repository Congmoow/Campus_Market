import { useState } from 'react';
import { Tabs, List, Card, Button, Tag, Message, Drawer, Descriptions, Steps, Empty } from '../../ui';
import { useMyOrders, useShipOrder, useConfirmReceipt, useCancelOrder } from '../../hooks/useOrders';
import { OrderStatus, OrderDto } from '../../services/orderService';

export const OrdersPage = () => {
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [detail, setDetail] = useState<any | null>(null);
  const { data, isLoading } = useMyOrders({ role, page: 0, size: 20 });
  const ship = useShipOrder();
  const confirm = useConfirmReceipt();
  const cancel = useCancelOrder();

  const list: OrderDto[] = data?.content || [];

  const statusTag = (s: OrderStatus) => {
    const map: Record<OrderStatus, string> = {
      CREATED: 'processing',
      SHIPPED: 'processing',
      RECEIVED: 'success',
      COMPLETED: 'success',
      CANCELLED: 'error',
    } as const;
    const label: Record<OrderStatus, string> = { CREATED: '待发货', SHIPPED: '已发货', RECEIVED: '已收货', COMPLETED: '已完成', CANCELLED: '已取消' } as any;
    return <Tag color={map[s]}>{label[s]}</Tag>;
  };

  const renderList = () => {
    if (!isLoading && list.length === 0) {
      return <Empty description="暂无订单" />;
    }

    return (
      <List<OrderDto>
        loading={isLoading}
        dataSource={list}
        renderItem={(o) => (
          <Card key={o.id} style={{ marginBottom: 12 }} title={o.titleSnapshot || `订单 #${o.id}`} extra={statusTag(o.status)}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {o.coverSnapshot && <img src={o.coverSnapshot} alt="cover" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} />}
              <div style={{ flex: 1 }}>
                <div>数量：{o.quantity} 总价：¥{o.priceTotal}</div>
                <div>配送方式：{o.shippingMethod === 'DELIVERY' ? '快递' : '自提'}</div>
              </div>
              {role === 'seller' && o.status === 'CREATED' && (
                <Button type="primary" onClick={() => {
                  ship.mutate({ id: o.id, logisticsCompany: '自定义', trackingNumber: '待填' }, { onSuccess: () => Message.success('已发货') });
                }}>发货</Button>
              )}
              {role === 'buyer' && o.status === 'CREATED' && (
                <Button danger onClick={() => cancel.mutate(o.id, { onSuccess: () => Message.success('已取消') })}>取消订单</Button>
              )}
              {role === 'buyer' && o.status === 'SHIPPED' && (
                <Button type="primary" onClick={() => confirm.mutate(o.id, { onSuccess: () => Message.success('已确认收货') })}>确认收货</Button>
              )}
              <Button onClick={() => setDetail(o)}>详情</Button>
            </div>
            {role === 'seller' && o.status === 'CREATED' && (
              <Button type="primary" onClick={() => {
                ship.mutate({ id: o.id, logisticsCompany: '自定义', trackingNumber: '待填' }, { onSuccess: () => Message.success('已发货') });
              }}>发货</Button>
            )}
            {role === 'buyer' && o.status === 'CREATED' && (
              <Button danger onClick={() => cancel.mutate(o.id, { onSuccess: () => Message.success('已取消') })}>取消订单</Button>
            )}
            {role === 'buyer' && o.status === 'SHIPPED' && (
              <Button type="primary" onClick={() => confirm.mutate(o.id, { onSuccess: () => Message.success('已确认收货') })}>确认收货</Button>
            )}
            <Button onClick={() => setDetail(o)}>详情</Button>
          </Card>
        )}
      />
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Tabs
        activeKey={role}
        onChange={(k) => setRole(k as any)}
        items={[
          { key: 'buyer', label: '我买到的' },
          { key: 'seller', label: '我卖出的' },
        ]}
      />

      {renderList()}

      <Drawer width={480} open={!!detail} onClose={() => setDetail(null)} title="订单详情" footer={null}>
        {detail && (
          <>
            <Descriptions column={1}>
              <Descriptions.Item label="订单号">{detail.id}</Descriptions.Item>
              <Descriptions.Item label="状态">{statusTag(detail.status)}</Descriptions.Item>
              <Descriptions.Item label="商品">{detail.titleSnapshot}</Descriptions.Item>
              <Descriptions.Item label="数量">{detail.quantity}</Descriptions.Item>
              <Descriptions.Item label="总价">¥{detail.priceTotal}</Descriptions.Item>
              <Descriptions.Item label="配送方式">{detail.shippingMethod === 'DELIVERY' ? '快递' : '自提'}</Descriptions.Item>
              <Descriptions.Item label="地址">{detail.shippingAddress || '-'}</Descriptions.Item>
              <Descriptions.Item label="物流公司">{detail.logisticsCompany || '-'}</Descriptions.Item>
              <Descriptions.Item label="快递单号">{detail.trackingNumber || '-'}</Descriptions.Item>
            </Descriptions>
            <Steps current={
              detail.status === 'CREATED' ? 0 :
              detail.status === 'SHIPPED' ? 1 : 2
            } direction="vertical" style={{ marginTop: 16 }}>
              <Steps.Step title="已下单" description={detail.createdAt} />
              <Steps.Step title="已发货/待取货" />
              <Steps.Step title="已收货/完成" />
            </Steps>
          </>
        )}
      </Drawer>
    </div>
  );
};



