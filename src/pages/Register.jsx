import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { COUNTRIES } from '../utils/countries';

const API_URL = 'https://webale-api.onrender.com/api';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', country: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields'); return;
    }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!formData.country) { setError('Please select your country'); return; }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        firstName: formData.firstName, lastName: formData.lastName,
        email: formData.email, password: formData.password, country: formData.country
      }, { headers: { 'Content-Type': 'application/json' } });

      if (response.data.success) {
        const { token, user } = response.data.data;
        // Normalize user data to snake_case
        const normalizedUser = {
          id: user.id, email: user.email,
          first_name: user.first_name || user.firstName || '',
          last_name: user.last_name || user.lastName || '',
          country: user.country || '',
          avatar: user.avatar || user.avatarUrl || user.avatar_url || null,
          created_at: user.created_at || user.createdAt || ''
        };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));

        // Check for pending invite - redirect back to invite page (user chooses to accept)
        const pendingInvite = localStorage.getItem('pendingInvite');
        if (pendingInvite) {
          localStorage.removeItem('pendingInvite');
          navigate(`/invite/${pendingInvite}`, { replace: true });
          return;
        }

        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '40px', width: '100%',
        maxWidth: '480px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', position: 'relative' }}>

        {/* Close Button */}
        <button onClick={() => navigate('/')} title="Close" style={{
          position: 'absolute', top: '16px', right: '16px', width: '36px', height: '36px',
          borderRadius: '50%', background: '#f7fafc', border: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '18px', color: '#718096'
        }}>✕</button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)' }}>
              <span style={{ color: 'white', fontSize: '36px', fontWeight: 'bold',
                fontFamily: '"Lucida Calligraphy", "Lucida Handwriting", cursive, serif' }}>W</span>
            </div>
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>Create Account</h1>
          <p style={{ color: '#718096', fontSize: '15px' }}>Join Webale and start fundraising</p>
        </div>

        {/* Pending invite notice */}
        {localStorage.getItem('pendingInvite') && (
          <div style={{ padding: '12px 16px', background: '#ebf8ff', border: '1px solid #bee3f8',
            borderRadius: '8px', marginBottom: '20px', color: '#2b6cb0', fontSize: '13px', textAlign: 'center' }}>
            💌 Create your account to accept the group invitation!
          </div>
        )}

        {/* Dismissible Error */}
        {error && (
          <div style={{ padding: '12px 16px', background: '#fed7d7', border: '1px solid #fc8181',
            borderRadius: '8px', marginBottom: '20px', color: '#c53030', fontSize: '14px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none',
              color: '#c53030', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4a5568', fontSize: '13px' }}>
                First Name <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                className="input" placeholder="John" required style={{ padding: '12px 14px', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4a5568', fontSize: '13px' }}>
                Last Name <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                className="input" placeholder="Doe" required style={{ padding: '12px 14px', fontSize: '14px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4a5568', fontSize: '13px' }}>
              Email Address <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              className="input" placeholder="you@example.com" required style={{ padding: '12px 14px', fontSize: '14px' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4a5568', fontSize: '13px' }}>
              Country <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <select name="country" value={formData.country} onChange={handleChange}
              className="input" required style={{ padding: '12px 14px', fontSize: '14px' }}>
              <option value="">Select your country...</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4a5568', fontSize: '13px' }}>
              Password <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              className="input" placeholder="••••••••" required minLength="6" style={{ padding: '12px 14px', fontSize: '14px' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4a5568', fontSize: '13px' }}>
              Confirm Password <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
              className="input" placeholder="••••••••" required style={{ padding: '12px 14px', fontSize: '14px' }} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '600' }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#718096', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
