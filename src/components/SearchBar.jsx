import { useState } from 'react';
import { searchAPI } from '../services/api';
import { useToast } from './Toast';
import { getCountryDisplay } from '../utils/countries';

function SearchBar({ groupId, onResultClick }) {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (searchQuery) => {
    if (searchQuery.trim().length < 2) {
      setResults(null);
      setShowResults(false);
      return;
    }

    setSearching(true);
    try {
      const response = await searchAPI.searchInGroup(groupId, searchQuery);
      setResults(response.data.data);
      setShowResults(true);
    } catch (error) {
      showToast('Error searching', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const getTotalResults = () => {
    if (!results) return 0;
    return (results.members?.length || 0) + 
           (results.pledges?.length || 0) + 
           (results.comments?.length || 0);
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="input"
          value={query}
          onChange={handleInputChange}
          placeholder="🔍 Search members, pledges, comments..."
          style={{ paddingRight: '40px' }}
        />
        {searching && (
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
          </div>
        )}
      </div>

      {showResults && results && getTotalResults() > 0 && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          right: 0, 
          marginTop: '8px',
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          border: '2px solid #e2e8f0',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          {results.members && results.members.length > 0 && (
            <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#718096', marginBottom: '12px', textTransform: 'uppercase' }}>
                Members ({results.members.length})
              </h4>
              {results.members.map(member => (
                <div 
                  key={member.id} 
                  onClick={() => { onResultClick && onResultClick('member', member); setShowResults(false); setQuery(''); }}
                  style={{ 
                    padding: '12px', 
                    background: '#f7fafc', 
                    borderRadius: '8px', 
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#edf2f7'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f7fafc'}
                >
                  <p style={{ fontWeight: '600', fontSize: '14px', color: '#2d3748', marginBottom: '4px' }}>
                    {member.first_name} {member.last_name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#718096' }}>
                    {member.country ? getCountryDisplay(member.country) : '🌍 Unknown'} • {member.role}
                  </p>
                </div>
              ))}
            </div>
          )}

          {results.pledges && results.pledges.length > 0 && (
            <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#718096', marginBottom: '12px', textTransform: 'uppercase' }}>
                Pledges ({results.pledges.length})
              </h4>
              {results.pledges.map(pledge => (
                <div 
                  key={pledge.id} 
                  onClick={() => { onResultClick && onResultClick('pledge', pledge); setShowResults(false); setQuery(''); }}
                  style={{ 
                    padding: '12px', 
                    background: '#f7fafc', 
                    borderRadius: '8px', 
                    marginBottom: '8px',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#edf2f7'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f7fafc'}
                >
                  <p style={{ fontWeight: '600', fontSize: '14px', color: '#2d3748', marginBottom: '4px' }}>
                    {pledge.first_name} {pledge.last_name} - ${parseFloat(pledge.amount).toFixed(2)}
                  </p>
                  <p style={{ fontSize: '12px', color: '#718096' }}>
                    {pledge.status} • {new Date(pledge.pledge_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {results.comments && results.comments.length > 0 && (
            <div style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#718096', marginBottom: '12px', textTransform: 'uppercase' }}>
                Comments ({results.comments.length})
              </h4>
              {results.comments.map(comment => (
                <div 
                  key={comment.id} 
                  onClick={() => { onResultClick && onResultClick('comment', comment); setShowResults(false); setQuery(''); }}
                  style={{ 
                    padding: '12px', 
                    background: '#f7fafc', 
                    borderRadius: '8px', 
                    marginBottom: '8px',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#edf2f7'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f7fafc'}
                >
                  <p style={{ fontWeight: '600', fontSize: '14px', color: '#2d3748', marginBottom: '4px' }}>
                    {comment.first_name} {comment.last_name}
                  </p>
                  <p style={{ fontSize: '13px', color: '#4a5568', marginBottom: '4px' }}>
                    {comment.comment_text.substring(0, 100)}{comment.comment_text.length > 100 ? '...' : ''}
                  </p>
                  <p style={{ fontSize: '11px', color: '#a0aec0' }}>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showResults && results && getTotalResults() === 0 && query.trim().length >= 2 && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          right: 0, 
          marginTop: '8px',
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          border: '2px solid #e2e8f0',
          padding: '24px',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <p style={{ color: '#718096' }}>No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}

export default SearchBar;