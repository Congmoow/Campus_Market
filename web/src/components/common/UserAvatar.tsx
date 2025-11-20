import React from 'react';
import { ASSET_BASE_URL } from '../../services/apiClient';

interface UserAvatarProps {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
}

export default function UserAvatar({ src, name, size = 32, className }: UserAvatarProps) {
  const url = React.useMemo(() => {
    if (!src) return undefined;
    return src.startsWith('/uploads') ? `${ASSET_BASE_URL}${src}` : src;
  }, [src]);

  const initial = React.useMemo(() => {
    const c = (name || '').trim();
    return (c ? c[0] : '?').toUpperCase();
  }, [name]);

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    fontSize: size * 0.5,
    fontWeight: 600,
    userSelect: 'none',
  };

  return (
    <div className={className} style={baseStyle}>
      {url ? (
        <img
          src={url}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%',
            display: 'block',
          }}
        />
      ) : (
        initial
      )}
    </div>
  );
}


