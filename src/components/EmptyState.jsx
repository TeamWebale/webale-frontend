import { useTheme } from '../context/ThemeContext';

function EmptyState({ 
  icon = '📭', 
  title = 'Nothing here yet', 
  message = 'Get started by adding some content',
  actionText,
  onAction,
  type = 'default' // 'default', 'search', 'error', 'success'
}) {
  const { colors } = useTheme();

  const illustrations = {
    default: { icon: '📭', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    search: { icon: '🔍', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    error: { icon: '😕', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    success: { icon: '🎉', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    members: { icon: '👥', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    pledges: { icon: '💰', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    messages: { icon: '💬', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    comments: { icon: '💭', gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
    activities: { icon: '📊', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
    groups: { icon: '🏠', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  };

  const style = illustrations[type] || illustrations.default;

  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 24px',
      background: colors.cardBackground,
      borderRadius: '16px',
      border: `1px solid ${colors.border}`
    }}>
      {/* Animated Icon Container */}
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: style.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        fontSize: '56px',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        {icon || style.icon}
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: '22px',
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: '12px'
      }}>
        {title}
      </h3>

      {/* Message */}
      <p style={{
        color: colors.textSecondary,
        fontSize: '15px',
        maxWidth: '320px',
        margin: '0 auto 24px',
        lineHeight: '1.6'
      }}>
        {message}
      </p>

      {/* Action Button */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary"
          style={{
            padding: '12px 28px',
            fontSize: '15px',
            fontWeight: '600',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
        >
          {actionText}
        </button>
      )}

      {/* Decorative Dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '32px'
      }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: colors.muted,
              opacity: 0.4,
              animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default EmptyState;
