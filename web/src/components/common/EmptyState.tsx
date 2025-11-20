import { Empty, Button } from '../../ui';
import React from 'react';

interface EmptyStateProps {
  description?: string;
  actionText?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}

export default function EmptyState({ description = '暂无数据', actionText, onAction, style }: EmptyStateProps) {
  return (
    <div style={{
      padding: 48,
      textAlign: 'center',
      background: 'linear-gradient(180deg, rgba(240,245,255,0.4) 0%, transparent 100%)',
      borderRadius: 12,
      ...style
    }}>
      <div style={{ fontSize: 72, marginBottom: 16, opacity: 0.5 }}>📦</div>
      <Empty
        description={
          <span style={{ fontSize: 15, color: 'var(--color-text-2)' }}>{description}</span>
        }
      />
      {actionText && (
        <Button type="primary" size="large" style={{ marginTop: 20, borderRadius: 8 }} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}


