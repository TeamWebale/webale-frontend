import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupAPI } from '../services/api';

function JoinGroup() {
  const { token } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const [invitationInfo, setInvitationInfo] = useState(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/invite/${token}`);
      return;
    }

    loadInvitationInfo();
  }, [isAuthenticated, token]);

  const loadInvitationInfo = async () => {
    try {
      // We need to create a new endpoint to get invitation details without joining
      // For now, we'll track the click but not join yet
      const response = await fetch(`https://webale-api.onrender.com/api/groups/invitation/${token}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.message || 'Invalid or expired invitation');
        setLoading(false);
        return;
      }

      setGroupInfo(data.data.group);
      setInvitationInfo(data.data.invitation);
    } catch (err) {
      console.error('Load invitation error:', err);
      setError('Failed to load invitation details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    setJoining(true);
    try {
      const response = await groupAPI.join(token);
      const groupId = response.data.data.groupId;
      setSuccess(true);
      setTimeout(() => navigate(`/groups/${groupId}`), 2000);
    } catch (err) {
      console.error('Join group error:', err);
      setError(err.response?.data?.message || 'Failed to join group');
      setJoining(false);
    }
  };

  const handleDecline = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="card" style={{ maxWidth: '500px', width: '90%', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>Loading Invitation...</h2>
          <p style={{ color: '#718096' }}>Please wait while we verify your invitation</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="card" style={{ maxWidth: '500px', width: '90%', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#742a2a', marginBottom: '8px' }}>Unable to Join Group</h2>
          <p style={{ color: '#718096', marginBottom: '24px' }}>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ width: '100%' }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="card" style={{ maxWidth: '500px', width: '90%', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#22543d', marginBottom: '8px' }}>Successfully Joined!</h2>
          <p style={{ color: '#718096', marginBottom: '8px' }}>Welcome to {groupInfo?.name}</p>
          <p style={{ color: '#718096', marginBottom: '8px' }}>Redirecting to group...</p>
          <div className="spinner" style={{ margin: '20px auto 0', width: '30px', height: '30px' }}></div>
        </div>
      </div>
    );
  }

  // Confirmation Screen
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✉️</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>
            You've Been Invited!
          </h1>
          <p style={{ color: '#718096', fontSize: '15px' }}>
            {invitationInfo?.inviter_name} has invited you to join a fundraising group
          </p>
        </div>

        {/* Group Information Card */}
        <div style={{ padding: '24px', background: '#f7fafc', borderRadius: '12px', border: '2px solid #e2e8f0', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>
            {groupInfo?.name}
          </h2>
          {groupInfo?.description && (
            <p style={{ color: '#718096', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
              {groupInfo.description}
            </p>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Goal Amount</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                ${parseFloat(groupInfo?.goal_amount || 0).toFixed(2)}
              </p>
            </div>
            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Members</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                {groupInfo?.member_count || 0}
              </p>
            </div>
          </div>

          {groupInfo?.deadline && (
            <div style={{ marginTop: '12px', padding: '12px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Deadline</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>
                {new Date(groupInfo.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {/* Confirmation Message */}
        <div style={{ padding: '16px', background: '#e6fffa', border: '2px solid #81e6d9', borderRadius: '8px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
            <span style={{ fontSize: '24px', flexShrink: 0 }}>🔒</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#234e52', marginBottom: '4px' }}>
                Do you want to join this group?
              </p>
              <p style={{ fontSize: '13px', color: '#2c7a7b', lineHeight: '1.5' }}>
                By joining, you'll be able to see group details, make pledges, contribute to the fundraising goal, and interact with other members.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleJoinGroup}
            className="btn btn-primary"
            disabled={joining}
            style={{ flex: 1, fontSize: '16px', padding: '14px' }}
          >
            {joining ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: 'white', borderTopColor: 'transparent' }}></div>
                Joining...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span>✓</span> Yes, Join Group
              </span>
            )}
          </button>
          <button 
            onClick={handleDecline}
            className="btn"
            disabled={joining}
            style={{ flex: 1, background: '#e2e8f0', color: '#2d3748', fontSize: '16px', padding: '14px' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>✗</span> No Thanks
            </span>
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#718096', marginTop: '16px' }}>
          You can always leave the group later from the group settings
        </p>
      </div>
    </div>
  );
}

export default JoinGroup;