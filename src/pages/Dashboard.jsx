import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupAPI } from '../services/api';
import { getCurrencySymbol } from '../utils/currencyConverter';
import { formatTimeAgo } from '../utils/timeFormatter';

function Dashboard() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showGroupMenu, setShowGroupMenu] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await groupAPI.getAll();
      const groupsData = res.data.data?.groups || res.data.groups || res.data || [];
      setGroups(Array.isArray(groupsData) ? groupsData : []);

      // Mock recent activity (replace with API call when available)
      setRecentActivity([
        { id: 1, type: 'pledge', user: 'John', action: 'made a pledge', amount: 500, time: new Date(Date.now() - 3600000) },
        { id: 2, type: 'payment', user: 'Sarah', action: 'paid their pledge', amount: 250, time: new Date(Date.now() - 7200000) },
        { id: 3, type: 'join', user: 'Mike', action: 'joined Wedding Fund', time: new Date(Date.now() - 86400000) },
      ]);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Calculate totals
  const totalPledged = groups.reduce((sum, g) => sum + parseFloat(g.pledged_amount || 0), 0);
  const totalReceived = groups.reduce((sum, g) => sum + parseFloat(g.current_amount || 0), 0);
  const totalGoal = groups.reduce((sum, g) => sum + parseFloat(g.goal_amount || 0), 0);

  // Get upcoming deadlines
  const upcomingDeadlines = groups
    .filter(g => g.deadline && new Date(g.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  // ==================== RIGHT SIDEBAR ====================
  const RightSidebar = () => (
    <>
      {/* Recent Activity */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: '#2d3748', fontWeight: '700' }}>
          📈 Recent Activity
        </h3>

        {recentActivity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', color: '#a0aec0' }}>
            <p style={{ margin: 0, fontSize: '13px' }}>No recent activity</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentActivity.map(activity => (
              <div key={activity.id} style={{
                padding: '10px',
                background: '#f7fafc',
                borderRadius: '8px',
                fontSize: '13px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>
                    {activity.type === 'pledge' ? '💰' : activity.type === 'payment' ? '✅' : '👋'}
                  </span>
                  <div>
                    <p style={{ margin: 0, color: '#2d3748' }}>
                      <strong>{activity.user}</strong> {activity.action}
                      {activity.amount && (
                        <span style={{ color: '#48bb78', fontWeight: '600' }}> ${activity.amount}</span>
                      )}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#a0aec0' }}>
                      {formatTimeAgo(activity.time)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Deadlines */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: '#2d3748', fontWeight: '700' }}>
          📅 Upcoming Deadlines
        </h3>

        {upcomingDeadlines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', color: '#a0aec0' }}>
            <p style={{ margin: 0, fontSize: '13px' }}>No upcoming deadlines</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingDeadlines.map(group => {
              const daysLeft = Math.ceil((new Date(group.deadline) - new Date()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysLeft <= 7;
              return (
                <div
                  key={group.id}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  style={{
                    padding: '10px',
                    background: isUrgent ? '#fff5f5' : '#f7fafc',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    border: isUrgent ? '1px solid #fed7d7' : '1px solid transparent'
                  }}
                >
                  <p style={{ margin: 0, fontWeight: '600', color: '#2d3748' }}>{group.name}</p>
                  <p style={{ 
                    margin: '4px 0 0', 
                    fontSize: '12px', 
                    color: isUrgent ? '#e53e3e' : '#718096' 
                  }}>
                    {daysLeft} days left
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div>
      
      {/* Welcome Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        color: 'white'
      }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 'bold' }}>
          Welcome back, {user.first_name || 'User'}! 👋
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
          Here's what's happening with your fundraising groups.
        </p>
      </div>

      {/* Quick Actions Card — My Groups dropdown + Begin Fundraising */}
      <div style={{
        background: 'white', borderRadius: '12px', padding: '14px 16px',
        marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap'
      }}>
        {/* My Groups dropdown */}
        <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
          <button
            onClick={() => setShowGroupMenu(m => !m)}
            style={{
              width: '100%', padding: '10px 14px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
            }}
          >
            <span>☰ My Groups</span>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>
              {groups[0] ? groups[0].name : 'No groups yet'} ▾
            </span>
          </button>
          {showGroupMenu && groups.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: 'white', borderRadius: '10px', zIndex: 100,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}>
              {groups.map(g => (
                <button key={g.id}
                  onClick={() => { navigate(`/groups/${g.id}`); setShowGroupMenu(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 14px', background: 'none',
                    border: 'none', borderBottom: '1px solid #f0f4f9',
                    fontSize: '13px', color: '#2d3748', cursor: 'pointer', fontWeight: 500,
                  }}
                >
                  📁 {g.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Start Fundraising button */}
        <button
          onClick={() => navigate('/create-group')}
          style={{
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
            color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          🚀 Start Fundraising
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* Total Groups */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '16px',
          color: 'white'
        }}>
          <p style={{ fontSize: '12px', opacity: 0.9, margin: '0 0 4px' }}>Total Groups</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{groups.length}</p>
        </div>

        {/* Total Pledged */}
        <div style={{
          background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
          borderRadius: '12px',
          padding: '16px',
          color: 'white'
        }}>
          <p style={{ fontSize: '12px', opacity: 0.9, margin: '0 0 4px' }}>Total Pledged</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>${formatAmount(totalPledged)}</p>
        </div>

        {/* Total Received */}
        <div style={{
          background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
          borderRadius: '12px',
          padding: '16px',
          color: 'white'
        }}>
          <p style={{ fontSize: '12px', opacity: 0.9, margin: '0 0 4px' }}>Total Received</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>${formatAmount(totalReceived)}</p>
        </div>

        {/* Collection Rate */}
        <div style={{
          background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
          borderRadius: '12px',
          padding: '16px',
          color: 'white'
        }}>
          <p style={{ fontSize: '12px', opacity: 0.9, margin: '0 0 4px' }}>Collection Rate</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            {totalPledged > 0 ? ((totalReceived / totalPledged) * 100).toFixed(0) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
