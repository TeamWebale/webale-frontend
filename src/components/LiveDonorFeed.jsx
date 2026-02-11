import { useState, useEffect } from 'react';
import { pledgeAPI } from '../services/api';
import { formatTimeAgo } from '../utils/timeFormatter';
import { getCurrencySymbol } from '../utils/currencyConverter';

function LiveDonorFeed({ groupId, groupCurrency }) {
  const [recentPledges, setRecentPledges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentPledges();
    const interval = setInterval(loadRecentPledges, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [groupId]);

  const loadRecentPledges = async () => {
    try {
      const response = await pledgeAPI.getGroupPledges(groupId);
      const pledges = response.data.data.pledges;
      // Get 5 most recent pledges
      const recent = pledges
        .sort((a, b) => new Date(b.pledge_date) - new Date(a.pledge_date))
        .slice(0, 5);
      setRecentPledges(recent);
    } catch (error) {
      console.error('Error loading recent pledges:', error);
    } finally {
      setLoading(false);
    }
  };

  const currencySymbol = getCurrencySymbol(groupCurrency);

  return (
    <div style={{ 
      position: 'sticky', 
      top: '20px',
      padding: '20px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      borderRadius: '12px', 
      color: 'white',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
      maxHeight: '400px',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>🔴</span>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Live Donor Feed</h3>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', opacity: 0.8 }}>
          <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white', width: '24px', height: '24px', margin: '0 auto' }}></div>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>Loading...</p>
        </div>
      ) : recentPledges.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', opacity: 0.8 }}>
          <p style={{ fontSize: '14px', margin: 0 }}>No recent pledges yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentPledges.map((pledge, index) => (
            <div 
              key={pledge.id} 
              className="fade-in"
              style={{ 
                padding: '12px', 
                background: 'rgba(255, 255, 255, 0.15)', 
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
                animation: `fadeIn 0.5s ease-in ${index * 0.1}s both`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>
                  {pledge.is_anonymous ? '🔒 Anonymous' : `${pledge.first_name} ${pledge.last_name}`}
                </p>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {currencySymbol}{parseFloat(pledge.amount).toFixed(2)}
                </span>
              </div>
              <p style={{ fontSize: '11px', opacity: 0.9, margin: 0 }}>
                {formatTimeAgo(pledge.pledge_date)}
              </p>
              {pledge.status === 'paid' && (
                <span style={{ 
                  display: 'inline-block',
                  marginTop: '4px',
                  padding: '2px 8px', 
                  background: 'rgba(72, 187, 120, 0.3)', 
                  borderRadius: '4px', 
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  ✓ PAID
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '16px', 
        padding: '8px', 
        background: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: '6px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '11px', margin: 0, opacity: 0.9 }}>
          💡 Updates every 30 seconds
        </p>
      </div>
    </div>
  );
}

export default LiveDonorFeed;