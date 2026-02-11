import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invitation, setInvitation] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [visibilityPreference, setVisibilityPreference] = useState('visible');

  useEffect(() => {
    checkLoginAndLoadInvite();
  }, [token]);

  const checkLoginAndLoadInvite = async () => {
    const userToken = localStorage.getItem('token');
    setIsLoggedIn(!!userToken);

    try {
      // Validate the invitation token
      const response = await axios.get(`http://localhost:5000/api/invitations/${token}/validate`);
      
      if (response.data.success) {
        setInvitation(response.data.data.invitation);
      }
    } catch (err) {
      console.error('Error validating invitation:', err);
      setError(err.response?.data?.message || 'Invalid or expired invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!isLoggedIn) {
      // Store token and redirect to login
      localStorage.setItem('pendingInvite', token);
      navigate('/login');
      return;
    }

    setAccepting(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/invitations/${token}/accept`,
        { visibilityPreference },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        navigate(`/groups/${response.data.data.groupId}`);
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div className="spinner" style={{ width: '50px', height: '50px', margin: '0 auto 20px' }}></div>
          <p style={{ fontSize: '18px' }}>Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '450px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>❌</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', marginBottom: '12px' }}>
            Invalid Invitation
          </h1>
          <p style={{ color: '#718096', marginBottom: '24px' }}>{error}</p>
          <Link to="/login">
            <button className="btn btn-primary" style={{ padding: '12px 32px' }}>
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '70px',
            height: '70px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
          }}>
            <span style={{ 
              color: 'white', 
              fontSize: '36px', 
              fontWeight: 'bold',
              fontFamily: '"Lucida Calligraphy", "Lucida Handwriting", cursive, serif'
            }}>W</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>
            You're Invited!
          </h1>
          <p style={{ color: '#718096', fontSize: '15px' }}>
            You've been invited to join a fundraising group
          </p>
        </div>

        {invitation && (
          <div style={{
            padding: '20px',
            background: '#f7fafc',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>
              {invitation.groupName}
            </h2>
            {invitation.groupDescription && (
              <p style={{ color: '#718096', fontSize: '14px', marginBottom: '12px' }}>
                {invitation.groupDescription}
              </p>
            )}
            <p style={{ fontSize: '13px', color: '#667eea' }}>
              Invited by: {invitation.inviterName}
            </p>
          </div>
        )}

        {/* Visibility Preference */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#2d3748', fontSize: '14px' }}>
            Visibility Preference
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px 16px',
              background: visibilityPreference === 'visible' ? '#e6fffa' : '#f7fafc',
              borderRadius: '8px',
              cursor: 'pointer',
              border: visibilityPreference === 'visible' ? '2px solid #38b2ac' : '2px solid transparent'
            }}>
              <input 
                type="radio" 
                name="visibility" 
                value="visible" 
                checked={visibilityPreference === 'visible'}
                onChange={(e) => setVisibilityPreference(e.target.value)}
              />
              <div>
                <p style={{ fontWeight: '600', color: '#2d3748', margin: 0, fontSize: '14px' }}>👁️ Visible to All Members</p>
                <p style={{ fontSize: '12px', color: '#718096', margin: 0 }}>Other members can see your profile</p>
              </div>
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px 16px',
              background: visibilityPreference === 'private' ? '#e6fffa' : '#f7fafc',
              borderRadius: '8px',
              cursor: 'pointer',
              border: visibilityPreference === 'private' ? '2px solid #38b2ac' : '2px solid transparent'
            }}>
              <input 
                type="radio" 
                name="visibility" 
                value="private" 
                checked={visibilityPreference === 'private'}
                onChange={(e) => setVisibilityPreference(e.target.value)}
              />
              <div>
                <p style={{ fontWeight: '600', color: '#2d3748', margin: 0, fontSize: '14px' }}>🔒 Private (Admin Only)</p>
                <p style={{ fontSize: '12px', color: '#718096', margin: 0 }}>Only admins can see your profile</p>
              </div>
            </label>
          </div>
        </div>

        <button
          onClick={handleAcceptInvite}
          className="btn btn-primary"
          disabled={accepting}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px'
          }}
        >
          {accepting ? 'Joining...' : isLoggedIn ? '✓ Accept & Join Group' : 'Login to Accept'}
        </button>

        {!isLoggedIn && (
          <p style={{ textAlign: 'center', color: '#718096', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>
              Create Account
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default AcceptInvite;
