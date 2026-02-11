import { useState, useEffect } from 'react';
import { groupAPI, commentsAPI } from '../services/api';
import { formatTimeAgo } from '../utils/timeFormatter';
import { getCountryFlag } from '../utils/countries';
import { useToast } from './Toast';

function CommentsSection({ groupId, isAdmin }) {
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyInputs, setReplyInputs] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [replies, setReplies] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadComments();
  }, [groupId]);

  const loadComments = async () => {
    try {
      const response = await groupAPI.getComments(groupId);
      setComments(response.data.data.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setSubmitting(true);
    try {
      await groupAPI.addComment(groupId, commentInput.trim());
      setCommentInput('');
      loadComments();
      showToast('Comment posted!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await groupAPI.deleteComment(groupId, commentId);
      loadComments();
      showToast('Comment deleted', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete comment', 'error');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await commentsAPI.like(commentId);
      // Update local state
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          const alreadyLiked = c.liked_by_user;
          return {
            ...c,
            likes_count: alreadyLiked ? (c.likes_count || 1) - 1 : (c.likes_count || 0) + 1,
            liked_by_user: !alreadyLiked
          };
        }
        return c;
      }));
    } catch (error) {
      showToast('Failed to like comment', 'error');
    }
  };

  const toggleReplies = async (commentId) => {
    const isShowing = showReplies[commentId];
    
    if (!isShowing && !replies[commentId]) {
      // Load replies if not already loaded
      setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
      try {
        const response = await commentsAPI.getReplies(commentId);
        setReplies(prev => ({ ...prev, [commentId]: response.data.data.replies || [] }));
      } catch (error) {
        console.error('Error loading replies:', error);
      } finally {
        setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
      }
    }
    
    setShowReplies(prev => ({ ...prev, [commentId]: !isShowing }));
  };

  const handleReplyInputChange = (commentId, value) => {
    setReplyInputs(prev => ({ ...prev, [commentId]: value }));
  };

  const handleSubmitReply = async (commentId) => {
    const replyText = replyInputs[commentId]?.trim();
    if (!replyText) return;

    setSubmittingReply(prev => ({ ...prev, [commentId]: true }));
    try {
      await commentsAPI.reply(commentId, replyText);
      setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
      
      // Reload replies
      const response = await commentsAPI.getReplies(commentId);
      setReplies(prev => ({ ...prev, [commentId]: response.data.data.replies || [] }));
      
      // Update reply count
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return { ...c, replies_count: (c.replies_count || 0) + 1 };
        }
        return c;
      }));
      
      showToast('Reply posted!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to post reply', 'error');
    } finally {
      setSubmittingReply(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!confirm('Delete this reply?')) return;

    try {
      await commentsAPI.deleteReply(replyId);
      setReplies(prev => ({
        ...prev,
        [commentId]: prev[commentId].filter(r => r.id !== replyId)
      }));
      
      // Update reply count
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return { ...c, replies_count: Math.max((c.replies_count || 1) - 1, 0) };
        }
        return c;
      }));
      
      showToast('Reply deleted', 'success');
    } catch (error) {
      showToast('Failed to delete reply', 'error');
    }
  };

  const canDeleteComment = (comment) => {
    return isAdmin || comment.user_id === currentUser?.id;
  };

  const canDeleteReply = (reply) => {
    return isAdmin || reply.user_id === currentUser?.id;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner" style={{ width: '30px', height: '30px', margin: '0 auto' }}></div>
        <p style={{ color: '#718096', marginTop: '12px' }}>Loading comments...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2d3748', marginBottom: '16px' }}>
        💬 Comments ({comments.length})
      </h2>

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          {/* User Avatar */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            flexShrink: 0
          }}>
            {currentUser?.firstName?.charAt(0)}{currentUser?.lastName?.charAt(0)}
          </div>
          
          <div style={{ flex: 1 }}>
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="input"
              placeholder="Write a comment..."
              rows="3"
              style={{ marginBottom: '8px', resize: 'vertical' }}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={!commentInput.trim() || submitting}
              style={{ padding: '8px 20px' }}
            >
              {submitting ? 'Posting...' : '📝 Post Comment'}
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f7fafc', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
          <p style={{ color: '#718096' }}>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{ 
              padding: '16px', 
              background: '#f7fafc', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              {/* Comment Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: comment.user_id === currentUser?.id 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    {comment.first_name?.charAt(0)}{comment.last_name?.charAt(0)}
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '600', color: '#2d3748' }}>
                        {comment.first_name} {comment.last_name}
                      </span>
                      {comment.country && (
                        <span style={{ fontSize: '14px' }}>{getCountryFlag(comment.country)}</span>
                      )}
                      {comment.user_id === currentUser?.id && (
                        <span style={{ 
                          fontSize: '10px', 
                          padding: '2px 6px', 
                          background: '#667eea', 
                          color: 'white', 
                          borderRadius: '8px' 
                        }}>
                          YOU
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: '#a0aec0' }}>
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                </div>

                {/* Delete Button */}
                {canDeleteComment(comment) && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e53e3e',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                    title={isAdmin && comment.user_id !== currentUser?.id ? 'Delete (Admin)' : 'Delete'}
                  >
                    🗑️
                  </button>
                )}
              </div>

              {/* Comment Text */}
              <p style={{ color: '#4a5568', marginBottom: '12px', lineHeight: '1.5' }}>
                {comment.comment_text}
              </p>

              {/* Comment Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Like Button */}
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    color: comment.liked_by_user ? '#e53e3e' : '#718096',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {comment.liked_by_user ? '❤️' : '🤍'} {comment.likes_count || 0}
                </button>

                {/* Reply Toggle Button */}
                <button
                  onClick={() => toggleReplies(comment.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  💬 {showReplies[comment.id] ? 'Hide' : 'Reply'} 
                  {(comment.replies_count || 0) > 0 && ` (${comment.replies_count})`}
                </button>
              </div>

              {/* Replies Section */}
              {showReplies[comment.id] && (
                <div style={{ marginTop: '16px', paddingLeft: '20px', borderLeft: '2px solid #e2e8f0' }}>
                  {/* Reply Input */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      value={replyInputs[comment.id] || ''}
                      onChange={(e) => handleReplyInputChange(comment.id, e.target.value)}
                      className="input"
                      placeholder="Write a reply..."
                      style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitReply(comment.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleSubmitReply(comment.id)}
                      className="btn btn-primary"
                      disabled={!replyInputs[comment.id]?.trim() || submittingReply[comment.id]}
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      {submittingReply[comment.id] ? '...' : 'Reply'}
                    </button>
                  </div>

                  {/* Loading Replies */}
                  {loadingReplies[comment.id] && (
                    <p style={{ color: '#718096', fontSize: '13px' }}>Loading replies...</p>
                  )}

                  {/* Replies List */}
                  {replies[comment.id]?.map((reply) => (
                    <div key={reply.id} style={{ 
                      padding: '12px', 
                      background: 'white', 
                      borderRadius: '8px',
                      marginBottom: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: reply.user_id === currentUser?.id 
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : '#cbd5e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: reply.user_id === currentUser?.id ? 'white' : '#4a5568',
                            fontWeight: 'bold',
                            fontSize: '10px'
                          }}>
                            {reply.first_name?.charAt(0)}{reply.last_name?.charAt(0)}
                          </div>
                          <span style={{ fontWeight: '600', color: '#2d3748', fontSize: '13px' }}>
                            {reply.first_name} {reply.last_name}
                          </span>
                          {reply.country && (
                            <span style={{ fontSize: '12px' }}>{getCountryFlag(reply.country)}</span>
                          )}
                          <span style={{ fontSize: '11px', color: '#a0aec0' }}>
                            {formatTimeAgo(reply.created_at)}
                          </span>
                        </div>

                        {canDeleteReply(reply) && (
                          <button
                            onClick={() => handleDeleteReply(comment.id, reply.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#e53e3e',
                              cursor: 'pointer',
                              padding: '2px 6px',
                              fontSize: '11px'
                            }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <p style={{ color: '#4a5568', fontSize: '13px', margin: 0, paddingLeft: '36px' }}>
                        {reply.reply_text}
                      </p>
                    </div>
                  ))}

                  {replies[comment.id]?.length === 0 && !loadingReplies[comment.id] && (
                    <p style={{ color: '#a0aec0', fontSize: '13px', fontStyle: 'italic' }}>
                      No replies yet. Be the first!
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentsSection;
