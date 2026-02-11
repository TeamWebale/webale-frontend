import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupAPI, pledgeAPI } from '../services/api';
import { getCurrencySymbol } from '../utils/currencyConverter';
import { formatTimeAgo } from '../utils/timeFormatter';
import MainLayout from '../components/MainLayout';
import PaymentButton from '../components/PaymentButton';

function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Data states
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [pledges, setPledges] = useState([]);
  const [members, setMembers] = useState([]);
  const [subGoals, setSubGoals] = useState([]);
  
  // UI states
  const [activeTab, setActiveTab] = useState('overview');

  // Derived values
  const isAdmin = group?.user_role === 'admin' || group?.role === 'admin';
  const currencySymbol = getCurrencySymbol(group?.currency || 'USD');

  useEffect(() => {
    loadGroupData();
  }, [id]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const groupRes = await groupAPI.getById(id);
      const groupData = groupRes.data.data?.group || groupRes.data.group || groupRes.data.data || groupRes.data;
      setGroup(groupData);

      try {
        const pledgesRes = await pledgeAPI.getByGroup(id);
        const pledgesData = pledgesRes.data.data?.pledges || pledgesRes.data.pledges || pledgesRes.data || [];
        setPledges(Array.isArray(pledgesData) ? pledgesData : []);
      } catch (e) {
        setPledges([]);
      }

      try {
        const membersRes = await groupAPI.getMembers(id);
        const membersData = membersRes.data.data?.members || membersRes.data.members || membersRes.data || [];
        setMembers(Array.isArray(membersData) ? membersData : []);
      } catch (e) {
        setMembers([]);
      }
    } catch (err) {
      console.error('Error loading group:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const pledgedPercent = group?.goal_amount > 0 
    ? ((parseFloat(group.pledged_amount || 0) / parseFloat(group.goal_amount)) * 100).toFixed(1) 
    : 0;

  const receivedPercent = group?.goal_amount > 0 
    ? ((parseFloat(group.current_amount || 0) / parseFloat(group.goal_amount)) * 100).toFixed(1) 
    : 0;

  const handleMakePledge = async () => {
    const amount = prompt('Enter pledge amount:');
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;
    try {
      await pledgeAPI.create(id, { amount: parseFloat(amount) });
      loadGroupData();
      alert('Pledge created successfully!');
    } catch (err) {
      alert('Failed to create pledge');
    }
  };

  const handleMarkPaid = async (pledgeId) => {
    if (!window.confirm('Mark this pledge as fully paid?')) return;
    try {
      await pledgeAPI.markAsPaid(id, pledgeId);
      loadGroupData();
    } catch (err) {
      alert('Failed to mark as paid');
    }
  };

  // ==================== RIGHT SIDEBAR ====================
  const RightSidebar = () => (
    <>
      {/* Live Donor Feed */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#e53e3e',
              animation: 'pulse 2s infinite'
            }} />
            <h3 style={{ margin: 0, fontSize: '15px', color: '#2d3748', fontWeight: '700' }}>
              Live Donor Feed
            </h3>
          </div>
        </div>

        {pledges.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', color: '#a0aec0' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px' }}>No recent pledges yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {pledges.slice(0, 5).map(pledge => (
              <div key={pledge.id} style={{
                padding: '10px',
                background: '#f7fafc',
                borderRadius: '8px',
                fontSize: '13px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600', color: '#2d3748' }}>
                    {pledge.is_anonymous ? 'Anonymous' : pledge.first_name}
                  </span>
                  <span style={{ color: '#48bb78', fontWeight: '600' }}>
                    {currencySymbol}{formatAmount(pledge.amount)}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#a0aec0' }}>
                  {formatTimeAgo(pledge.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{
          padding: '8px 12px',
          background: '#faf5ff',
          borderRadius: '20px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '12px', color: '#9f7aea' }}>
            💡 Updates every 30 seconds
          </span>
        </div>

        {/* Add Sub-Goal button */}
        {isAdmin && (
          <button style={{
            width: '100%',
            marginTop: '12px',
            padding: '8px',
            background: 'none',
            border: 'none',
            color: '#667eea',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'right'
          }}>
            + Add Sub-Goal
          </button>
        )}
      </div>

      {/* Milestones */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: '#2d3748', fontWeight: '700' }}>
          Milestones
        </h3>

        {subGoals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎯</div>
            <p style={{ color: '#a0aec0', fontSize: '13px', margin: '0 0 12px' }}>
              No sub-goals yet
            </p>
            {isAdmin && (
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '10px', fontSize: '13px' }}
              >
                Create First Sub-Goal
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {subGoals.map(goal => (
              <div key={goal.id} style={{ padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                <p style={{ fontWeight: '600', margin: '0 0 4px', fontSize: '13px' }}>{goal.name}</p>
                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(goal.current / goal.target) * 100}%`,
                    background: '#48bb78',
                    borderRadius: '3px'
                  }} />
                </div>
                <p style={{ fontSize: '11px', color: '#718096', margin: '4px 0 0' }}>
                  {currencySymbol}{goal.current} / {currencySymbol}{goal.target}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );

  // ==================== TAB DEFINITIONS ====================
  const tabs = [
    { id: 'overview', icon: '📊', label: 'Overview', show: true },
    { id: 'pledges', icon: '💰', label: 'Pledges', show: true },
    { id: 'members', icon: '👥', label: 'Members', show: true },
    { id: 'activity', icon: '📈', label: 'Activity', show: true },
    { id: 'recurring', icon: '🔄', label: 'Recurring', show: true },
    { id: 'audit', icon: '📋', label: 'Audit', show: isAdmin },
    { id: 'admin', icon: '⚙️', label: 'Admin', show: isAdmin },
  ];

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <div className="spinner"></div>
        </div>
      </MainLayout>
    );
  }

  if (!group) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>😕</div>
          <h2>Group Not Found</h2>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            ← Back to Dashboard
          </button>
        </div>
      </MainLayout>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <MainLayout rightSidebar={<RightSidebar />} showProfileBanner={true}>
      
      {/* Group Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {group.name?.charAt(0) || 'G'}
          </div>
          <div>
            <span style={{
              padding: '3px 10px',
              background: isAdmin ? '#ed8936' : '#48bb78',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {isAdmin ? 'Admin' : 'Member'}
            </span>
            <p style={{ opacity: 0.9, fontSize: '13px', margin: '6px 0 0' }}>
              {group.description || 'One For All, All For One!'}
            </p>
          </div>
        </div>

        {/* Action Buttons Row 1 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {isAdmin && (
            <button className="btn" style={{ background: '#4299e1', color: 'white', padding: '8px 14px', fontSize: '13px' }}>
              ✏️ Edit
            </button>
          )}
          <button className="btn" style={{ background: '#667eea', color: 'white', padding: '8px 14px', fontSize: '13px' }}>
            👥 Invite
          </button>
          {isAdmin && (
            <button className="btn" style={{ background: '#ed8936', color: 'white', padding: '8px 14px', fontSize: '13px' }}>
              💳 Record Payment
            </button>
          )}
          <button className="btn" style={{ background: '#e53e3e', color: 'white', padding: '8px 14px', fontSize: '13px' }}>
            📊 Export Data
          </button>
        </div>

        {/* Action Buttons Row 2 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn" style={{ background: '#48bb78', color: 'white', padding: '8px 14px', fontSize: '13px' }}>
            📄 Generate Report
          </button>
          <button onClick={handleMakePledge} className="btn" style={{ background: '#38b2ac', color: 'white', padding: '8px 14px', fontSize: '13px' }}>
            💰 Make Pledge
          </button>
          <button className="btn" style={{ background: '#667eea', color: 'white', padding: '8px 14px', fontSize: '13px' }}>
            💬 Messages
          </button>
          <button className="btn" style={{ background: '#718096', color: 'white', padding: '8px 14px', fontSize: '13px' }}>
            💱 Convert
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ color: '#48bb78', fontWeight: '600', fontSize: '14px' }}>
            💰 {currencySymbol}{formatAmount(group.pledged_amount || 0)} pledged
          </span>
          <span style={{ color: '#a0aec0', fontSize: '13px' }}>{pledgedPercent}%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ color: '#667eea', fontWeight: '600', fontSize: '14px' }}>
            💵 {currencySymbol}{formatAmount(group.current_amount || 0)} received
          </span>
          <span style={{ color: '#a0aec0', fontSize: '13px' }}>{receivedPercent}%</span>
        </div>
        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '10px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(receivedPercent, 100)}%`,
            background: 'linear-gradient(90deg, #48bb78, #38b2ac)',
            borderRadius: '4px'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#718096', flexWrap: 'wrap', gap: '8px' }}>
          <span>🎯 Goal: {currencySymbol}{formatAmount(group.goal_amount)}</span>
          <span>👥 {members.length || 0} members</span>
          <span>📅 {group.deadline ? new Date(group.deadline).toLocaleDateString() : 'No deadline'}</span>
        </div>
      </div>

      {/* Tab Navigation - ALL 7 TABS */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '16px',
        overflowX: 'auto'
      }}>
        {tabs.filter(tab => tab.show).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
              color: activeTab === tab.id ? '#667eea' : '#718096',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        minHeight: '250px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)' 
      }}>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h3 style={{ marginBottom: '12px', color: '#2d3748', fontSize: '16px' }}>📊 Group Overview</h3>
            <p style={{ color: '#718096', fontSize: '14px' }}>{group.description || 'Welcome to this group!'}</p>
            {pledges.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ marginBottom: '10px', color: '#4a5568', fontSize: '14px' }}>Recent Pledges</h4>
                {pledges.slice(0, 3).map(pledge => (
                  <div key={pledge.id} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px',
                    background: '#f7fafc', borderRadius: '8px', marginBottom: '6px', fontSize: '13px'
                  }}>
                    <span>{pledge.is_anonymous ? 'Anonymous' : `${pledge.first_name} ${pledge.last_name}`}</span>
                    <span style={{ fontWeight: '600', color: '#48bb78' }}>{currencySymbol}{formatAmount(pledge.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pledges Tab */}
        {activeTab === 'pledges' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, color: '#2d3748', fontSize: '16px' }}>💰 All Pledges ({pledges.length})</h3>
              <button onClick={handleMakePledge} className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 14px' }}>
                + New Pledge
              </button>
            </div>
            {pledges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>💰</div>
                <p>No pledges yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pledges.map(pledge => {
                  const isMyPledge = pledge.user_id === currentUser.id;
                  const remaining = parseFloat(pledge.amount) - parseFloat(pledge.amount_paid || 0);
                  return (
                    <div key={pledge.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px', background: '#f7fafc', borderRadius: '10px',
                      borderLeft: `4px solid ${pledge.status === 'paid' ? '#48bb78' : pledge.status === 'partial' ? '#ed8936' : '#e53e3e'}`,
                      flexWrap: 'wrap', gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: pledge.is_anonymous ? '#a0aec0' : '#667eea',
                          color: 'white', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: 'bold', fontSize: '14px'
                        }}>
                          {pledge.is_anonymous ? '?' : (pledge.first_name?.charAt(0) || '?')}
                        </div>
                        <div>
                          <p style={{ fontWeight: '600', color: '#2d3748', margin: 0, fontSize: '13px' }}>
                            {pledge.is_anonymous ? 'Anonymous' : `${pledge.first_name} ${pledge.last_name}`}
                            {isMyPledge && <span style={{ color: '#667eea', fontSize: '11px' }}> (you)</span>}
                          </p>
                          <p style={{ fontSize: '11px', color: '#a0aec0', margin: 0 }}>{formatTimeAgo(pledge.created_at)}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 'bold', color: '#2d3748', margin: 0, fontSize: '14px' }}>{currencySymbol}{formatAmount(pledge.amount)}</p>
                          <p style={{ fontSize: '11px', color: '#48bb78', margin: 0 }}>Paid: {currencySymbol}{formatAmount(pledge.amount_paid || 0)}</p>
                        </div>
                        <span style={{
                          padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '600',
                          background: pledge.status === 'paid' ? '#c6f6d5' : pledge.status === 'partial' ? '#feebc8' : '#fed7d7',
                          color: pledge.status === 'paid' ? '#276749' : pledge.status === 'partial' ? '#c05621' : '#c53030'
                        }}>
                          {pledge.status}
                        </span>
                        {isMyPledge && remaining > 0 && (
                          <PaymentButton pledge={pledge} group={group} onPaymentComplete={loadGroupData} variant="small" />
                        )}
                        {isAdmin && pledge.status !== 'paid' && (
                          <button onClick={() => handleMarkPaid(pledge.id)} style={{
                            padding: '5px 10px', background: '#48bb78', color: 'white',
                            border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer'
                          }}>✓ Mark Paid</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            <h3 style={{ marginBottom: '14px', color: '#2d3748', fontSize: '16px' }}>👥 Members ({members.length})</h3>
            {members.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>👥</div>
                <p>No members data</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                {members.map((member, idx) => (
                  <div key={member.id || idx} style={{ padding: '14px', background: '#f7fafc', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: member.role === 'admin' ? '#9f7aea' : '#667eea',
                      color: 'white', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 8px'
                    }}>
                      {member.first_name?.charAt(0) || '?'}
                    </div>
                    <p style={{ fontWeight: '600', color: '#2d3748', margin: '0 0 4px', fontSize: '13px' }}>
                      {member.first_name} {member.last_name}
                    </p>
                    <span style={{
                      padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '600',
                      background: member.role === 'admin' ? '#9f7aea' : '#e2e8f0',
                      color: member.role === 'admin' ? 'white' : '#4a5568'
                    }}>
                      {member.role || 'member'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div>
            <h3 style={{ marginBottom: '14px', color: '#2d3748', fontSize: '16px' }}>📈 Activity Feed</h3>
            <div style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
              <p>No recent activity</p>
            </div>
          </div>
        )}

        {/* Recurring Tab */}
        {activeTab === 'recurring' && (
          <div>
            <h3 style={{ marginBottom: '14px', color: '#2d3748', fontSize: '16px' }}>🔄 Recurring Pledges</h3>
            <div style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔄</div>
              <p>No recurring pledges</p>
              <button className="btn btn-primary" style={{ marginTop: '10px', fontSize: '13px' }}>
                + Set Up Recurring
              </button>
            </div>
          </div>
        )}

        {/* Audit Tab (Admin Only) */}
        {activeTab === 'audit' && isAdmin && (
          <div>
            <h3 style={{ marginBottom: '14px', color: '#2d3748', fontSize: '16px' }}>📋 Audit Trail</h3>
            <div style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📋</div>
              <p>No audit logs yet</p>
            </div>
          </div>
        )}

        {/* Admin Tab (Admin Only) */}
        {activeTab === 'admin' && isAdmin && (
          <div>
            <h3 style={{ marginBottom: '14px', color: '#2d3748', fontSize: '16px' }}>⚙️ Admin Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn" style={{ background: '#4299e1', color: 'white', padding: '12px', textAlign: 'left' }}>
                ✏️ Edit Group Details
              </button>
              <button className="btn" style={{ background: '#9f7aea', color: 'white', padding: '12px', textAlign: 'left' }}>
                👥 Manage Members
              </button>
              <button className="btn" style={{ background: '#ed8936', color: 'white', padding: '12px', textAlign: 'left' }}>
                🎯 Manage Sub-Goals
              </button>
              <button className="btn" style={{ background: '#e53e3e', color: 'white', padding: '12px', textAlign: 'left' }}>
                🗑️ Delete Group
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default GroupDetails;
