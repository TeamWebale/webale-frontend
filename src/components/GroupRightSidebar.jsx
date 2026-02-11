import { useState, useEffect } from 'react';
import { activityAPI, subGoalsAPI } from '../services/api';
import { formatTimeAgo } from '../utils/timeFormatter';
import { getCountryFlag } from '../utils/countries';

function GroupRightSidebar({ groupId, groupCurrency = 'USD', isAdmin = false }) {
  const [activities, setActivities] = useState([]);
  const [subGoals, setSubGoals] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingSubGoals, setLoadingSubGoals] = useState(true);
  const [showAddSubGoal, setShowAddSubGoal] = useState(false);
  const [newSubGoal, setNewSubGoal] = useState({ title: '', targetAmount: '' });

  useEffect(() => {
    loadActivities();
    loadSubGoals();
  }, [groupId]);

  const loadActivities = async () => {
    try {
      const response = await activityAPI.getGroupActivities(groupId);
      setActivities((response.data.data.activities || []).slice(0, 5));
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const loadSubGoals = async () => {
    try {
      const response = await subGoalsAPI.getGroupSubGoals(groupId);
      setSubGoals(response.data.data.subGoals || []);
    } catch (error) {
      console.error('Error loading sub-goals:', error);
    } finally {
      setLoadingSubGoals(false);
    }
  };

  const handleAddSubGoal = async () => {
    if (!newSubGoal.title || !newSubGoal.targetAmount) return;
    
    try {
      await subGoalsAPI.create(groupId, {
        title: newSubGoal.title,
        targetAmount: parseFloat(newSubGoal.targetAmount)
      });
      setNewSubGoal({ title: '', targetAmount: '' });
      setShowAddSubGoal(false);
      loadSubGoals();
    } catch (error) {
      console.error('Error creating sub-goal:', error);
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', UGX: 'UGX ', KES: 'KES ' };
    return symbols[currency] || currency + ' ';
  };

  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getActivityIcon = (type) => {
    const icons = {
      'pledge_created': '💰',
      'pledge_paid': '✅',
      'member_joined': '👋',
      'comment_added': '💬',
      'group_updated': '✏️',
      'contribution': '💵'
    };
    return icons[type] || '📌';
  };

  return (
    <>
      {/* Live Donor Feed - Compact */}
      <div className="card" style={{ padding: '16px' }}>
        <h4 style={{ 
          fontSize: '11px', 
          fontWeight: '600', 
          color: '#a0aec0', 
          marginBottom: '12px', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#48bb78',
            animation: 'pulse 2s ease-in-out infinite'
          }}></span>
          Live Activity
        </h4>
        
        {loadingActivities ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto' }}></div>
          </div>
        ) : activities.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '16px 0',
            color: '#a0aec0',
            fontSize: '13px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📭</div>
            No recent activity
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activities.map((activity, idx) => (
              <div 
                key={activity.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '8px',
                  background: '#f7fafc',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              >
                <span style={{ fontSize: '16px' }}>{getActivityIcon(activity.activity_type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, color: '#2d3748', lineHeight: '1.3' }}>
                    <strong>{activity.first_name || 'Someone'}</strong>
                    {' '}
                    {activity.activity_type === 'pledge_created' && 'made a pledge'}
                    {activity.activity_type === 'pledge_paid' && 'completed a pledge'}
                    {activity.activity_type === 'member_joined' && 'joined the group'}
                    {activity.activity_type === 'comment_added' && 'added a comment'}
                    {activity.activity_type === 'contribution' && 'contributed'}
                  </p>
                  <p style={{ margin: '2px 0 0', color: '#a0aec0', fontSize: '11px' }}>
                    {formatTimeAgo(activity.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sub-Goals & Milestones - Compact */}
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h4 style={{ 
            fontSize: '11px', 
            fontWeight: '600', 
            color: '#a0aec0', 
            textTransform: 'uppercase', 
            letterSpacing: '1px',
            margin: 0
          }}>
            🎯 Milestones
          </h4>
          {isAdmin && (
            <button
              onClick={() => setShowAddSubGoal(!showAddSubGoal)}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0',
                lineHeight: 1
              }}
            >
              {showAddSubGoal ? '✕' : '+'}
            </button>
          )}
        </div>

        {/* Add Sub-Goal Form */}
        {showAddSubGoal && (
          <div style={{ 
            padding: '12px', 
            background: '#f7fafc', 
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            <input
              type="text"
              placeholder="Milestone title"
              value={newSubGoal.title}
              onChange={(e) => setNewSubGoal({ ...newSubGoal, title: e.target.value })}
              className="input"
              style={{ marginBottom: '8px', padding: '8px 12px', fontSize: '13px' }}
            />
            <input
              type="number"
              placeholder="Target amount"
              value={newSubGoal.targetAmount}
              onChange={(e) => setNewSubGoal({ ...newSubGoal, targetAmount: e.target.value })}
              className="input"
              style={{ marginBottom: '8px', padding: '8px 12px', fontSize: '13px' }}
            />
            <button
              onClick={handleAddSubGoal}
              className="btn btn-primary"
              style={{ width: '100%', padding: '8px', fontSize: '12px' }}
            >
              Add Milestone
            </button>
          </div>
        )}
        
        {loadingSubGoals ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto' }}></div>
          </div>
        ) : subGoals.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '16px 0',
            color: '#a0aec0',
            fontSize: '13px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
            No milestones yet
            {isAdmin && (
              <p style={{ fontSize: '11px', marginTop: '4px' }}>
                Click + to add one
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {subGoals.map((goal) => {
              const progress = calculateProgress(goal.current_amount, goal.target_amount);
              const isComplete = progress >= 100;
              
              return (
                <div 
                  key={goal.id}
                  style={{
                    padding: '10px',
                    background: isComplete ? '#c6f6d5' : '#f7fafc',
                    borderRadius: '8px',
                    border: isComplete ? '1px solid #48bb78' : '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '6px'
                  }}>
                    <span style={{ 
                      fontSize: '13px', 
                      fontWeight: '600', 
                      color: '#2d3748',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {isComplete && '✅'} {goal.title}
                    </span>
                    <span style={{ 
                      fontSize: '11px', 
                      color: isComplete ? '#276749' : '#718096'
                    }}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  
                  {/* Mini Progress Bar */}
                  <div style={{ 
                    height: '4px', 
                    background: '#e2e8f0', 
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginBottom: '4px'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${progress}%`,
                      background: isComplete 
                        ? '#48bb78' 
                        : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '2px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#718096'
                  }}>
                    <span>{getCurrencySymbol(groupCurrency)}{formatAmount(goal.current_amount)}</span>
                    <span>of {getCurrencySymbol(groupCurrency)}{formatAmount(goal.target_amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="card" style={{ padding: '16px', background: '#f7fafc' }}>
        <h4 style={{ 
          fontSize: '11px', 
          fontWeight: '600', 
          color: '#a0aec0', 
          marginBottom: '12px', 
          textTransform: 'uppercase', 
          letterSpacing: '1px' 
        }}>
          📊 Quick Stats
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '13px'
          }}>
            <span style={{ color: '#718096' }}>Activities</span>
            <span style={{ fontWeight: '600', color: '#2d3748' }}>{activities.length}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '13px'
          }}>
            <span style={{ color: '#718096' }}>Milestones</span>
            <span style={{ fontWeight: '600', color: '#2d3748' }}>{subGoals.length}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '13px'
          }}>
            <span style={{ color: '#718096' }}>Completed</span>
            <span style={{ fontWeight: '600', color: '#48bb78' }}>
              {subGoals.filter(g => calculateProgress(g.current_amount, g.target_amount) >= 100).length}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default GroupRightSidebar;
