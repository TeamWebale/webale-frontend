import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../App';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the page they were trying to access
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Use auth context to login
        login(token, user);
        
        // Redirect to intended page or dashboard
        navigate(from, { replace: true });
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '36px',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
          }}>
            👋
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#2d3748',
            marginBottom: '8px'
          }}>
            Welcome Back!
          </h1>
          <p style={{ color: '#718096' }}>
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: '32px' }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#fed7d7',
              borderRadius: '8px',
              marginBottom: '20px',
              color: '#c53030',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={{ padding: '14px 16px' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{
                  fontWeight: '600',
                  color: '#4a5568',
                  fontSize: '14px'
                }}>
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  style={{ 
                    fontSize: '13px', 
                    color: '#667eea',
                    textDecoration: 'none'
                  }}
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                className="input"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ padding: '14px 16px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '16px'
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div className="spinner-sm" style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></div>
                  Signing in...
                </span>
              ) : (
                '🔐 Sign In'
              )}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <p style={{ color: '#718096', fontSize: '14px' }}>
              Don't have an account?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: '#667eea', 
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
