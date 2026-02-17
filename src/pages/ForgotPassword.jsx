import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://webale-api.onrender.com/api';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=enter email, 2=enter code+new password, 3=success
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Step 1: Request password reset
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address'); return; }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      if (response.data.success) {
        // In production, the code would be emailed. For now, show it from API response
        const devCode = response.data._devCode;
        if (devCode) {
          setMessage(`Your reset code is: ${devCode} (In production this will be emailed to you)`);
          setResetCode(devCode); // Auto-fill for convenience during testing
        } else {
          setMessage(response.data.message || 'Reset code sent! Check your email.');
        }
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code and set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetCode) { setError('Please enter the reset code'); return; }
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        resetCode,
        newPassword
      });
      if (response.data.success) {
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: 'white', borderRadius: '20px', padding: '40px',
    width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    position: 'relative'
  };
  const inputStyle = { padding: '14px 16px', fontSize: '14px' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568', fontSize: '14px' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>

      <div style={cardStyle}>
        {/* Close Button */}
        <button onClick={() => navigate('/login')} title="Back to Login" style={{
          position: 'absolute', top: '16px', right: '16px', width: '36px', height: '36px',
          borderRadius: '50%', background: '#f7fafc', border: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '18px', color: '#718096'
        }}>✕</button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '32px',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
          }}>
            {step === 1 ? '🔑' : step === 2 ? '🔐' : '✅'}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>
            {step === 1 ? 'Forgot Password?' : step === 2 ? 'Reset Your Password' : 'Password Reset!'}
          </h1>
          <p style={{ color: '#718096', fontSize: '14px' }}>
            {step === 1 ? "Enter your email and we'll send you a reset code" :
             step === 2 ? 'Enter the code and your new password' :
             'Your password has been successfully changed'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '12px 16px', background: '#fed7d7', border: '1px solid #fc8181',
            borderRadius: '8px', marginBottom: '20px', color: '#c53030', fontSize: '14px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none',
              color: '#c53030', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>✕</button>
          </div>
        )}

        {/* Success message */}
        {message && step === 2 && (
          <div style={{ padding: '12px 16px', background: '#c6f6d5', border: '1px solid #9ae6b4',
            borderRadius: '8px', marginBottom: '20px', color: '#276749', fontSize: '13px' }}>
            ✅ {message}
          </div>
        )}

        {/* ==================== STEP 1: ENTER EMAIL ==================== */}
        {step === 1 && (
          <form onSubmit={handleRequestReset}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="you@example.com" required autoComplete="email" style={inputStyle} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              {loading ? 'Sending...' : '📧 Send Reset Code'}
            </button>

            <p style={{ textAlign: 'center', color: '#718096', fontSize: '13px', marginTop: '16px' }}>
              Remember your password?{' '}
              <Link to="/login" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link>
            </p>
          </form>
        )}

        {/* ==================== STEP 2: ENTER CODE + NEW PASSWORD ==================== */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Reset Code</label>
              <input type="text" value={resetCode} onChange={e => setResetCode(e.target.value.toUpperCase())}
                className="input" placeholder="Enter 6-digit code" required maxLength="6"
                style={{ ...inputStyle, textAlign: 'center', fontSize: '20px', letterSpacing: '6px', fontWeight: '700' }} />
              <p style={{ fontSize: '11px', color: '#718096', marginTop: '6px', textAlign: 'center' }}>
                Check your email <strong>{email}</strong> for the code
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="input" placeholder="At least 6 characters" required minLength="6" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="input" placeholder="Re-enter password" required style={{
                  ...inputStyle,
                  borderColor: confirmPassword && newPassword !== confirmPassword ? '#fc8181' : undefined
                }} />
              {confirmPassword && newPassword !== confirmPassword && (
                <p style={{ fontSize: '11px', color: '#e53e3e', marginTop: '4px' }}>Passwords do not match</p>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              {loading ? 'Resetting...' : '🔐 Reset Password'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button type="button" onClick={() => { setStep(1); setError(''); setMessage(''); }}
                style={{ background: 'none', border: 'none', color: '#718096', cursor: 'pointer', fontSize: '13px' }}>
                ← Change email
              </button>
              <button type="button" onClick={handleRequestReset}
                style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                Resend code
              </button>
            </div>
          </form>
        )}

        {/* ==================== STEP 3: SUCCESS ==================== */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: '#c6f6d5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: '40px'
            }}>✅</div>
            <p style={{ color: '#276749', fontSize: '15px', marginBottom: '24px' }}>
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Link to="/login">
              <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px', fontWeight: '600' }}>
                🔑 Go to Sign In
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
