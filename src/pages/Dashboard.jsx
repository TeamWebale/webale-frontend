import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { groupAPI } from '../services/api';
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

      // Recent activity will be populated from API when available
      setRecentActivity([]);
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

      {/* Webale! Pitch Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1B2D4F 0%, #2d4a7a 50%, #4A7FC1 100%)',
        borderRadius: '14px',
        padding: '24px 22px',
        marginBottom: '20px',
        color: 'white',
        boxShadow: '0 4px 20px rgba(27,45,79,0.25)',
        lineHeight: '1.75',
        fontSize: '14px',
      }}>
        <p style={{ margin: '0 0 14px', opacity: 0.85 }}>
          Watching fundraisers manually repost to update donor groups of campaign progress got us thinking; 'it was never meant to be that way,' and we rolled the sleeves to build <strong>Webale!</strong> for automation of a number of related tasks.
        </p>
        <p style={{ margin: '0 0 14px' }}>
          Because <strong>Webale!</strong> is designed with your donor circle in mind; team growth, campaign target and action tracking dominated the array of tools and features. After all, invitation-only groups already trust each other; all they needed was a structured, transparent way to enliven the task and pool money.
        </p>
        <p style={{ margin: '0 0 14px' }}>
          The App gets all pledge and contributions tracked and logged so members are continually updated of who committed to what, fulfilled, revised or even revoked a pledge. Continuing the money conversation, real time progress-bars charm members with a visual of how far or close the group is to the finishing line; inspiring a 'yes we can' wave of participation.
        </p>
        <p style={{ margin: '0 0 14px' }}>
          The rest is currency conversions across 160+ countries, quarterly milestones, automated reminders, acknowledgements, in-built member messaging and admin controls that put fundraisers firmly in charge, etc.
        </p>
        <p style={{ margin: '0 0 14px' }}>
          Moreover that's a mere peek into the arsenal of innovation we intend to deploy for the success of your fundraising. So what keeps you from launching your cause right here?
        </p>
        <p style={{ margin: '0 0 14px' }}>
          Be it a five member family group or five hundred diaspora contributors, <strong>Webale!</strong> is here to help you replace the chaos of manual record-keeping with a dashboard alive and breathing to keep everyone aligned, motivated, acknowledged and fully notified.
        </p>
        <p style={{ margin: '0 0 10px', fontSize: '15px' }}>
          Because your cause is personal, <span style={{ color: '#00E5CC' }}>Webale! — Private Group Fundraising</span> gives you a befitting platform.
        </p>
        <p style={{ margin: '0 0 4px', fontSize: '13px', opacity: 0.7 }}>
          Sincerely,
        </p>
        <p style={{ margin: 0 }}>
          <a href="mailto:theteam@webale.net" style={{ color: '#FFB800', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
            theteam@webale.net 📧
          </a>
        </p>
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
