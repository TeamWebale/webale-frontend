import { useState, useEffect } from 'react';
import { noticesAPI } from '../services/api';
import { useToast } from './Toast';
import { formatTimeAgo } from '../utils/timeFormatter';
import { getCountryDisplay } from '../utils/countries';

function NoticeBoard({ groupId, isAdmin }) {
  const { showToast } = useToast();
  const [notices, setNotices] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedNotice, setExpandedNotice] = useState(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    loadNotices();
  }, [groupId]);

  const loadNotices = async () => {
    try {
      const response = await noticesAPI.getGroupNotices(groupId);
      setNotices(response.data.data.notices);
    } catch (error) {
      console.error('Error loading notices:', error);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      await noticesAPI.create(groupId, noticeTitle, noticeContent, isPinned);
      showToast('Notice posted successfully!', 'success');
      setShowCreateModal(false);
      setNoticeTitle('');
      setNoticeContent('');
      setIsPinned(false);
      loadNotices();
    } catch (error) {
      showToast('Error creating notice', 'error');
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!confirm('Delete this notice?')) return;
    try {
      await noticesAPI.delete(noticeId);
      showToast('Notice deleted', 'success');
      loadNotices();
    } catch (error) {
      showToast('Error deleting notice', 'error');
    }
  };

  const handleViewResponses = async (noticeId) => {
    if (expandedNotice === noticeId) {
      setExpandedNotice(null);
      return;
    }
    try {
      const response = await noticesAPI.getResponses(noticeId);
      setResponses(response.data.data.responses);
      setExpandedNotice(noticeId);
    } catch (error) {
      showToast('Error loading responses', 'error');
    }
  };

  const handleRespond = async (noticeId) => {
    if (!responseText.trim()) return;
    try {
      await noticesAPI.respond(noticeId, responseText);
      showToast('Response added!', 'success');
      setResponseText('');
      handleViewResponses(noticeId);
    } catch (error) {
      showToast('Error adding response', 'error');
    }
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2d3748' }}>📢 Notice Board</h2>
        {isAdmin && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            + Post Notice
          </button>
        )}
      </div>

      {notices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#f7fafc', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📢</div>
          <p style={{ color: '#718096' }}>No notices yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {notices.map(notice => (
            <div
              key={notice.id}
              style={{
                padding: '20px',
                background: notice.is_pinned ? '#fffbeb' : '#ffffff',
                borderRadius: '12px',
                border: notice.is_pinned ? '2px solid #f6ad55' : '2px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  {notice.is_pinned && (
                    <span style={{ 
                      display: 'inline-block',
                      padding: '4px 12px', 
                      background: '#f6ad55', 
                      color: 'white', 
                      borderRadius: '6px', 
                      fontSize: '11px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      📌 PINNED
                    </span>
                  )}
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>
                    {notice.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '12px', lineHeight: '1.6' }}>
                    {notice.content}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#718096' }}>
                    <span>By {notice.first_name} {notice.last_name}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(notice.created_at)}</span>
                    <span>•</span>
                    <span>{notice.response_count} {notice.response_count === 1 ? 'response' : 'responses'}</span>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteNotice(notice.id)}
                    style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '18px' }}
                  >
                    🗑️
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={() => handleViewResponses(notice.id)}
                  className="btn"
                  style={{ background: '#667eea', color: 'white', fontSize: '13px', padding: '6px 16px' }}
                >
                  {expandedNotice === notice.id ? '▲ Hide Responses' : '▼ View Responses'}
                </button>
              </div>

              {expandedNotice === notice.id && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #e2e8f0' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <textarea
                      className="input"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Write a response..."
                      rows="2"
                      style={{ marginBottom: '8px' }}
                    />
                    <button
                      onClick={() => handleRespond(notice.id)}
                      className="btn btn-primary"
                      disabled={!responseText.trim()}
                    >
                      Post Response
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    {responses.map(resp => (
                      <div key={resp.id} style={{ padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#2d3748', marginBottom: '4px' }}>
                          {resp.first_name} {resp.last_name}
                        </p>
                        <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '4px' }}>
                          {resp.response_text}
                        </p>
                        <p style={{ fontSize: '11px', color: '#a0aec0' }}>
                          {formatTimeAgo(resp.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Notice Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1004 }} onClick={() => setShowCreateModal(false)}>
          <div className="card" style={{ maxWidth: '600px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#2d3748' }}>📢 Post Notice</h2>
            <form onSubmit={handleCreateNotice}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="input"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea
                  className="input"
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  rows="5"
                  required
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>📌 Pin this notice to top</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Post Notice</button>
                <button type="button" className="btn" style={{ flex: 1, background: '#e2e8f0', color: '#2d3748' }} onClick={() => setShowCreateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoticeBoard;