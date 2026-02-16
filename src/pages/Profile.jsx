import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import MainLayout from '../components/MainLayout';

function Profile() {
  const location = useLocation();

  // User data
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Active tab
  const [activeTab, setActiveTab] = useState('profile');

  // Form fields - Profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Social Links
  const [socialLinks, setSocialLinks] = useState({
    twitter: '', linkedin: '', facebook: '', instagram: '', website: ''
  });

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preferences
  const [profilePublic, setProfilePublic] = useState(true);

  // Avatar Modal
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const avatars = [
    { id: 1, emoji: '😀', label: 'Happy' },
    { id: 2, emoji: '😎', label: 'Cool' },
    { id: 3, emoji: '🤓', label: 'Nerd' },
    { id: 4, emoji: '😊', label: 'Smile' },
    { id: 5, emoji: '🥳', label: 'Party' },
    { id: 6, emoji: '😇', label: 'Angel' },
    { id: 7, emoji: '🤩', label: 'Star' },
    { id: 8, emoji: '😏', label: 'Smirk' },
    { id: 9, emoji: '🧑‍💼', label: 'Pro' },
    { id: 10, emoji: '👨‍🎨', label: 'Artist' },
    { id: 11, emoji: '👩‍💻', label: 'Dev' },
    { id: 12, emoji: '🧑‍🚀', label: 'Astro' },
    { id: 13, emoji: '🦸', label: 'Hero' },
    { id: 14, emoji: '🧙', label: 'Wizard' },
    { id: 15, emoji: '👑', label: 'Royal' },
    { id: 16, emoji: '🌟', label: 'Star' },
  ];

  const countries = [
    { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
    { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
    { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
    { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
    { code: 'SS', name: 'South Sudan', flag: '🇸🇸' },
    { code: 'CD', name: 'DR Congo', flag: '🇨🇩' },
    { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  ];

  useEffect(() => {
    loadUserData();
    if (location.state?.openAvatarModal) {
      setShowAvatarModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setFirstName(parsed.first_name || '');
        setLastName(parsed.last_name || '');
        setEmail(parsed.email || '');
        setPhone(parsed.phone || '');
        setCountry(parsed.country || '');
        setBio(parsed.bio || '');
        setDateOfBirth(parsed.date_of_birth || '');
        setSelectedAvatar(parsed.avatar || null);
        setProfilePublic(parsed.profile_public !== false);
        try {
          const links = typeof parsed.social_links === 'string' ? JSON.parse(parsed.social_links) : (parsed.social_links || {});
          setSocialLinks({ twitter: '', linkedin: '', facebook: '', instagram: '', website: '', ...links });
        } catch { setSocialLinks({ twitter: '', linkedin: '', facebook: '', instagram: '', website: '' }); }
      }
    } catch (err) {
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completion
  const getProfileCompletion = () => {
    let filled = 0;
    const total = 8;
    if (firstName) filled++;
    if (lastName) filled++;
    if (country) filled++;
    if (phone) filled++;
    if (bio) filled++;
    if (selectedAvatar) filled++;
    if (dateOfBirth) filled++;
    if (socialLinks.twitter || socialLinks.linkedin || socialLinks.facebook || socialLinks.instagram || socialLinks.website) filled++;
    return Math.round((filled / total) * 100);
  };

  const handleSave = async () => {
    // Validate mandatory fields
    if (!firstName.trim()) { setMessage({ type: 'error', text: 'First Name is required' }); return; }
    if (!lastName.trim()) { setMessage({ type: 'error', text: 'Last Name is required' }); return; }
    if (!country) { setMessage({ type: 'error', text: 'Country is required' }); return; }

    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const updateData = {
        firstName: firstName,
        lastName: lastName,
        phone,
        country,
        bio,
        dateOfBirth: dateOfBirth || null,
        avatarUrl: selectedAvatar,
        socialLinks: JSON.stringify(socialLinks),
        profilePublic
      };
      await authAPI.updateProfile(updateData);
      const updatedUser = {
        ...user,
        first_name: firstName,
        last_name: lastName,
        phone, country, bio,
        date_of_birth: dateOfBirth,
        avatar: selectedAvatar,
        social_links: JSON.stringify(socialLinks),
        profile_public: profilePublic
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) { setMessage({ type: 'error', text: 'Current password is required' }); return; }
    if (!newPassword || newPassword.length < 6) { setMessage({ type: 'error', text: 'New password must be at least 6 characters' }); return; }
    if (newPassword !== confirmPassword) { setMessage({ type: 'error', text: 'Passwords do not match' }); return; }
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await authAPI.updateProfile({ profilePublic });
      const updatedUser = { ...user, profile_public: profilePublic };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage({ type: 'success', text: 'Preferences saved!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = (avatar) => { setSelectedAvatar(avatar.emoji); };
  const handleAvatarSave = () => {
    if (user) {
      const updatedUser = { ...user, avatar: selectedAvatar };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    setShowAvatarModal(false);
  };

  const getInitials = () => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  const completion = getProfileCompletion();

  // Styles
  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '14px', color: '#2d3748', boxSizing: 'border-box', outline: 'none', background: 'white'
  };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' };
  const requiredStar = { color: '#e53e3e', marginLeft: '2px' };
  const hintStyle = { fontSize: '11px', color: '#a0aec0', marginTop: '4px', fontStyle: 'italic' };
  const optionalBadge = { fontSize: '10px', color: '#a0aec0', fontWeight: '400', marginLeft: '4px' };

  // ==================== AVATAR MODAL ====================
  const AvatarModal = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: '20px'
    }} onClick={() => setShowAvatarModal(false)}>
      <div style={{
        background: 'white', borderRadius: '16px', maxWidth: '450px', width: '100%',
        maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#2d3748', fontWeight: 'bold' }}>Choose Your Avatar</h2>
          <button onClick={() => setShowAvatarModal(false)} style={{ background: '#f7fafc', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px', color: '#718096' }}>X</button>
        </div>
        <div style={{ padding: '20px', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: selectedAvatar ? '40px' : '28px', color: 'white', fontWeight: 'bold' }}>
            {selectedAvatar || getInitials()}
          </div>
          <p style={{ color: 'white', margin: '10px 0 0', fontSize: '14px' }}>{selectedAvatar ? 'Looking good!' : 'Select an avatar below'}</p>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {avatars.map(avatar => (
              <button key={avatar.id} onClick={() => handleAvatarSelect(avatar)} style={{
                width: '100%', aspectRatio: '1', borderRadius: '12px',
                border: selectedAvatar === avatar.emoji ? '3px solid #667eea' : '2px solid #e2e8f0',
                background: selectedAvatar === avatar.emoji ? '#ebf8ff' : 'white',
                cursor: 'pointer', fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{avatar.emoji}</button>
            ))}
          </div>
          <button onClick={() => setSelectedAvatar(null)} style={{
            width: '100%', marginTop: '16px', padding: '12px',
            border: !selectedAvatar ? '3px solid #667eea' : '2px solid #e2e8f0',
            background: !selectedAvatar ? '#ebf8ff' : 'white',
            borderRadius: '10px', cursor: 'pointer', fontSize: '14px', color: '#4a5568', fontWeight: '600'
          }}>Use My Initials ({getInitials()})</button>
        </div>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowAvatarModal(false)} className="btn" style={{ flex: 1, background: '#e2e8f0', color: '#4a5568', padding: '12px' }}>Cancel</button>
          <button onClick={handleAvatarSave} className="btn btn-primary" style={{ flex: 2, padding: '12px' }}>Save Avatar</button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <div className="spinner"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showProfileBanner={false}>

      {/* ==================== PROFILE HEADER ==================== */}
      <div style={{
        background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 30%, #553c9a 70%, #667eea 100%)',
        borderRadius: '16px', padding: '30px', marginBottom: '20px', color: 'white',
        display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap'
      }}>
        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: '4px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: selectedAvatar ? '50px' : '36px', fontWeight: 'bold'
          }}>
            {selectedAvatar || getInitials()}
          </div>
          <button onClick={() => setShowAvatarModal(true)} style={{
            position: 'absolute', bottom: '0', right: '0', width: '30px', height: '30px',
            borderRadius: '50%', background: '#667eea', border: '3px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '12px', color: 'white'
          }}>✏️</button>
        </div>

        {/* Name & Info */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '700' }}>
            {firstName || 'Your'} {lastName || 'Name'}
          </h1>
          <p style={{ margin: 0, opacity: 0.7, fontSize: '13px' }}>
            {country ? countries.find(c => c.code === country)?.flag : '🌍'} Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
          </p>
        </div>

        {/* Profile Completion */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%', position: 'relative',
            background: `conic-gradient(#48bb78 ${completion * 3.6}deg, rgba(255,255,255,0.15) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: '#2d3748',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: '700'
            }}>{completion}%</div>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '11px', opacity: 0.7 }}>Profile Complete</p>
        </div>
      </div>

      {/* ==================== TABS ==================== */}
      <div style={{
        display: 'flex', gap: '0', marginBottom: '20px', background: 'white',
        borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        {[
          { id: 'profile', icon: '✏️', label: 'Edit Profile' },
          { id: 'security', icon: '🔒', label: 'Security' },
          { id: 'preferences', icon: '⚙️', label: 'Preferences' }
        ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMessage({ type: '', text: '' }); }} style={{
            flex: 1, padding: '14px', border: 'none', cursor: 'pointer',
            background: activeTab === tab.id ? 'white' : '#f7fafc',
            color: activeTab === tab.id ? '#667eea' : '#718096',
            fontWeight: activeTab === tab.id ? '700' : '500',
            fontSize: '14px', borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Message */}
      {message.text && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
          background: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
          color: message.type === 'success' ? '#276749' : '#c53030', fontSize: '14px'
        }}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      {/* ==================== EDIT PROFILE TAB ==================== */}
      {activeTab === 'profile' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>

          {/* Personal Info Section */}
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#2d3748', fontWeight: '700' }}>Personal Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* First Name - Required */}
            <div>
              <label style={labelStyle}>First Name<span style={requiredStar}>*</span></label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                style={{ ...inputStyle, borderColor: !firstName.trim() ? '#fc8181' : '#e2e8f0' }}
                placeholder="Your first name" />
            </div>

            {/* Last Name - Required */}
            <div>
              <label style={labelStyle}>Last Name<span style={requiredStar}>*</span></label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                style={{ ...inputStyle, borderColor: !lastName.trim() ? '#fc8181' : '#e2e8f0' }}
                placeholder="Your last name" />
            </div>

            {/* Email - Required, not editable */}
            <div>
              <label style={labelStyle}>Email Address<span style={requiredStar}>*</span></label>
              <input type="email" value={email} disabled
                style={{ ...inputStyle, background: '#f7fafc', cursor: 'not-allowed', color: '#718096' }} />
              <p style={hintStyle}>🔒 Not displayed to other members. Used for login only.</p>
            </div>

            {/* Phone - Optional */}
            <div>
              <label style={labelStyle}>Phone Number<span style={optionalBadge}>(optional)</span></label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                style={inputStyle} placeholder="+1 234 567 8900" />
              <p style={hintStyle}>🔒 Not displayed to other members.</p>
            </div>

            {/* Country - Required */}
            <div>
              <label style={labelStyle}>Country<span style={requiredStar}>*</span></label>
              <select value={country} onChange={e => setCountry(e.target.value)}
                style={{ ...inputStyle, borderColor: !country ? '#fc8181' : '#e2e8f0' }}>
                <option value="">Select country...</option>
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>

            {/* Date of Birth - Optional */}
            <div>
              <label style={labelStyle}>Date of Birth<span style={optionalBadge}>(optional)</span></label>
              <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)}
                style={inputStyle} />
            </div>
          </div>

          {/* Bio - Optional */}
          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Bio / About Me<span style={optionalBadge}>(optional)</span></label>
            <textarea value={bio} onChange={e => setBio(e.target.value)}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              placeholder="Tell others a bit about yourself..."
              maxLength={500} />
            <p style={{ fontSize: '11px', color: '#a0aec0', marginTop: '4px', textAlign: 'right' }}>
              {bio.length}/500 characters
            </p>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #e2e8f0', margin: '24px 0', position: 'relative' }}>
            <span style={{
              position: 'absolute', top: '-10px', left: '16px', background: 'white',
              padding: '0 8px', fontSize: '12px', color: '#a0aec0', fontWeight: '600'
            }}>SOCIAL LINKS (optional)</span>
          </div>

          {/* Social Links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>🐦 Twitter / X<span style={optionalBadge}>(optional)</span></label>
              <input type="text" value={socialLinks.twitter}
                onChange={e => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                style={inputStyle} placeholder="username (without @)" />
            </div>
            <div>
              <label style={labelStyle}>💼 LinkedIn<span style={optionalBadge}>(optional)</span></label>
              <input type="text" value={socialLinks.linkedin}
                onChange={e => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                style={inputStyle} placeholder="username" />
            </div>
            <div>
              <label style={labelStyle}>📘 Facebook<span style={optionalBadge}>(optional)</span></label>
              <input type="text" value={socialLinks.facebook}
                onChange={e => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                style={inputStyle} placeholder="username" />
            </div>
            <div>
              <label style={labelStyle}>📸 Instagram<span style={optionalBadge}>(optional)</span></label>
              <input type="text" value={socialLinks.instagram}
                onChange={e => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                style={inputStyle} placeholder="username" />
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <label style={labelStyle}>🌐 Website URL<span style={optionalBadge}>(optional)</span></label>
              <input type="url" value={socialLinks.website}
                onChange={e => setSocialLinks({ ...socialLinks, website: e.target.value })}
                style={inputStyle} placeholder="https://yourwebsite.com" />
            </div>
          </div>

          {/* Save Button */}
          <button onClick={handleSave} disabled={saving} className="btn btn-primary"
            style={{ marginTop: '24px', padding: '14px 32px', fontSize: '15px', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : '💾 Save Profile'}
          </button>
        </div>
      )}

      {/* ==================== SECURITY TAB ==================== */}
      {activeTab === 'security' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '480px' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#2d3748', fontWeight: '700' }}>
            🔒 Change Password
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#718096' }}>
            Update your password to keep your account secure.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Current Password<span style={requiredStar}>*</span></label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                style={inputStyle} placeholder="Enter current password" />
            </div>
            <div>
              <label style={labelStyle}>New Password<span style={requiredStar}>*</span></label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                style={inputStyle} placeholder="At least 6 characters" />
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password<span style={requiredStar}>*</span></label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                style={{ ...inputStyle, borderColor: confirmPassword && newPassword !== confirmPassword ? '#fc8181' : '#e2e8f0' }}
                placeholder="Re-enter new password" />
              {confirmPassword && newPassword !== confirmPassword && (
                <p style={{ fontSize: '11px', color: '#e53e3e', marginTop: '4px' }}>Passwords do not match</p>
              )}
            </div>
          </div>

          <button onClick={handleChangePassword} disabled={saving} className="btn btn-primary"
            style={{ marginTop: '24px', padding: '12px 28px', fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Changing...' : '🔐 Change Password'}
          </button>
        </div>
      )}

      {/* ==================== PREFERENCES TAB ==================== */}
      {activeTab === 'preferences' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '480px' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#2d3748', fontWeight: '700' }}>
            ⚙️ Profile Preferences
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#718096' }}>
            Control how your profile is visible to other group members.
          </p>

          <div style={{
            padding: '16px', background: '#f7fafc', borderRadius: '10px',
            border: '1px solid #e2e8f0', marginBottom: '16px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={profilePublic} onChange={e => setProfilePublic(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <div>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>
                  Allow other group members to view your full profile
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#718096' }}>
                  When disabled, only your name and avatar are visible to others.
                </p>
              </div>
            </label>
          </div>

          <div style={{
            padding: '12px', background: '#fffbeb', borderRadius: '8px',
            border: '1px solid #fefcbf', fontSize: '12px', color: '#975a16', marginBottom: '20px'
          }}>
            <strong>Note:</strong> Your email address and phone number are never displayed to other members, regardless of this setting.
          </div>

          <button onClick={handleSavePreferences} disabled={saving} className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : '💾 Save Preferences'}
          </button>
        </div>
      )}

      {/* Avatar Modal */}
      {showAvatarModal && <AvatarModal />}
    </MainLayout>
  );
}

export default Profile;
