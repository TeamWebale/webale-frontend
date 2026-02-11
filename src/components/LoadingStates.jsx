export const SkeletonCard = () => (
  <div style={{ padding: '24px', background: '#f7fafc', borderRadius: '12px', border: '2px solid #e2e8f0', animation: 'pulse 2s infinite' }}>
    <div style={{ width: '60%', height: '20px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '12px' }}></div>
    <div style={{ width: '40%', height: '16px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '16px' }}></div>
    <div style={{ width: '100%', height: '12px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px' }}></div>
    <div style={{ width: '80%', height: '12px', background: '#e2e8f0', borderRadius: '4px' }}></div>
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div style={{ display: 'grid', gap: '20px' }}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const LoadingSpinner = ({ size = 'medium', message }) => {
  const sizes = {
    small: '20px',
    medium: '40px',
    large: '60px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px' }}>
      <div className="spinner" style={{ width: sizes[size], height: sizes[size] }}></div>
      {message && <p style={{ color: '#718096', fontSize: '14px' }}>{message}</p>}
    </div>
  );
};

export const SkeletonComment = () => (
  <div style={{ padding: '16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0', animation: 'pulse 2s infinite' }}>
    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0' }}></div>
      <div style={{ flex: 1 }}>
        <div style={{ width: '30%', height: '14px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px' }}></div>
        <div style={{ width: '20%', height: '12px', background: '#e2e8f0', borderRadius: '4px' }}></div>
      </div>
    </div>
    <div style={{ width: '100%', height: '12px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '6px' }}></div>
    <div style={{ width: '90%', height: '12px', background: '#e2e8f0', borderRadius: '4px' }}></div>
  </div>
);

export const PageLoader = ({ message = 'Loading...' }) => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7fafc' }}>
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" style={{ width: '60px', height: '60px', margin: '0 auto 20px' }}></div>
      <p style={{ color: '#718096', fontSize: '16px', fontWeight: '500' }}>{message}</p>
    </div>
  </div>
);