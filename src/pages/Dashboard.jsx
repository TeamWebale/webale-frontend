import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { groupAPI, pledgeAPI } from '../services/api';
import { useRightSidebar } from '../components/MainLayout';
import { getCurrencySymbol } from '../utils/currencyConverter';
import { formatTimeAgo } from '../utils/timeFormatter';

function Dashboard() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const { setRightSidebar } = useRightSidebar();

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

      // Fetch recent activity from all user groups
      const allActivity = [];
      const groupsList = Array.isArray(groupsData) ? groupsData : [];
      for (const g of groupsList.slice(0, 5)) {
        try {
          const pledgeRes = await pledgeAPI.getByGroup(g.id);
          const raw = pledgeRes.data;
          const pledgeData = raw?.data?.pledges || raw?.data || raw?.pledges || (Array.isArray(raw) ? raw : []);
          const pledgeArr = Array.isArray(pledgeData) ? pledgeData : [];
          pledgeArr.slice(0, 3).forEach(p => {
            allActivity.push({
              id: `p-${p.id}`,
              type: p.status === 'paid' ? 'payment' : 'pledge',
              user: p.donor_name?.trim() || p.first_name || p.user_name || 'Member',
              action: p.status === 'paid' ? `paid their pledge in ${g.name}` : `pledged in ${g.name}`,
              amount: parseFloat(p.amount || p.original_amount || 0),
              currency: p.pledge_currency || g.currency || 'USD',
              time: new Date(p.created_at),
            });
          });
        } catch (e) {
          console.warn('Activity fetch for group', g.id, e.message);
        }
      }
      allActivity.sort((a, b) => b.time - a.time);
      setRecentActivity(allActivity.slice(0, 5));
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
        borderRadius: '10px',
        padding: '12px',
        marginBottom: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '14px', color: '#2d3748', fontWeight: '700' }}>
          📈 Recent Activity
        </h3>

        {recentActivity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '8px', color: '#a0aec0' }}>
            <p style={{ margin: 0, fontSize: '12px' }}>No recent activity</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {recentActivity.map(activity => (
              <div key={activity.id} style={{
                padding: '6px 8px',
                background: '#f7fafc',
                borderRadius: '6px',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px' }}>
                    {activity.type === 'pledge' ? '💰' : activity.type === 'payment' ? '✅' : '👋'}
                  </span>
                  <div>
                    <p style={{ margin: 0, color: '#2d3748' }}>
                      <strong>{activity.user}</strong> {activity.action}
                      {activity.amount && (
                        <span style={{ color: '#48bb78', fontWeight: '600' }}> {getCurrencySymbol(activity.currency)}{activity.amount.toLocaleString()}</span>
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
        borderRadius: '10px',
        padding: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '14px', color: '#2d3748', fontWeight: '700' }}>
          📅 Upcoming Deadlines
        </h3>

        {upcomingDeadlines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '8px', color: '#a0aec0' }}>
            <p style={{ margin: 0, fontSize: '12px' }}>No upcoming deadlines</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {upcomingDeadlines.map(group => {
              const daysLeft = Math.ceil((new Date(group.deadline) - new Date()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysLeft <= 7;
              return (
                <div
                  key={group.id}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  style={{
                    padding: '6px 8px',
                    background: isUrgent ? '#fff5f5' : '#f7fafc',
                    borderRadius: '6px',
                    fontSize: '12px',
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

  // Inject right sidebar into MainLayout
  useEffect(() => {
    if (!loading) setRightSidebar(<RightSidebar />);
    return () => setRightSidebar(null);
  }, [loading, groups, recentActivity]);

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
          Welcome back! 👋
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
          Here's what's happening with your fundraising groups.
        </p>
      </div>

      {/* Quick Actions Card — My Groups dropdown + Begin Fundraising */}
      <div style={{
        background: 'white', borderRadius: '12px', padding: '14px 16px',
        marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        position: 'relative', zIndex: 10, overflow: 'visible'
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
              background: 'white', borderRadius: '10px', zIndex: 999,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
            }}>
              {groups.map(g => (
                <Link key={g.id}
                  to={`/groups/${g.id}`}
                  onClick={() => setShowGroupMenu(false)}
                  style={{
                    display: 'block', padding: '10px 14px',
                    borderBottom: '1px solid #f0f4f9',
                    fontSize: '13px', color: '#2d3748', fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  📁 {g.name}
                </Link>
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
            display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px',
          }}
        >
          🚀 Start Fundraising
        </button>
      </div>

      {/* Webale! Hero Banner (login-hero image) */}
      <div style={{
        position: 'relative',
        borderRadius: '14px',
        overflow: 'hidden',
        marginBottom: '20px',
        height: '200px',
        backgroundImage: "url('/login-hero.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 4px 20px rgba(27,45,79,0.25)',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(180deg, rgba(13,27,46,0.6) 0%, rgba(13,27,46,0.1) 40%, rgba(13,27,46,0.7) 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '16px 20px',
        }}>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'white', lineHeight: 1.4, maxWidth: '500px', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            Because your cause is personal — <span style={{ color: '#00E5CC' }}>Webale!</span> gives you a befitting platform.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', padding: '6px 14px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)' }}>🔒 Invitation-Only</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', padding: '6px 14px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)' }}>💱 160+ Currencies</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', padding: '6px 14px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)' }}>📊 Real-Time Tracking</span>
          </div>
        </div>
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
