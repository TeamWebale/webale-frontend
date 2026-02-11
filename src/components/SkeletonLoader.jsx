import { useTheme } from '../context/ThemeContext';

// Base Skeleton component
export function Skeleton({ width = '100%', height = '20px', borderRadius = '4px', style = {} }) {
  const { isDarkMode } = useTheme();
  
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: isDarkMode 
          ? 'linear-gradient(90deg, #4a5568 25%, #718096 50%, #4a5568 75%)'
          : 'linear-gradient(90deg, #e2e8f0 25%, #edf2f7 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
        ...style
      }}
    />
  );
}

// Card Skeleton
export function CardSkeleton({ lines = 3 }) {
  const { colors } = useTheme();
  
  return (
    <div style={{
      background: colors.cardBackground,
      borderRadius: '12px',
      padding: '20px',
      border: `1px solid ${colors.border}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Skeleton width="48px" height="48px" borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height="16px" style={{ marginBottom: '8px' }} />
          <Skeleton width="40%" height="12px" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          width={`${100 - i * 15}%`} 
          height="14px" 
          style={{ marginBottom: i < lines - 1 ? '8px' : 0 }} 
        />
      ))}
    </div>
  );
}

// List Item Skeleton
export function ListItemSkeleton() {
  const { colors } = useTheme();
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      background: colors.cardBackground,
      borderRadius: '8px',
      border: `1px solid ${colors.border}`
    }}>
      <Skeleton width="40px" height="40px" borderRadius="50%" />
      <div style={{ flex: 1 }}>
        <Skeleton width="50%" height="14px" style={{ marginBottom: '6px' }} />
        <Skeleton width="30%" height="12px" />
      </div>
      <Skeleton width="60px" height="28px" borderRadius="14px" />
    </div>
  );
}

// Group Card Skeleton
export function GroupCardSkeleton() {
  const { colors } = useTheme();
  
  return (
    <div style={{
      background: colors.cardBackground,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${colors.border}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Skeleton width="60%" height="24px" />
        <Skeleton width="60px" height="24px" borderRadius="12px" />
      </div>
      <Skeleton width="100%" height="12px" style={{ marginBottom: '8px' }} />
      <Skeleton width="80%" height="12px" style={{ marginBottom: '20px' }} />
      
      {/* Progress bar */}
      <Skeleton width="100%" height="8px" borderRadius="4px" style={{ marginBottom: '12px' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton width="30%" height="14px" />
        <Skeleton width="30%" height="14px" />
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }) {
  const { colors } = useTheme();
  
  return (
    <div style={{
      background: colors.cardBackground,
      borderRadius: '12px',
      overflow: 'hidden',
      border: `1px solid ${colors.border}`
    }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px',
        padding: '16px',
        background: colors.hover,
        borderBottom: `1px solid ${colors.border}`
      }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width="80%" height="14px" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '16px',
            padding: '16px',
            borderBottom: rowIndex < rows - 1 ? `1px solid ${colors.border}` : 'none'
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              width={colIndex === 0 ? '90%' : '70%'} 
              height="14px" 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Dashboard Stats Skeleton
export function StatsSkeleton() {
  const { colors } = useTheme();
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    }}>
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          style={{
            background: colors.cardBackground,
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${colors.border}`
          }}
        >
          <Skeleton width="40%" height="14px" style={{ marginBottom: '12px' }} />
          <Skeleton width="60%" height="32px" style={{ marginBottom: '8px' }} />
          <Skeleton width="50%" height="12px" />
        </div>
      ))}
    </div>
  );
}

// Profile Skeleton
export function ProfileSkeleton() {
  const { colors } = useTheme();
  
  return (
    <div style={{
      background: colors.cardBackground,
      borderRadius: '16px',
      overflow: 'hidden',
      border: `1px solid ${colors.border}`
    }}>
      {/* Banner */}
      <Skeleton width="100%" height="120px" borderRadius="0" />
      
      <div style={{ padding: '20px', marginTop: '-50px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '20px' }}>
          <Skeleton width="100px" height="100px" borderRadius="50%" />
          <div style={{ flex: 1, paddingBottom: '10px' }}>
            <Skeleton width="50%" height="24px" style={{ marginBottom: '8px' }} />
            <Skeleton width="70%" height="14px" />
          </div>
        </div>
        
        <Skeleton width="100%" height="60px" borderRadius="8px" style={{ marginBottom: '16px' }} />
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <Skeleton width="100px" height="36px" borderRadius="18px" />
          <Skeleton width="100px" height="36px" borderRadius="18px" />
          <Skeleton width="100px" height="36px" borderRadius="18px" />
        </div>
      </div>
    </div>
  );
}

// Chat Message Skeleton
export function ChatSkeleton() {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start',
            gap: '8px'
          }}
        >
          {i % 2 !== 0 && <Skeleton width="32px" height="32px" borderRadius="50%" />}
          <Skeleton 
            width={`${40 + Math.random() * 30}%`} 
            height="48px" 
            borderRadius="16px" 
          />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
