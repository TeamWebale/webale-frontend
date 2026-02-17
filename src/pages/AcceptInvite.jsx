import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://webale-api.onrender.com/api';

function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invitation, setInvitation] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    checkLoginAndLoadInvite();
  }, [token]);

  const checkLoginAndLoadInvite = async () => {
    const userToken = localStorage.getItem('token');
    setIsLoggedIn(!!userToken);

    try {
      const response = await axios.get(`${API_URL}/invitations/${token}/validate`);
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
      // Store invite token for after login/register
      localStorage.setItem('pendingInvite', token);
      navigate('/login', { state: { fromInvite: true } });
      return;
    }

    setAccepting(true);
    try {
      const response = await axios.post(
        `${API_URL}/invitations/${token}/accept`,
        {},
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
      setError(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const handleGoToRegister = () => {
    localStorage.setItem('pendingInvite', token);
    navigate('/register', { state: { fromInvite: true } });
  };

  const handleGoToLogin = () => {
    localStorage.setItem('pendingInvite', token);
    navigate('/login', { state: { fromInvite: true } });
  };

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div className="spinner" style={{ width: '50px', height: '50px', margin: '0 auto 20px' }}></div>
          <p style={{ fontSize: '18px' }}>Validating invitation...</p>
        </div>
      </div>
    );
  }

  // ==================== ERROR ====================
  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px'
      }}>
        <div style={{
          background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '450px',
          width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>😔</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', marginBottom: '12px' }}>
            Invitation Unavailable
          </h1>
          <p style={{ color: '#718096', marginBottom: '24px' }}>{error}</p>
          <Link to="/login">
            <button className="btn btn-primary" style={{ padding: '12px 32px' }}>Go to Login</button>
          </Link>
        </div>
      </div>
    );
  }

  // ==================== MAIN INVITE PAGE ====================
  const inviterName = invitation?.inviterName || 'Someone';
  const groupName = invitation?.groupName || 'a fundraising group';
  const groupDescription = invitation?.groupDescription || '';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 30%, #553c9a 70%, #667eea 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '24px', width: '100%', maxWidth: '480px',
        overflow: 'hidden', boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)'
      }}>

        {/* Top Decorative Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '32px 30px 40px', textAlign: 'center', position: 'relative'
        }}>
          {/* Floating envelope icon */}
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '36px',
            border: '3px solid rgba(255,255,255,0.3)'
          }}>
            💌
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
            You've Been Invited
          </p>
          {/* Webale logo small */}
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '8px' }}>
            via Webale Private Fundraising
          </p>
        </div>

        {/* Personalized Invitation Card */}
        <div style={{ padding: '30px' }}>

          {/* The invitation message */}
          <div style={{
            padding: '24px', borderRadius: '16px', marginBottom: '24px',
            background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
            border: '1px solid #e2e8f0', position: 'relative'
          }}>
            {/* Decorative quote mark */}
            <div style={{
              position: 'absolute', top: '-12px', left: '20px',
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '16px', fontWeight: 'bold'
            }}>✉</div>

            <p style={{ fontSize: '16px', color: '#2d3748', lineHeight: '1.7', margin: '8px 0 0' }}>
              <strong style={{ color: '#553c9a' }}>{inviterName}</strong>{' '}
              cordially invites you to join
            </p>
            <h2 style={{
              fontSize: '22px', fontWeight: '800', color: '#2d3748',
              margin: '8px 0', lineHeight: '1.3'
            }}>
              "{groupName}"
            </h2>
            {groupDescription && (
              <p style={{ fontSize: '14px', color: '#718096', margin: '8px 0 0', fontStyle: 'italic', lineHeight: '1.5' }}>
                {groupDescription}
              </p>
            )}
            <p style={{ fontSize: '14px', color: '#4a5568', margin: '12px 0 0', lineHeight: '1.6' }}>
              A private fundraising group on the <strong>Webale</strong> platform.
              Follow the steps below to accept and join — see you there! 🤝
            </p>
          </div>

          {/* Action Buttons */}
          {isLoggedIn ? (
            <>
              <button onClick={handleAcceptInvite} disabled={accepting} className="btn btn-primary"
                style={{
                  width: '100%', padding: '16px', fontSize: '16px', fontWeight: '700',
                  marginBottom: '12px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  border: 'none', color: 'white', cursor: accepting ? 'wait' : 'pointer'
                }}>
                {accepting ? 'Joining...' : '✓ Accept & Join Group'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#a0aec0' }}>
                You're signed in. Click above to join instantly.
              </p>
            </>
          ) : (
            <>
              {/* Sign In Button */}
              <button onClick={handleGoToLogin}
                style={{
                  width: '100%', padding: '16px', fontSize: '16px', fontWeight: '700',
                  marginBottom: '10px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none', color: 'white', cursor: 'pointer'
                }}>
                🔑 Sign In to Accept
              </button>

              {/* Sign Up Button */}
              <button onClick={handleGoToRegister}
                style={{
                  width: '100%', padding: '16px', fontSize: '16px', fontWeight: '700',
                  marginBottom: '12px', borderRadius: '12px',
                  background: 'white', border: '2px solid #667eea',
                  color: '#667eea', cursor: 'pointer'
                }}>
                ✨ Create Account & Join
              </button>

              <div style={{
                padding: '12px', background: '#fffbeb', borderRadius: '8px',
                border: '1px solid #fefcbf', fontSize: '12px', color: '#975a16', textAlign: 'center'
              }}>
                After signing in or creating an account, you'll automatically be added to this group.
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 30px', background: '#f7fafc', borderTop: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '11px', color: '#a0aec0', margin: 0 }}>
            🔒 Webale — Private Group Fundraising Platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default AcceptInvite;
