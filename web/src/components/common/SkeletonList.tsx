export default function SkeletonList({ count = 8 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          borderRadius: 12,
          padding: 0,
          background: 'var(--color-bg-1,#fff)',
          boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.04))',
          overflow: 'hidden',
          animation: `skeletonPulse 1.5s ease-in-out ${i * 0.1}s infinite`
        }}>
          <div style={{
            position: 'relative',
            paddingTop: '100%',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }} />
          <div style={{ padding: 12, display: 'grid', rowGap: 8 }}>
            <div style={{ height: 12, borderRadius: 4, background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            <div style={{ height: 12, width: '60%', borderRadius: 4, background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          </div>
        </div>
      ))}
    </div>
  );
}


