import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { CURRENCIES } from '../utils/currencyConverter';
import { COUNTRIES } from '../utils/countries';

function Settings() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { showToast, ToastContainer } = useToast();

  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile settings
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    bio: ''
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    language: language,
    currency: 'USD',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    darkMode: isDarkMode
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailPledgeReceived: true,
    emailPaymentReceived: true,
    emailReminders: true,
    emailGroupUpdates: true,
    emailWeeklySummary: false,
    pushEnabled: false,
    pushPledges: true,
    pushPayments: true,
    pushMessages: true
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: false,
    showCountry: true,
    allowAnonymousPledges: true,
    profileVisibility: 'members'
  });

  // Security settings
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getMe();
      const user = response.data.data?.user || response.data.user || {};
      
      setProfile({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        bio: user.bio || ''
      });

      const savedPrefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
      setPreferences(prev => ({ ...prev, ...savedPrefs }));

      const savedNotifs = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
      setNotifications(prev => ({ ...prev, ...savedNotifs }));

      const savedPrivacy = JSON.parse(localStorage.getItem('privacySettings') || '{}');
      setPrivacy(prev => ({ ...prev, ...savedPrivacy }));

    } catch (error) {
      console.error('Error loading settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      await authAPI.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        country: profile.country,
        bio: profile.bio
      });

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.first_name = profile.firstName;
      user.last_name = profile.lastName;
      user.phone = profile.phone;
      user.country = profile.country;
      localStorage.setItem('user', JSON.stringify(user));

      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    setLanguage(preferences.language);
    if (preferences.darkMode !== isDarkMode) {
      toggleDarkMode();
    }
    showToast('Preferences saved!', 'success');
  };

  const saveNotifications = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
    showToast('Notification settings saved!', 'success');
  };

  const savePrivacy = () => {
    localStorage.setItem('privacySettings', JSON.stringify(privacy));
    showToast('Privacy settings saved!', 'success');
  };

  const changePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (security.newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    try {
      setSaving(true);
      await authAPI.changePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword
      });
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmed) return;

    const doubleConfirm = window.prompt('Type "DELETE" to confirm:');
    if (doubleConfirm !== 'DELETE') {
      showToast('Account deletion cancelled', 'info');
      return;
    }

    try {
      await authAPI.deleteAccount();
      localStorage.clear();
      navigate('/');
      window.location.reload();
    } catch (error) {
      showToast('Failed to delete account', 'error');
    }
  };

  const sections = [
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'preferences', icon: '🎨', label: 'Preferences' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'privacy', icon: '🔒', label: 'Privacy' },
    { id: 'security', icon: '🛡️', label: 'Security' },
  ];

  const ToggleSwitch = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        border: 'none',
        background: enabled ? '#48bb78' : '#e2e8f0',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      <span style={{
        position: 'absolute',
        top: '2px',
        left: enabled ? '22px' : '2px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.2s'
      }} />
    </button>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <ToastContainer />
      
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d3748', marginBottom: '4px' }}>
          ⚙️ {t('nav_settings')}
        </h1>
        <p style={{ color: '#718096', fontSize: '15px' }}>
          Manage your account settings and preferences
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <div className="settings-sidebar" style={{ width: '200px', flexShrink: 0 }}>
          <div className="card" style={{ padding: '8px' }}>
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: activeSection === section.id ? '#ebf8ff' : 'transparent',
                  color: activeSection === section.id ? '#667eea' : '#4a5568',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeSection === section.id ? '600' : '500',
                  textAlign: 'left',
                  marginBottom: '4px'
                }}
              >
                <span style={{ fontSize: '18px' }}>{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          {/* Profile */}
          {activeSection === 'profile' && (
            <div className="card">
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                👤 Profile Information
              </h2>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
                    First Name
                  </label>
                  <input type="text" className="input" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
                    Last Name
                  </label>
                  <input type="text" className="input" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
                  Email Address
                </label>
                <input type="email" className="input" value={profile.email} disabled style={{ background: '#f7fafc', cursor: 'not-allowed' }} />
                <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>Email cannot be changed</p>
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
                    Phone Number
                  </label>
                  <input type="tel" className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 234 567 8900" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
                    Country
                  </label>
                  <select className="input" value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })}>
                    <option value="">Select Country</option>
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
                  Bio
                </label>
                <textarea className="input" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us about yourself..." rows="3" maxLength={500} />
                <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px', textAlign: 'right' }}>{profile.bio.length}/500</p>
              </div>

              <button onClick={saveProfile} disabled={saving} className="btn btn-primary" style={{ width: '100%' }}>
                {saving ? 'Saving...' : '💾 Save Profile'}
              </button>
            </div>
          )}

          {/* Preferences */}
          {activeSection === 'preferences' && (
            <div className="card">
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>🎨 Preferences</h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>🌍 Language</label>
                <select className="input" value={preferences.language} onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}>
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>💰 Default Currency</label>
                <select className="input" value={preferences.currency} onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}>
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>📅 Date Format</label>
                <select className="input" value={preferences.dateFormat} onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (UK/EU)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f7fafc', borderRadius: '10px', marginBottom: '20px' }}>
                <div>
                  <p style={{ fontWeight: '600', color: '#2d3748', marginBottom: '4px' }}>{preferences.darkMode ? '☀️' : '🌙'} Dark Mode</p>
                  <p style={{ fontSize: '13px', color: '#718096' }}>{preferences.darkMode ? 'Dark theme enabled' : 'Light theme enabled'}</p>
                </div>
                <ToggleSwitch enabled={preferences.darkMode} onToggle={() => setPreferences({ ...preferences, darkMode: !preferences.darkMode })} />
              </div>

              <button onClick={savePreferences} className="btn btn-primary" style={{ width: '100%' }}>💾 Save Preferences</button>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="card">
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>🔔 Notification Settings</h2>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#4a5568', marginBottom: '12px' }}>📧 Email Notifications</h3>

              {[
                { key: 'emailPledgeReceived', label: 'New pledge received', desc: 'When someone makes a pledge' },
                { key: 'emailPaymentReceived', label: 'Payment received', desc: 'When a payment is recorded' },
                { key: 'emailReminders', label: 'Pledge reminders', desc: 'Reminders about pending pledges' },
                { key: 'emailGroupUpdates', label: 'Group updates', desc: 'When group details change' },
                { key: 'emailWeeklySummary', label: 'Weekly summary', desc: 'Weekly digest of activity' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <p style={{ fontWeight: '500', color: '#2d3748', marginBottom: '2px' }}>{item.label}</p>
                    <p style={{ fontSize: '13px', color: '#718096' }}>{item.desc}</p>
                  </div>
                  <ToggleSwitch enabled={notifications[item.key]} onToggle={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })} />
                </div>
              ))}

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#4a5568', marginTop: '24px', marginBottom: '12px' }}>📱 Push Notifications</h3>

              {[
                { key: 'pushEnabled', label: 'Enable push notifications', desc: 'Browser notifications' },
                { key: 'pushPledges', label: 'Pledge alerts', desc: 'New pledges and payments' },
                { key: 'pushMessages', label: 'Messages', desc: 'New group messages' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <p style={{ fontWeight: '500', color: '#2d3748', marginBottom: '2px' }}>{item.label}</p>
                    <p style={{ fontSize: '13px', color: '#718096' }}>{item.desc}</p>
                  </div>
                  <ToggleSwitch enabled={notifications[item.key]} onToggle={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })} />
                </div>
              ))}

              <button onClick={saveNotifications} className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>💾 Save Notification Settings</button>
            </div>
          )}

          {/* Privacy */}
          {activeSection === 'privacy' && (
            <div className="card">
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>🔒 Privacy Settings</h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>Profile Visibility</label>
                <select className="input" value={privacy.profileVisibility} onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}>
                  <option value="public">🌍 Public - Anyone can see</option>
                  <option value="members">👥 Members Only</option>
                  <option value="private">🔒 Private - Only you</option>
                </select>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#4a5568', marginBottom: '12px' }}>Information Visibility</h3>

              {[
                { key: 'showEmail', label: 'Show email address', desc: 'Display to group members' },
                { key: 'showPhone', label: 'Show phone number', desc: 'Display to group members' },
                { key: 'showCountry', label: 'Show country', desc: 'Display country flag' },
                { key: 'allowAnonymousPledges', label: 'Allow anonymous pledges', desc: 'Others can pledge anonymously' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <p style={{ fontWeight: '500', color: '#2d3748', marginBottom: '2px' }}>{item.label}</p>
                    <p style={{ fontSize: '13px', color: '#718096' }}>{item.desc}</p>
                  </div>
                  <ToggleSwitch enabled={privacy[item.key]} onToggle={() => setPrivacy({ ...privacy, [item.key]: !privacy[item.key] })} />
                </div>
              ))}

              <button onClick={savePrivacy} className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>💾 Save Privacy Settings</button>
            </div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <div className="card">
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>🛡️ Security</h2>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#4a5568', marginBottom: '12px' }}>🔑 Change Password</h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>Current Password</label>
                <input type="password" className="input" value={security.currentPassword} onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })} placeholder="Enter current password" />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>New Password</label>
                <input type="password" className="input" value={security.newPassword} onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })} placeholder="Min 8 characters" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>Confirm New Password</label>
                <input type="password" className="input" value={security.confirmPassword} onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })} placeholder="Confirm new password" />
              </div>

              <button onClick={changePassword} disabled={saving || !security.currentPassword || !security.newPassword} className="btn" style={{ width: '100%', background: '#667eea', color: 'white', marginBottom: '24px' }}>
                {saving ? 'Changing...' : '🔑 Change Password'}
              </button>

              <div style={{ padding: '16px', background: '#f7fafc', borderRadius: '10px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: '600', color: '#2d3748', marginBottom: '4px' }}>🔐 Two-Factor Authentication</p>
                    <p style={{ fontSize: '13px', color: '#718096' }}>Extra security layer</p>
                  </div>
                  <span style={{ padding: '4px 12px', background: twoFactorEnabled ? '#c6f6d5' : '#fed7d7', color: twoFactorEnabled ? '#276749' : '#c53030', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <button onClick={() => showToast('2FA coming soon!', 'info')} className="btn" style={{ marginTop: '12px', background: '#e2e8f0', color: '#4a5568', width: '100%' }}>
                  {twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                </button>
              </div>

              <div style={{ padding: '20px', background: '#fff5f5', borderRadius: '10px', border: '1px solid #fed7d7' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#c53030', marginBottom: '8px' }}>⚠️ Danger Zone</h3>
                <p style={{ fontSize: '14px', color: '#742a2a', marginBottom: '16px' }}>
                  Permanently delete your account and all data.
                </p>
                <button onClick={deleteAccount} className="btn" style={{ background: '#e53e3e', color: 'white', width: '100%' }}>
                  🗑️ Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .settings-sidebar {
            width: 100% !important;
            margin-bottom: 16px;
          }
          .form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Settings;
