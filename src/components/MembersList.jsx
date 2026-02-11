import { useState } from 'react';
import MemberProfileCard from './MemberProfileCard';
import MemberProfileModal from './MemberProfileModal';
import { useLanguage } from '../context/LanguageContext';

function MembersList({
  members = [],
  pledges = [],
  groupId,
  groupName = '',
  groupCurrency = 'USD',
  isAdmin = false,
  currentUserId = null,
  onMemberAction,
  onMessage
}) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'pledged', 'joined'

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Sort members
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (sortBy === 'name') {
      return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
    }
    if (sortBy === 'pledged') {
      const aPledged = pledges.filter(p => p.user_id === a.id).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const bPledged = pledges.filter(p => p.user_id === b.id).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      return bPledged - aPledged;
    }
    if (sortBy === 'joined') {
      return new Date(b.joined_at || 0) - new Date(a.joined_at || 0);
    }
    return 0;
  });

  const handleViewProfile = (member) => {
    setSelectedMember(member);
  };

  const handlePromote = async (member) => {
    if (window.confirm(`Promote ${member.first_name} to admin?`)) {
      onMemberAction?.('promote', member);
      setSelectedMember(null);
    }
  };

  const handleDemote = async (member) => {
    if (window.confirm(`Demote ${member.first_name} from admin?`)) {
      onMemberAction?.('demote', member);
      setSelectedMember(null);
    }
  };

  const handleRemove = async (member) => {
    if (window.confirm(`Remove ${member.first_name} from the group? This cannot be undone.`)) {
      onMemberAction?.('remove', member);
      setSelectedMember(null);
    }
  };

  const handleMessage = (member) => {
    onMessage?.(member);
    setSelectedMember(null);
  };

  const adminCount = members.filter(m => m.role === 'admin').length;
  const memberCount = members.filter(m => m.role === 'member').length;

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>
            👥 {t('group_members')} ({members.length})
          </h3>
          <p style={{ fontSize: '13px', color: '#718096', margin: '4px 0 0' }}>
            {adminCount} admin{adminCount !== 1 ? 's' : ''} • {memberCount} member{memberCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', borderRadius: '8px', padding: '4px' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '6px',
              background: viewMode === 'grid' ? 'white' : 'transparent',
              color: viewMode === 'grid' ? '#667eea' : '#718096',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            ▦ Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '6px',
              background: viewMode === 'list' ? 'white' : 'transparent',
              color: viewMode === 'list' ? '#667eea' : '#718096',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            ☰ List
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="🔍 Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ padding: '10px 14px', fontSize: '14px' }}
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input"
          style={{ width: 'auto', padding: '10px 14px', fontSize: '14px' }}
        >
          <option value="all">All Roles</option>
          <option value="admin">🛡️ Admins</option>
          <option value="member">👤 Members</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input"
          style={{ width: 'auto', padding: '10px 14px', fontSize: '14px' }}
        >
          <option value="name">Sort: Name</option>
          <option value="pledged">Sort: Most Pledged</option>
          <option value="joined">Sort: Recently Joined</option>
        </select>
      </div>

      {/* Members Display */}
      {sortedMembers.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          background: '#f7fafc', 
          borderRadius: '12px',
          color: '#a0aec0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
          <p style={{ fontSize: '16px', margin: 0 }}>
            {searchQuery || roleFilter !== 'all' ? 'No members match your filters' : 'No members yet'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
          gap: '16px' 
        }}>
          {sortedMembers.map(member => (
            <MemberProfileCard
              key={member.id || member.user_id}
              member={member}
              pledges={pledges}
              groupCurrency={groupCurrency}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              onViewProfile={handleViewProfile}
              onMessage={onMessage ? handleMessage : null}
              onPromote={isAdmin ? handlePromote : null}
              onDemote={isAdmin ? handleDemote : null}
              onRemove={isAdmin ? handleRemove : null}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sortedMembers.map(member => (
            <MemberProfileCard
              key={member.id || member.user_id}
              member={member}
              pledges={pledges}
              groupCurrency={groupCurrency}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              onViewProfile={handleViewProfile}
              compact
            />
          ))}
        </div>
      )}

      {/* Member Profile Modal */}
      {selectedMember && (
        <MemberProfileModal
          member={selectedMember}
          pledges={pledges}
          groupCurrency={groupCurrency}
          groupName={groupName}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onClose={() => setSelectedMember(null)}
          onMessage={onMessage ? handleMessage : null}
          onPromote={isAdmin ? handlePromote : null}
          onDemote={isAdmin ? handleDemote : null}
          onRemove={isAdmin ? handleRemove : null}
        />
      )}

      {/* Mobile-responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(auto-fill, minmax(220px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default MembersList;
