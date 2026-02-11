import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '45px',
            height: '45px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ 
              color: 'white', 
              fontSize: '24px', 
              fontWeight: 'bold',
              fontFamily: '"Lucida Calligraphy", "Lucida Handwriting", cursive, serif'
            }}>W</span>
          </div>
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#2d3748' }}>WEBALE!</span>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login">
            <button style={{
              padding: '10px 24px',
              background: 'transparent',
              border: '2px solid #667eea',
              borderRadius: '8px',
              color: '#667eea',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Sign In
            </button>
          </Link>
          <Link to="/register">
            <button className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '80px 40px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px', maxWidth: '800px', margin: '0 auto 20px' }}>
          Private Group Fundraising Made Simple
        </h1>
        <p style={{ fontSize: '20px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 40px' }}>
          Create private fundraising groups, track pledges, and reach your goals together with friends, family, and community.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/register">
            <button style={{
              padding: '16px 40px',
              background: 'white',
              border: 'none',
              borderRadius: '10px',
              color: '#667eea',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              Start Fundraising Free
            </button>
          </Link>
          <Link to="/login">
            <button style={{
              padding: '16px 40px',
              background: 'transparent',
              border: '2px solid white',
              borderRadius: '10px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px'
            }}>
              Sign In
            </button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', color: '#2d3748', marginBottom: '60px' }}>
          Everything You Need to Fundraise
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          {/* Feature 1 */}
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>🎯</div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2d3748', marginBottom: '12px' }}>Set Goals & Track Progress</h3>
            <p style={{ color: '#718096', lineHeight: '1.6' }}>
              Define your fundraising goals and watch real-time progress with beautiful charts and progress bars.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>💰</div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2d3748', marginBottom: '12px' }}>Pledge & Contribute</h3>
            <p style={{ color: '#718096', lineHeight: '1.6' }}>
              Members can make pledges and contributions with multiple currency support and automatic conversion.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>👥</div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2d3748', marginBottom: '12px' }}>Private Groups</h3>
            <p style={{ color: '#718096', lineHeight: '1.6' }}>
              Create private fundraising groups and invite members via secure invitation links.
            </p>
          </div>
          
          {/* Feature 4 */}
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>📊</div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2d3748', marginBottom: '12px' }}>Analytics Dashboard</h3>
            <p style={{ color: '#718096', lineHeight: '1.6' }}>
              Get insights into your fundraising campaign with detailed analytics and reports.
            </p>
          </div>
          
          {/* Feature 5 */}
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>💬</div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2d3748', marginBottom: '12px' }}>Communication</h3>
            <p style={{ color: '#718096', lineHeight: '1.6' }}>
              Stay connected with group comments, direct messages, and notice boards.
            </p>
          </div>
          
          {/* Feature 6 */}
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>🔔</div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2d3748', marginBottom: '12px' }}>Smart Reminders</h3>
            <p style={{ color: '#718096', lineHeight: '1.6' }}>
              Set up pledge reminders to help members fulfill their commitments on time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '60px 40px',
        background: '#f7fafc',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2d3748', marginBottom: '16px' }}>
          Ready to Start Fundraising?
        </h2>
        <p style={{ color: '#718096', marginBottom: '30px', fontSize: '18px' }}>
          Join thousands of groups already using Webale to reach their goals.
        </p>
        <Link to="/register">
          <button className="btn btn-primary" style={{ padding: '16px 48px', fontSize: '18px' }}>
            Create Your First Group
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px',
        background: '#2d3748',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ 
              color: 'white', 
              fontSize: '20px', 
              fontWeight: 'bold',
              fontFamily: '"Lucida Calligraphy", "Lucida Handwriting", cursive, serif'
            }}>W</span>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>WEBALE!</span>
        </div>
        <p style={{ opacity: 0.7, fontSize: '14px' }}>
          © {new Date().getFullYear()} Webale. Private Group Fundraising Platform.
        </p>
        <p style={{ opacity: 0.5, fontSize: '12px', marginTop: '10px' }}>
          Made with ❤️ for communities worldwide
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
