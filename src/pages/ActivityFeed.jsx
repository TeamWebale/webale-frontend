import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { activityAPI } from '../services/api';
import { formatTimeAgo } from '../utils/timeFormatter';
import { PageLoader } from '../components/LoadingStates';

function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' or specific type

  const activityTypes = [
    { key: 'all', label: 'All Activities', icon: '📋', color: '#667eea' },
    { key: 'group_created', label: 'Groups Created', icon: '✨', color: '#9f7aea' },
    { key: 'member_joined', label: 'Members Joined', icon: '👥', color: '#667eea' },
    { key: 'pledge_made', label: 'Pledges Made', icon: '💰', color: '#38b2ac' },
    { key: 'contribution_made', label: 'Contributions', icon: '💵', color: '#48bb78' },
    { key: 'comment_posted', label: 'Comments', icon: '💬', color: '#ed8936' },
    { key: 'invitation_sent', label: 'Invitations', icon: '✉️', color: '#f56565' },
    { key: 'milestone_reached', label: 'Milestones', icon: '🎯', color: '#ecc94b' },
  ];

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    // Filter activities when activeFilter changes
    if (activeFilter === 'all') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(a => a.activity_type === activeFilter));
    }
  }, [activeFilter, activities]);

  const loadActivities = async () => {
    try {
      const response = await activityAPI.getAll(100);
      setActivities(response.data.data.activities);
      setFilteredActivities(response.data.data.activities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClick = (filterKey) => {
    // If clicking the same filter, toggle back to 'all'
    // Otherwise, set the new exclusive filter
    if (activeFilter === filterKey) {
      setActiveFilter('all');
    } else {
      setActiveFilter(filterKey);
    }
  };

  const getActivityIcon = (type) => {
    const found = activityTypes.find(t => t.key === type);
    return found ? found.icon : '📊';
  };

  const getActivityColor = (type) => {
    const found = activityTypes.find(t => t.key === type);
    return found ? found.color : '#718096';
  };

  const getActivityMessage = (activity) => {
    const data = activity.activity_data || {};
    const userName = activity.first_name 
      ? `${activity.first_name} ${activity.last_name}`
      : 'Someone';

    switch (activity.activity_type) {
      case 'group_created':
        return <><strong>{userName}</strong> created a new group <strong>{data.groupName || 'a group'}</strong></>;
      case 'member_joined':
        return <><strong>{userName}</strong> joined <strong>{activity.group_name || 'a group'}</strong></>;
      case 'pledge_made':
        return <><strong>{data.isAnonymous ? 'Anonymous' : userName}</strong> pledged <strong>${parseFloat(data.amount || 0).toFixed(2)}</strong></>;
      case 'contribution_made':
      case 'manual_contribution':
        return <><strong>{data.isAnonymous ? 'Anonymous' : userName}</strong> contributed <strong>${parseFloat(data.amount || 0).toFixed(2)}</strong></>;
      case 'comment_posted':
        return <><strong>{userName}</strong> posted a comment</>;
      case 'invitation_sent':
        return <><strong>{userName}</strong> sent {data.count || 1} invitation{data.count !== 1 ? 's' : ''}</>;
      case 'milestone_reached':
        return <>🎉 <strong>{activity.group_name || 'A group'}</strong> reached <strong>{data.milestone}%</strong> {data.type === 'pledged' ? 'pledged' : 'contributed'}!</>;
      case 'pledge_cancelled':
        return <><strong>{userName}</strong> cancelled their pledge</>;
      default:
        return <><strong>{userName}</strong> performed an action</>;
    }
  };

  if (loading) {
    return <PageLoader message="Loading activity feed" />;
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>
        📈 Activity Feed
      </h1>
      <p style={{ color: '#718096', marginBottom: '24px' }}>
        See what's happening across your groups
      </p>

      {/* Filter Buttons */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '10px', 
        marginBottom: '24px',
        padding: '16px',
        background: '#f7fafc',
        borderRadius: '12px'
      }}>
        {activityTypes.map((type) => {
          const isActive = activeFilter === type.key;
          const count = type.key === 'all' 
            ? activities.length 
            : activities.filter(a => a.activity_type === type.key).length;
          
          return (
            <button
              key={type.key}
              onClick={() => handleFilterClick(type.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                background: isActive 
                  ? `linear-gradient(135deg, ${type.color} 0%, ${type.color}dd 100%)`
                  : 'white',
                color: isActive ? 'white' : '#4a5568',
                boxShadow: isActive 
                  ? `0 4px 12px ${type.color}40`
                  : '0 2px 4px rgba(0,0,0,0.05)',
                transform: isActive ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Indicator */}
      {activeFilter !== 'all' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: '#e6fffa',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <span style={{ color: '#234e52' }}>
            Showing only: <strong>{activityTypes.find(t => t.key === activeFilter)?.label}</strong>
          </span>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              background: '#38b2ac',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ✕ Clear Filter
          </button>
        </div>
      )}

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>📭</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', marginBottom: '12px' }}>
            {activeFilter === 'all' ? 'No Activities Yet' : 'No Activities Found'}
          </h2>
          <p style={{ color: '#718096', marginBottom: '24px' }}>
            {activeFilter === 'all' 
              ? 'Activities will appear here as you and your group members interact.'
              : `No "${activityTypes.find(t => t.key === activeFilter)?.label}" activities found.`
            }
          </p>
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="btn btn-primary"
            >
              Show All Activities
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="card"
              style={{ 
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              {/* Icon */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${getActivityColor(activity.activity_type)}20 0%, ${getActivityColor(activity.activity_type)}40 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0
              }}>
                {getActivityIcon(activity.activity_type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#2d3748', fontSize: '15px', marginBottom: '4px' }}>
                  {getActivityMessage(activity)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#a0aec0' }}>
                    {formatTimeAgo(activity.created_at)}
                  </span>
                  {activity.group_name && (
                    <Link 
                      to={`/groups/${activity.group_id}`}
                      style={{ 
                        fontSize: '13px', 
                        color: '#667eea', 
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      📁 {activity.group_name}
                    </Link>
                  )}
                </div>
              </div>

              {/* Activity Type Badge */}
              <div style={{
                padding: '4px 12px',
                borderRadius: '12px',
                background: `${getActivityColor(activity.activity_type)}20`,
                color: getActivityColor(activity.activity_type),
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap'
              }}>
                {activity.activity_type.replace(/_/g, ' ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;
