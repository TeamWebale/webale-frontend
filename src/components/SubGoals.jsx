import { useState, useEffect } from 'react';
import { subGoalsAPI } from '../services/api';
import { useToast } from './Toast';
import { getCurrencySymbol } from '../utils/currencyConverter';

function SubGoals({ groupId, groupCurrency, isAdmin, onUpdate }) {
  const { showToast } = useToast();
  const [subGoals, setSubGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadSubGoals();
  }, [groupId]);

  const loadSubGoals = async () => {
    try {
      const response = await subGoalsAPI.getGroupSubGoals(groupId);
      setSubGoals(response.data.data.subGoals);
    } catch (error) {
      console.error('Error loading sub-goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount || parseFloat(newAmount) <= 0) {
      showToast('Please enter valid title and amount', 'error');
      return;
    }

    setCreating(true);
    try {
      await subGoalsAPI.create(groupId, newTitle, parseFloat(newAmount), subGoals.length);
      showToast('Sub-goal created!', 'success');
      setShowCreateModal(false);
      setNewTitle('');
      setNewAmount('');
      loadSubGoals();
      onUpdate && onUpdate();
    } catch (error) {
      showToast('Error creating sub-goal', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (subGoalId) => {
    if (!confirm('Delete this sub-goal?')) return;
    
    try {
      await subGoalsAPI.delete(subGoalId);
      showToast('Sub-goal deleted', 'success');
      loadSubGoals();
      onUpdate && onUpdate();
    } catch (error) {
      showToast('Error deleting sub-goal', 'error');
    }
  };

  const handleToggleComplete = async (subGoal) => {
    try {
      await subGoalsAPI.update(subGoal.id, { isCompleted: !subGoal.is_completed });
      loadSubGoals();
      onUpdate && onUpdate();
    } catch (error) {
      showToast('Error updating sub-goal', 'error');
    }
  };

  const currencySymbol = getCurrencySymbol(groupCurrency);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div className="spinner" style={{ margin: '0 auto' }}></div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748' }}>🎯 Sub-Goals & Milestones</h3>
        {isAdmin && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ fontSize: '14px', padding: '6px 16px' }}>
            + Add Sub-Goal
          </button>
        )}
      </div>

      {subGoals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#f7fafc', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <p style={{ color: '#718096', marginBottom: '16px' }}>No sub-goals yet</p>
          {isAdmin && (
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              Create First Sub-Goal
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {subGoals.map((subGoal, index) => {
            const progress = Math.min((parseFloat(subGoal.current_amount) / parseFloat(subGoal.amount)) * 100, 100);
            
            return (
              <div 
                key={subGoal.id} 
                style={{ 
                  padding: '20px', 
                  background: subGoal.is_completed ? '#c6f6d5' : '#ffffff',
                  borderRadius: '12px', 
                  border: subGoal.is_completed ? '2px solid #48bb78' : '2px solid #e2e8f0',
                  opacity: subGoal.is_completed ? 0.8 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: subGoal.is_completed ? '#48bb78' : '#667eea',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {subGoal.is_completed ? '✓' : index + 1}
                      </div>
                      <h4 style={{ 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        color: '#2d3748',
                        margin: 0,
                        textDecoration: subGoal.is_completed ? 'line-through' : 'none'
                      }}>
                        {subGoal.title}
                      </h4>
                    </div>
                    <p style={{ fontSize: '14px', color: '#718096', marginBottom: '12px' }}>
                      Target: {currencySymbol}{parseFloat(subGoal.amount).toLocaleString()}
                    </p>
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          background: subGoal.is_completed ? '#48bb78' : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                          width: `${progress}%`,
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <p style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
                        {currencySymbol}{parseFloat(subGoal.current_amount).toLocaleString()} / {currencySymbol}{parseFloat(subGoal.amount).toLocaleString()} ({progress.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                      <button
                        onClick={() => handleToggleComplete(subGoal)}
                        className="btn"
                        style={{ 
                          background: subGoal.is_completed ? '#ecc94b' : '#48bb78', 
                          color: 'white', 
                          fontSize: '12px', 
                          padding: '6px 12px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {subGoal.is_completed ? '↩️ Reopen' : '✓ Complete'}
                      </button>
                      <button
                        onClick={() => handleDelete(subGoal.id)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#e53e3e', 
                          cursor: 'pointer', 
                          fontSize: '18px',
                          padding: '4px 8px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Sub-Goal Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1004 }} onClick={() => setShowCreateModal(false)}>
          <div className="card" style={{ maxWidth: '500px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#2d3748' }}>🎯 Create Sub-Goal</h2>
            <p style={{ color: '#718096', marginBottom: '24px', fontSize: '14px' }}>
              Break down your main goal into smaller, achievable milestones
            </p>
            
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Equipment Purchase, First Milestone"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Amount ({currencySymbol}) *</label>
                <input
                  type="number"
                  className="input"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="500.00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div style={{ padding: '12px', background: '#e6fffa', border: '1px solid #81e6d9', borderRadius: '8px', marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', color: '#234e52', margin: 0 }}>
                  💡 <strong>Tip:</strong> Sub-goals help track progress and motivate contributors by showing incremental achievements!
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Sub-Goal'}
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ flex: 1, background: '#e2e8f0', color: '#2d3748' }}
                  onClick={() => { setShowCreateModal(false); setNewTitle(''); setNewAmount(''); }}
                  disabled={creating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubGoals;