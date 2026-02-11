import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { useToast } from './Toast';
import { getCurrencySymbol } from '../utils/currencyConverter';
import { getCountryDisplay } from '../utils/countries';

function AnalyticsDashboard({ groupId, groupCurrency }) {
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [activeChart, setActiveChart] = useState('pledges');

  useEffect(() => {
    loadAnalytics();
  }, [groupId, period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getGroupAnalytics(groupId, period);
      setAnalytics(response.data.data);
    } catch (error) {
      showToast('Error loading analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await analyticsAPI.exportData(groupId, 'csv');
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `group-${groupId}-export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Data exported successfully!', 'success');
    } catch (error) {
      showToast('Error exporting data', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: '16px', color: '#718096' }}>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', background: '#f7fafc', borderRadius: '12px' }}>
        <p style={{ color: '#718096' }}>No analytics data available</p>
      </div>
    );
  }

  const currencySymbol = getCurrencySymbol(groupCurrency);

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>📊 Analytics Dashboard</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            className="input" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button onClick={handleExport} className="btn" style={{ background: '#48bb78', color: 'white' }}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white' }}>
          <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Members</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{analytics.stats.memberCount}</p>
        </div>
        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)', borderRadius: '12px', color: 'white' }}>
          <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Active Pledges</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{analytics.stats.activePledges}</p>
        </div>
        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', borderRadius: '12px', color: 'white' }}>
          <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Fulfilled</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{analytics.stats.fulfilledPledges}</p>
        </div>
        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)', borderRadius: '12px', color: 'white' }}>
          <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Comments</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{analytics.stats.totalComments}</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div style={{ padding: '24px', background: '#f7fafc', borderRadius: '12px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748', marginBottom: '16px' }}>Goal Progress</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>Pledged: {currencySymbol}{parseFloat(analytics.stats.pledgedAmount).toLocaleString()}</p>
            <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#38b2ac', width: `${analytics.stats.pledgedProgress}%` }}></div>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#38b2ac', marginTop: '8px' }}>{analytics.stats.pledgedProgress}%</p>
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>Contributed: {currencySymbol}{parseFloat(analytics.stats.contributedAmount).toLocaleString()}</p>
            <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#48bb78', width: `${analytics.stats.contributedProgress}%` }}></div>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#48bb78', marginTop: '8px' }}>{analytics.stats.contributedProgress}%</p>
          </div>
        </div>
      </div>

      {/* Goal Projection */}
      {analytics.projection && (
        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)', borderRadius: '12px', color: 'white', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>🎯 Goal Projection</h3>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>{analytics.projection.message}</p>
          {analytics.projection.daysRemaining && (
            <>
              <p style={{ fontSize: '14px', opacity: 0.9 }}>Average daily contribution: {currencySymbol}{parseFloat(analytics.projection.averageDailyContribution).toFixed(2)}</p>
              <p style={{ fontSize: '14px', opacity: 0.9 }}>Estimated completion: {new Date(analytics.projection.estimatedCompletionDate).toLocaleDateString()}</p>
            </>
          )}
        </div>
      )}

      {/* Chart Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '2px solid #e2e8f0' }}>
        <button 
          onClick={() => setActiveChart('pledges')} 
          style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeChart === 'pledges' ? '3px solid #667eea' : 'none', color: activeChart === 'pledges' ? '#667eea' : '#718096', fontWeight: '600', cursor: 'pointer' }}
        >
          Pledges Trend
        </button>
        <button 
          onClick={() => setActiveChart('contributions')} 
          style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeChart === 'contributions' ? '3px solid #667eea' : 'none', color: activeChart === 'contributions' ? '#667eea' : '#718096', fontWeight: '600', cursor: 'pointer' }}
        >
          Contributions Trend
        </button>
        <button 
          onClick={() => setActiveChart('leaderboard')} 
          style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeChart === 'leaderboard' ? '3px solid #667eea' : 'none', color: activeChart === 'leaderboard' ? '#667eea' : '#718096', fontWeight: '600', cursor: 'pointer' }}
        >
          Leaderboard
        </button>
      </div>

      {/* Chart Display */}
      {activeChart === 'leaderboard' ? (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748', marginBottom: '16px' }}>🏆 Top Contributors</h3>
          {analytics.leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: '#f7fafc', borderRadius: '12px' }}>
              <p style={{ color: '#718096' }}>No contributions yet</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {analytics.leaderboard.map((contributor, index) => (
                <div key={contributor.id} style={{ 
                  padding: '16px', 
                  background: index < 3 ? ['#ffd700', '#c0c0c0', '#cd7f32'][index] + '20' : '#f7fafc', 
                  borderRadius: '12px', 
                  border: index < 3 ? `2px solid ${['#ffd700', '#c0c0c0', '#cd7f32'][index]}` : '2px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    background: index < 3 ? ['#ffd700', '#c0c0c0', '#cd7f32'][index] : '#cbd5e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', color: '#2d3748', fontSize: '16px', marginBottom: '4px' }}>
                      {contributor.first_name} {contributor.last_name}
                    </p>
                    <p style={{ fontSize: '13px', color: '#718096' }}>
                      {contributor.country ? getCountryDisplay(contributor.country) : '🌍 Unknown'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#48bb78' }}>
                      {currencySymbol}{parseFloat(contributor.total_contributed).toLocaleString()}
                    </p>
                    <p style={{ fontSize: '12px', color: '#718096' }}>
                      {contributor.pledge_count} {contributor.pledge_count === 1 ? 'contribution' : 'contributions'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: '24px', background: '#f7fafc', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748', marginBottom: '16px' }}>
            {activeChart === 'pledges' ? '💰 Pledges Over Time' : '💵 Contributions Over Time'}
          </h3>
          {analytics.history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ color: '#718096' }}>No data available for this period</p>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '20px' }}>
              {analytics.history.map((day, index) => {
                const value = activeChart === 'pledges' ? parseFloat(day.pledged || 0) : parseFloat(day.contributed || 0);
                const maxValue = Math.max(...analytics.history.map(d => 
                  activeChart === 'pledges' ? parseFloat(d.pledged || 0) : parseFloat(d.contributed || 0)
                ));
                const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                
                return (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div 
                      style={{ 
                        width: '100%', 
                        height: `${height}%`, 
                        minHeight: value > 0 ? '20px' : '0',
                        background: activeChart === 'pledges' ? 'linear-gradient(180deg, #38b2ac 0%, #319795 100%)' : 'linear-gradient(180deg, #48bb78 0%, #38a169 100%)',
                        borderRadius: '8px 8px 0 0',
                        transition: 'height 0.3s ease',
                        position: 'relative'
                      }}
                      title={`${currencySymbol}${value.toFixed(2)} on ${new Date(day.date).toLocaleDateString()}`}
                    >
                      {value > 0 && (
                        <span style={{ 
                          position: 'absolute', 
                          top: '-20px', 
                          left: '50%', 
                          transform: 'translateX(-50%)', 
                          fontSize: '10px', 
                          fontWeight: 'bold', 
                          color: activeChart === 'pledges' ? '#38b2ac' : '#48bb78',
                          whiteSpace: 'nowrap'
                        }}>
                          {currencySymbol}{value.toFixed(0)}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '10px', color: '#a0aec0', transform: 'rotate(-45deg)', whiteSpace: 'nowrap', marginTop: '8px' }}>
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboard;