import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useToast } from './Toast';
import { getCountryDisplay } from '../utils/countries';
import { formatTimeAgo } from '../utils/timeFormatter';

function AdminPanel({ groupId, members, onMemberUpdate, currentUserId, primaryAdminId }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('members');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [transferTargetId, setTransferTargetId] = useState('');
  const [confirmTransfer, setConfirmTransfer] = useState('');

  const isPrimaryAdmin = currentUserId === primaryAdminId;

  useEffect(() => {
    if (activeTab === 'blocked') {
      loadBlockedUsers();
    } else if (activeTab === 'logs') {
      loadAdminLogs();
    }
  }, [activeTab, groupId]);

  const loadBlockedUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getBlockedUsers(groupId);
      setBlockedUsers(response.data.data.blockedUsers || []);
    } catch (error) {
      console.error('Error loading blocked users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminLogs = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAdminLogs(groupId);
      setAdminLogs(response.data.data.logs || []);
    } catch (error) {
      console.error('Error loading admin logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    if (!confirm('Promote this member to Admin? They will have full admin privileges.')) return;
    
    try {
      await adminAPI.promoteToAdmin(groupId, userId);
      showToast('Member promoted to Admin!', 'success');
      onMemberUpdate();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to promote member', 'error');
    }
  };

  const handleDemoteToMember = async (userId) => {
    if (!confirm('Remove admin privileges from this user?')) return;
    
    try {
      await adminAPI.demoteToMember(groupId, userId);
      showToast('Admin demoted to Member', 'success');
      onMemberUpdate();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to demote admin', 'error');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the group? They can rejoin via invitation.')) return;
    
    try {
      await adminAPI.removeMember(groupId, userId);
      showToast('Member removed from group', 'success');
      onMemberUpdate();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to remove member', 'error');
    }
  };

  const openBlockModal = (user) => {
    setSelectedUser(user);
    setBlockReason('');
    setShowBlockModal(true);
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    
    try {
      await adminAPI.blockUser(groupId, selectedUser.id, blockReason);
      showToast('User blocked and removed from group', 'success');
      setShowBlockModal(false);
      setSelectedUser(null);
      setBlockReason('');
      onMemberUpdate();
      loadBlockedUsers();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to block user', 'error');
    }
  };

  const handleUnblockUser = async (userId) => {
    if (!confirm('Unblock this user? They will be able to rejoin via invitation.')) return;
    
    try {
      await adminAPI.unblockUser(groupId, userId);
      showToast('User unblocked', 'success');
      loadBlockedUsers();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to unblock user', 'error');
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferTargetId) {
      showToast('Please select a member', 'error');
      return;
    }
    
    if (confirmTransfer !== 'TRANSFER') {
      showToast('Please type TRANSFER to confirm', 'error');
      return;
    }
    
    try {
      await adminAPI.transferOwnership(groupId, transferTargetId);
      showToast('Group ownership transferred successfully!', 'success');
      setShowTransferModal(false);
      setTransferTargetId('');
      setConfirmTransfer('');
      onMemberUpdate();
      // Refresh page to reflect new ownership
      window.location.reload();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to transfer ownership', 'error');
    }
  };

  const getActionIcon = (actionType) => {
    const icons = {
      'promote_admin': '⬆️',
      'demote_admin': '⬇️',
      'remove_member': '🚪',
      'block_user': '🚫',
      'unblock_user': '✅',
      'transfer_ownership': '👑',
      'update_group': '✏️',
      'delete_pledge': '🗑️',
      'manual_contribution': '💵'
    };
    return icons[actionType] || '📋';
  };

  const getActionDescription = (log) => {
    const targetName = log.target_first_name 
      ? `${log.target_first_name} ${log.target_last_name}`
      : 'Unknown User';
    
    switch (log.action_type) {
      case 'promote_admin':
        return `Promoted ${targetName} to Admin`;
      case 'demote_admin':
        return `Demoted ${targetName} to Member`;
      case 'remove_member':
        return `Removed ${targetName} from group`;
      case 'block_user':
        return `Blocked ${targetName}${log.details?.reason ? `: "${log.details.reason}"` : ''}`;
      case 'unblock_user':
        return `Unblocked ${targetName}`;
      case 'transfer_ownership':
        return `Transferred ownership to ${targetName}`;
      case 'update_group':
        return `Updated group settings`;
      case 'manual_contribution':
        return `Recorded contribution for ${targetName}`;
      default:
        return log.action_type.replace(/_/g, ' ');
    }
  };

  const admins = members.filter(m => m.role === 'admin');
  const regularMembers = members.filter(m => m.role !== 'admin');

  return (
    <div>
      {/* Admin Panel Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '16px',
        background: 'linear-gradient(135deg, #9f7aea 0%, #667eea 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>🛡️ Admin Panel</h2>
          <p style={{ fontSize: '14px', opacity: 0.9, margin: '4px 0 0' }}>Manage members, permissions, and settings</p>
        </div>
        {isPrimaryAdmin && (
          <button
            onClick={() => setShowTransferModal(true)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            👑 Transfer Ownership
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0' }}>
        {[
          { id: 'members', label: '👥 Members', count: members.length },
          { id: 'blocked', label: '🚫 Blocked', count: blockedUsers.length },
          { id: 'logs', label: '📋 Activity Log' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #9f7aea' : 'none',
              color: activeTab === tab.id ? '#9f7aea' : '#718096',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {tab.label} {tab.count !== undefined && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div>
          {/* Admins Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '12px' }}>
              👑 Admins ({admins.length})
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {admins.map(admin => (
                <div key={admin.id} style={{
                  padding: '16px',
                  background: admin.id === primaryAdminId ? '#faf5ff' : '#f7fafc',
                  borderRadius: '8px',
                  border: admin.id === primaryAdminId ? '2px solid #9f7aea' : '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #9f7aea 0%, #667eea 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      {admin.first_name?.charAt(0)}{admin.last_name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '600', color: '#2d3748' }}>
                          {admin.first_name} {admin.last_name}
                        </span>
                        {admin.id === primaryAdminId && (
                          <span style={{ 
                            fontSize: '10px', 
                            padding: '2px 8px', 
                            background: '#9f7aea', 
                            color: 'white', 
                            borderRadius: '10px' 
                          }}>
                            OWNER
                          </span>
                        )}
                        {admin.id === currentUserId && (
                          <span style={{ 
                            fontSize: '10px', 
                            padding: '2px 8px', 
                            background: '#667eea', 
                            color: 'white', 
                            borderRadius: '10px' 
                          }}>
                            YOU
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '13px', color: '#718096' }}>
                        {admin.country ? getCountryDisplay(admin.country) : admin.email}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions - Can't modify yourself or the primary admin (unless you're primary) */}
                  {admin.id !== currentUserId && (isPrimaryAdmin || admin.id !== primaryAdminId) && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isPrimaryAdmin && admin.id !== primaryAdminId && (
                        <button
                          onClick={() => handleDemoteToMember(admin.id)}
                          style={{
                            background: '#ed8936',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          ⬇️ Demote
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Members Section */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '12px' }}>
              👥 Members ({regularMembers.length})
            </h3>
            {regularMembers.length === 0 ? (
              <p style={{ color: '#718096', textAlign: 'center', padding: '20px' }}>No regular members yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '8px' }}>
                {regularMembers.map(member => (
                  <div key={member.id} style={{
                    padding: '16px',
                    background: '#f7fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#cbd5e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#4a5568',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                      </div>
                      <div>
                        <span style={{ fontWeight: '600', color: '#2d3748' }}>
                          {member.first_name} {member.last_name}
                        </span>
                        <br />
                        <span style={{ fontSize: '13px', color: '#718096' }}>
                          {member.country ? getCountryDisplay(member.country) : member.email}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handlePromoteToAdmin(member.id)}
                        style={{
                          background: '#48bb78',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        ⬆️ Promote
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        style={{
                          background: '#e53e3e',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        🚪 Remove
                      </button>
                      <button
                        onClick={() => openBlockModal(member)}
                        style={{
                          background: '#2d3748',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        🚫 Block
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blocked Users Tab */}
      {activeTab === 'blocked' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner"></div>
            </div>
          ) : blockedUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f7fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <p style={{ color: '#718096' }}>No blocked users</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {blockedUsers.map(blocked => (
                <div key={blocked.id} style={{
                  padding: '16px',
                  background: '#fff5f5',
                  borderRadius: '8px',
                  border: '1px solid #fed7d7',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#2d3748' }}>
                        {blocked.first_name} {blocked.last_name}
                      </span>
                      <span style={{ fontSize: '10px', padding: '2px 8px', background: '#e53e3e', color: 'white', borderRadius: '10px' }}>
                        BLOCKED
                      </span>
                    </div>
                    {blocked.reason && (
                      <p style={{ fontSize: '13px', color: '#718096', margin: '4px 0 0' }}>
                        Reason: {blocked.reason}
                      </p>
                    )}
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: '4px 0 0' }}>
                      Blocked {formatTimeAgo(blocked.created_at)} by {blocked.blocked_by_name}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleUnblockUser(blocked.user_id)}
                    style={{
                      background: '#48bb78',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    ✅ Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Logs Tab */}
      {activeTab === 'logs' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner"></div>
            </div>
          ) : adminLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f7fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <p style={{ color: '#718096' }}>No admin activity yet</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {adminLogs.map(log => (
                <div key={log.id} style={{
                  padding: '12px 16px',
                  background: '#f7fafc',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '20px' }}>{getActionIcon(log.action_type)}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: '#2d3748' }}>
                      <strong>{log.admin_first_name} {log.admin_last_name}</strong>
                      {' '}{getActionDescription(log)}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#a0aec0' }}>
                      {formatTimeAgo(log.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Block User Modal */}
      {showBlockModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowBlockModal(false)}>
          <div className="card" style={{ maxWidth: '450px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#e53e3e', marginBottom: '16px' }}>
              🚫 Block User
            </h2>
            <p style={{ color: '#4a5568', marginBottom: '16px' }}>
              Are you sure you want to block <strong>{selectedUser.first_name} {selectedUser.last_name}</strong>?
              They will be removed from the group and cannot rejoin.
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4a5568' }}>
                Reason (Optional)
              </label>
              <textarea
                className="input"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Why are you blocking this user?"
                rows="3"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleBlockUser}
                style={{
                  flex: 1,
                  background: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🚫 Block User
              </button>
              <button
                onClick={() => setShowBlockModal(false)}
                className="btn"
                style={{ flex: 1, background: '#e2e8f0' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {showTransferModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowTransferModal(false)}>
          <div className="card" style={{ maxWidth: '450px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#9f7aea', marginBottom: '16px' }}>
              👑 Transfer Group Ownership
            </h2>
            
            <div style={{ padding: '16px', background: '#fff5f5', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fed7d7' }}>
              <p style={{ color: '#c53030', margin: 0, fontSize: '14px' }}>
                ⚠️ <strong>Warning:</strong> This action cannot be undone. The new owner will have full control over this group.
              </p>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4a5568' }}>
                Transfer to <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <select
                className="input"
                value={transferTargetId}
                onChange={(e) => setTransferTargetId(e.target.value)}
              >
                <option value="">Select a member...</option>
                {members.filter(m => m.id !== currentUserId).map(m => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4a5568' }}>
                Type "TRANSFER" to confirm <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <input
                type="text"
                className="input"
                value={confirmTransfer}
                onChange={(e) => setConfirmTransfer(e.target.value)}
                placeholder="TRANSFER"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleTransferOwnership}
                disabled={!transferTargetId || confirmTransfer !== 'TRANSFER'}
                style={{
                  flex: 1,
                  background: confirmTransfer === 'TRANSFER' && transferTargetId ? '#9f7aea' : '#cbd5e0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: '600',
                  cursor: confirmTransfer === 'TRANSFER' && transferTargetId ? 'pointer' : 'not-allowed'
                }}
              >
                👑 Transfer Ownership
              </button>
              <button
                onClick={() => { setShowTransferModal(false); setConfirmTransfer(''); setTransferTargetId(''); }}
                className="btn"
                style={{ flex: 1, background: '#e2e8f0' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
