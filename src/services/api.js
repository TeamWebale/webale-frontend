import axios from 'axios';

const API_URL = 'https://webale-api.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  getMe: () => api.get('/auth/me'),  // Alias for compatibility
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  deleteAccount: () => api.delete('/auth/account'),
  changePassword: (data) => api.put('/auth/password', data),
};

// Group API
export const groupAPI = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  getMembers: (id) => api.get(`/groups/${id}/members`),
  invite: (id, data) => api.post(`/groups/${id}/invite`, data),
  join: (token) => api.post(`/groups/join/${token}`),
  leave: (id) => api.post(`/groups/${id}/leave`),
  removeMember: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`),
  updateMemberRole: (groupId, userId, role) => api.put(`/groups/${groupId}/members/${userId}/role`, { role }),
  transferOwnership: (groupId, newOwnerId) => api.post(`/groups/${groupId}/transfer-ownership`, { newOwnerId }),
  getInviteInfo: (token) => api.get(`/groups/invite/${token}`),
};

// Member API
export const memberAPI = {
  getByGroup: (groupId) => api.get(`/groups/${groupId}/members`),
  getById: (groupId, memberId) => api.get(`/groups/${groupId}/members/${memberId}`),
  updateRole: (groupId, userId, role) => api.put(`/groups/${groupId}/members/${userId}/role`, { role }),
  remove: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`),
  invite: (groupId, data) => api.post(`/groups/${groupId}/invite`, data),
  getProfile: (groupId, userId) => api.get(`/groups/${groupId}/members/${userId}/profile`),
};

// Pledge API
export const pledgeAPI = {
  getByGroup: (groupId) => api.get(`/pledges/group/${groupId}`),
  getById: (groupId, pledgeId) => api.get(`/pledges/group/${groupId}/${pledgeId}`),
  create: (groupId, data) => api.post(`/pledges/group/${groupId}`, data),
  update: (groupId, pledgeId, data) => api.put(`/pledges/group/${groupId}/${pledgeId}`, data),
  delete: (groupId, pledgeId) => api.delete(`/pledges/group/${groupId}/${pledgeId}`),
  markAsPaid: (groupId, pledgeId, data = {}) => api.put(`/pledges/group/${groupId}/${pledgeId}/pay`, data),
  addContribution: (groupId, pledgeId, data) => api.post(`/pledges/group/${groupId}/${pledgeId}/contribute`, data),
  getUserPledges: (groupId) => api.get(`/pledges/group/${groupId}/my-pledges`),
  sendReminder: (groupId, pledgeId) => api.post(`/pledges/group/${groupId}/${pledgeId}/remind`),
};

// Activity API
export const activityAPI = {
  getByGroup: (groupId, limit = 20) => api.get(`/activities/group/${groupId}?limit=${limit}`),
  getGroupActivities: (groupId, limit = 20) => api.get(`/activities/group/${groupId}?limit=${limit}`),
  getUserActivities: (limit = 20) => api.get(`/activities/user?limit=${limit}`),
  getDashboardFeed: () => api.get('/activities/dashboard'),
  getRecent: (limit = 10) => api.get(`/activities/recent?limit=${limit}`),
};

// Stats API
export const statsAPI = {
  getDashboardStats: () => api.get('/stats/dashboard'),
  getGroupStats: (groupId) => api.get(`/stats/group/${groupId}`),
};

// Analytics API
export const analyticsAPI = {
  getGroupAnalytics: (groupId) => api.get(`/analytics/group/${groupId}`),
  getPledgeAnalytics: (groupId) => api.get(`/analytics/group/${groupId}/pledges`),
  getMemberAnalytics: (groupId) => api.get(`/analytics/group/${groupId}/members`),
  getTrends: (groupId, period = '30d') => api.get(`/analytics/group/${groupId}/trends?period=${period}`),
};

// Notices/Announcements API
export const noticesAPI = {
  getByGroup: (groupId) => api.get(`/notices/group/${groupId}`),
  create: (groupId, data) => api.post(`/notices/group/${groupId}`, data),
  update: (groupId, noticeId, data) => api.put(`/notices/group/${groupId}/${noticeId}`, data),
  delete: (groupId, noticeId) => api.delete(`/notices/group/${groupId}/${noticeId}`),
  togglePin: (groupId, noticeId) => api.put(`/notices/group/${groupId}/${noticeId}/pin`),
};

// Search API
export const searchAPI = {
  searchGroup: (groupId, query) => api.get(`/search/group/${groupId}?q=${encodeURIComponent(query)}`),
  searchMembers: (groupId, query) => api.get(`/search/group/${groupId}/members?q=${encodeURIComponent(query)}`),
  searchPledges: (groupId, query) => api.get(`/search/group/${groupId}/pledges?q=${encodeURIComponent(query)}`),
  globalSearch: (query) => api.get(`/search?q=${encodeURIComponent(query)}`),
};

// Comments API
export const commentsAPI = {
  getByGroup: (groupId) => api.get(`/comments/group/${groupId}`),
  create: (groupId, data) => api.post(`/comments/group/${groupId}`, data),
  update: (groupId, commentId, data) => api.put(`/comments/group/${groupId}/${commentId}`, data),
  delete: (groupId, commentId) => api.delete(`/comments/group/${groupId}/${commentId}`),
  togglePin: (groupId, commentId) => api.put(`/comments/group/${groupId}/${commentId}/pin`),
};

// Sub-Goals API
export const subGoalsAPI = {
  getGroupSubGoals: (groupId) => api.get(`/subgoals/group/${groupId}`),
  getByGroup: (groupId) => api.get(`/subgoals/group/${groupId}`),
  create: (groupId, data) => api.post(`/subgoals/group/${groupId}`, data),
  update: (groupId, subGoalId, data) => api.put(`/subgoals/group/${groupId}/${subGoalId}`, data),
  delete: (groupId, subGoalId) => api.delete(`/subgoals/group/${groupId}/${subGoalId}`),
  contribute: (groupId, subGoalId, data) => api.post(`/subgoals/group/${groupId}/${subGoalId}/contribute`, data),
};

// Messages API
export const messagesAPI = {
  getConversations: (groupId) => api.get(`/messages/group/${groupId}/conversations`),
  getMessages: (groupId, recipientId) => api.get(`/messages/group/${groupId}/with/${recipientId}`),
  sendMessage: (groupId, data) => api.post(`/messages/group/${groupId}/send`, data),
  markAsRead: (groupId, senderId) => api.put(`/messages/group/${groupId}/read/${senderId}`),
  getUnreadCount: () => api.get('/messages/unread-count'),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
};

// Admin API
export const adminAPI = {
  getGroupAdmin: (groupId) => api.get(`/admin/group/${groupId}`),
  updateMemberRole: (groupId, userId, role) => api.put(`/admin/group/${groupId}/member/${userId}/role`, { role }),
  removeMember: (groupId, userId) => api.delete(`/admin/group/${groupId}/member/${userId}`),
  blockMember: (groupId, userId) => api.post(`/admin/group/${groupId}/member/${userId}/block`),
  unblockMember: (groupId, userId) => api.post(`/admin/group/${groupId}/member/${userId}/unblock`),
  transferOwnership: (groupId, newOwnerId) => api.post(`/admin/group/${groupId}/transfer-ownership`, { newOwnerId }),
  getActivityLogs: (groupId, params) => api.get(`/admin/group/${groupId}/activity-logs`, { params }),
};

// ============================================
// BATCH 8: Advanced Features API
// ============================================

// Audit Trail API
export const auditAPI = {
  getLogs: (groupId, params = {}) => api.get(`/audit/group/${groupId}`, { params }),
  getSummary: (groupId, days = 30) => api.get(`/audit/group/${groupId}/summary?days=${days}`),
  getUserActivity: (groupId, userId, limit = 20) => api.get(`/audit/group/${groupId}/user/${userId}?limit=${limit}`),
};

// Recurring Pledges API
export const recurringPledgeAPI = {
  getByGroup: (groupId) => api.get(`/recurring-pledges/group/${groupId}`),
  getMyRecurring: (groupId) => api.get(`/recurring-pledges/group/${groupId}/my`),
  create: (groupId, data) => api.post(`/recurring-pledges/group/${groupId}`, data),
  update: (groupId, pledgeId, data) => api.put(`/recurring-pledges/group/${groupId}/${pledgeId}`, data),
  cancel: (groupId, pledgeId) => api.put(`/recurring-pledges/group/${groupId}/${pledgeId}/cancel`),
  pause: (groupId, pledgeId) => api.put(`/recurring-pledges/group/${groupId}/${pledgeId}/pause`),
  resume: (groupId, pledgeId) => api.put(`/recurring-pledges/group/${groupId}/${pledgeId}/resume`),
};

// Email Notifications API
export const notificationAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`),
  clearAll: () => api.delete('/notifications'),
  // Group-specific notifications
  sendReminder: (groupId, pledgeId) => api.post(`/notifications/group/${groupId}/pledge/${pledgeId}/remind`),
  sendBulkReminder: (groupId, pledgeIds) => api.post(`/notifications/group/${groupId}/bulk-remind`, { pledgeIds }),
  getSettings: (groupId) => api.get(`/notifications/group/${groupId}/settings`),
  updateSettings: (groupId, settings) => api.put(`/notifications/group/${groupId}/settings`, settings),
  getHistory: (groupId) => api.get(`/notifications/group/${groupId}/history`),
};

// Payment Integration API
export const paymentAPI = {
  // Payment methods
  getMethods: () => api.get('/payments/methods'),
  
  // Initiate payment
  initiate: (data) => api.post('/payments/initiate', data),
  
  // Verify/complete payment
  verify: (transactionId) => api.post(`/payments/verify/${transactionId}`),
  
  // Payment history
  getHistory: (params) => api.get('/payments/history', { params }),
  
  // Mobile Money specific
  initiateMobileMoney: (data) => api.post('/payments/mobile-money/initiate', data),
  checkMobileMoneyStatus: (transactionId) => api.get(`/payments/mobile-money/status/${transactionId}`),
  
  // Process payment (legacy support)
  process: (data) => api.post('/payments/initiate', data),
};

// Group Templates API
export const templateAPI = {
  getAll: () => api.get('/templates'),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  // Pre-defined system templates don't need API - they're hardcoded in frontend
};

// Export/Reports API
export const reportAPI = {
  exportPledges: (groupId, format = 'xlsx') => api.get(`/reports/group/${groupId}/pledges?format=${format}`, { responseType: 'blob' }),
  exportMembers: (groupId, format = 'xlsx') => api.get(`/reports/group/${groupId}/members?format=${format}`, { responseType: 'blob' }),
  exportAll: (groupId, format = 'xlsx') => api.get(`/reports/group/${groupId}/all?format=${format}`, { responseType: 'blob' }),
  generatePDF: (groupId) => api.get(`/reports/group/${groupId}/pdf`, { responseType: 'blob' }),
};

export default api;
// Rebuild 
