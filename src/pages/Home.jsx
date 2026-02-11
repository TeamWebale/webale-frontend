import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{ 
      minHeight: 'calc(100vh - 120px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        {/* Hero Icon */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          fontSize: '56px',
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)'
        }}>
          💰
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#2d3748',
          marginBottom: '16px',
          lineHeight: '1.2'
        }}>
          Group Fundraising
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Made Simple
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '18px',
          color: '#718096',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Create groups, invite members, track pledges, and reach your fundraising goals together. 
          The easiest way to manage group contributions.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register">
            <button style={{
              padding: '16px 40px',
              fontSize: '16px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease'
            }}>
              🚀 Get Started Free
            </button>
          </Link>
          
          <Link to="/login">
            <button style={{
              padding: '16px 40px',
              fontSize: '16px',
              fontWeight: '600',
              background: 'white',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              Sign In
            </button>
          </Link>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '24px',
          marginTop: '60px'
        }}>
          {[
            { icon: '👥', title: 'Create Groups', desc: 'Invite members easily' },
            { icon: '💳', title: 'Track Pledges', desc: 'Monitor contributions' },
            { icon: '📊', title: 'Analytics', desc: 'Visual progress reports' },
            { icon: '🔔', title: 'Reminders', desc: 'Automated notifications' }
          ].map((feature, i) => (
            <div key={i} style={{
              padding: '24px 16px',
              background: '#f7fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '4px' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#718096', margin: 0 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
