import { useState } from 'react';
import { pledgeAPI } from '../services/api';

function BulkActions({ 
  pledges, 
  selectedIds, 
  onSelectionChange, 
  onActionComplete,
  groupId,
  isAdmin = false 
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [processing, setProcessing] = useState(false);

  const selectedPledges = pledges.filter(p => selectedIds.includes(p.id));
  const allSelected = pledges.length > 0 && selectedIds.length === pledges.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < pledges.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(pledges.map(p => p.id));
    }
  };

  const handleSelectOne = (pledgeId) => {
    if (selectedIds.includes(pledgeId)) {
      onSelectionChange(selectedIds.filter(id => id !== pledgeId));
    } else {
      onSelectionChange([...selectedIds, pledgeId]);
    }
  };

  const confirmAction = (action) => {
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    if (!pendingAction || selectedIds.length === 0) return;
    
    setProcessing(true);
    
    try {
      let successCount = 0;
      let failCount = 0;

      for (const pledgeId of selectedIds) {
        try {
          switch (pendingAction) {
            case 'mark_paid':
              await pledgeAPI.markAsPaid(groupId, pledgeId);
              break;
            case 'mark_pending':
              await pledgeAPI.update(groupId, pledgeId, { status: 'pending' });
              break;
            case 'send_reminder':
              await pledgeAPI.sendReminder(groupId, pledgeId);
              break;
            case 'delete':
              await pledgeAPI.delete(groupId, pledgeId);
              break;
            default:
              break;
          }
          successCount++;
        } catch (error) {
          console.error(`Failed to process pledge ${pledgeId}:`, error);
          failCount++;
        }
      }

      // Show result
      if (failCount === 0) {
        alert(`✅ Successfully processed ${successCount} pledge(s)`);
      } else {
        alert(`⚠️ Processed ${successCount} pledge(s), ${failCount} failed`);
      }

      // Reset and refresh
      onSelectionChange([]);
      onActionComplete();
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('An error occurred while processing');
    } finally {
      setProcessing(false);
      setShowConfirmModal(false);
      setPendingAction(null);
    }
  };

  const getActionDetails = (action) => {
    switch (action) {
      case 'mark_paid':
        return {
          title: 'Mark as Paid',
          message: `Are you sure you want to mark ${selectedIds.length} pledge(s) as fully paid?`,
          icon: '✅',
          color: '#48bb78'
        };
      case 'mark_pending':
        return {
          title: 'Mark as Pending',
          message: `Are you sure you want to reset ${selectedIds.length} pledge(s) to pending status?`,
          icon: '⏳',
          color: '#ed8936'
        };
      case 'send_reminder':
        return {
          title: 'Send Reminders',
          message: `Send payment reminder emails to ${selectedIds.length} pledge holder(s)?`,
          icon: '📧',
          color: '#4299e1'
        };
      case 'delete':
        return {
          title: 'Delete Pledges',
          message: `Are you sure you want to permanently delete ${selectedIds.length} pledge(s)? This cannot be undone.`,
          icon: '🗑️',
          color: '#e53e3e'
        };
      default:
        return { title: '', message: '', icon: '', color: '' };
    }
  };

  const totalSelected = selectedPledges.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  if (!isAdmin) return null;

  return (
    <>
      {/* Selection Info Bar */}
      {selectedIds.length > 0 && (
        <div style={{
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontWeight: '600' }}>
              ✓ {selectedIds.length} pledge(s) selected
            </span>
            <span style={{ opacity: 0.8, fontSize: '14px' }}>
              Total: ${totalSelected.toFixed(2)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => confirmAction('mark_paid')}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ✅ Mark Paid
            </button>
            <button
              onClick={() => confirmAction('mark_pending')}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ⏳ Mark Pending
            </button>
            <button
              onClick={() => confirmAction('send_reminder')}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📧 Send Reminder
            </button>
            <button
              onClick={() => confirmAction('delete')}
              style={{
                padding: '8px 16px',
                background: 'rgba(229, 62, 62, 0.8)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🗑️ Delete
            </button>
            <button
              onClick={() => onSelectionChange([])}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              ✕ Clear
            </button>
          </div>
        </div>
      )}

      {/* Checkbox Component for list items */}
      <style>{`
        .bulk-checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #667eea;
        }
        .bulk-checkbox-header {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #667eea;
        }
      `}</style>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          style={{
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
          }}
          onClick={() => !processing && setShowConfirmModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '420px', width: '90%', textAlign: 'center' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: getActionDetails(pendingAction).color + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '28px'
            }}>
              {getActionDetails(pendingAction).icon}
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
              {getActionDetails(pendingAction).title}
            </h3>
            
            <p style={{ color: '#718096', marginBottom: '24px' }}>
              {getActionDetails(pendingAction).message}
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={processing}
                className="btn"
                style={{ flex: 1, background: '#e2e8f0', color: '#4a5568' }}
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                disabled={processing}
                className="btn"
                style={{ 
                  flex: 1, 
                  background: getActionDetails(pendingAction).color,
                  color: 'white'
                }}
              >
                {processing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Export checkbox utilities
export const SelectAllCheckbox = ({ allSelected, someSelected, onToggle }) => (
  <input
    type="checkbox"
    className="bulk-checkbox-header"
    checked={allSelected}
    ref={input => {
      if (input) input.indeterminate = someSelected;
    }}
    onChange={onToggle}
    title="Select All"
  />
);

export const SelectOneCheckbox = ({ checked, onChange }) => (
  <input
    type="checkbox"
    className="bulk-checkbox"
    checked={checked}
    onChange={onChange}
  />
);

export default BulkActions;
