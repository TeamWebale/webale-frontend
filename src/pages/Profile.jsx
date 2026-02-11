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

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');

  // Avatar Modal
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  // Available avatars
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

  // Load user data and check for avatar modal trigger
  useEffect(() => {
    loadUserData();
    
    // Check if we should auto-open avatar modal (from ProfileBanner edit click)
    if (location.state?.openAvatarModal) {
      setShowAvatarModal(true);
      // Clear the state so it doesn't reopen on refresh
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
        setSelectedAvatar(parsed.avatar || null);
      }
    } catch (err) {
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = {
        first_name: firstName,
        last_name: lastName,
        phone,
        country,
        bio,
        avatar: selectedAvatar
      };

      await authAPI.updateProfile(updateData);

      // Update localStorage
      const updatedUser = { ...user, ...updateData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar.emoji);
  };

  const handleAvatarSave = () => {
    // Update localStorage immediately for avatar
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

  // ==================== AVATAR MODAL ====================
  const AvatarModal = () => (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={() => setShowAvatarModal(false)}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          maxWidth: '450px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#2d3748', fontWeight: 'bold' }}>
            🎨 Choose Your Avatar
          </h2>
          <button
            onClick={() => setShowAvatarModal(false)}
            style={{
              background: '#f7fafc',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#718096'
            }}
          >
            ✕
          </button>
        </div>

        {/* Current Preview */}
        <div style={{
          padding: '20px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: '4px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            fontSize: selectedAvatar ? '40px' : '28px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {selectedAvatar || getInitials()}
          </div>
          <p style={{ color: 'white', margin: '10px 0 0', fontSize: '14px' }}>
            {selectedAvatar ? 'Looking good!' : 'Select an avatar below'}
          </p>
        </div>

        {/* Avatar Grid */}
        <div style={{ padding: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px'
          }}>
            {avatars.map(avatar => (
              <button
                key={avatar.id}
                onClick={() => handleAvatarSelect(avatar)}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '12px',
                  border: selectedAvatar === avatar.emoji ? '3px solid #667eea' : '2px solid #e2e8f0',
                  background: selectedAvatar === avatar.emoji ? '#ebf8ff' : 'white',
                  cursor: 'pointer',
                  fontSize: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                {avatar.emoji}
              </button>
            ))}
          </div>

          {/* Use Initials Option */}
          <button
            onClick={() => setSelectedAvatar(null)}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '12px',
              border: !selectedAvatar ? '3px solid #667eea' : '2px solid #e2e8f0',
              background: !selectedAvatar ? '#ebf8ff' : 'white',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#4a5568',
              fontWeight: '600'
            }}
          >
            Use My Initials ({getInitials()})
          </button>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={() => setShowAvatarModal(false)}
            className="btn"
            style={{
              flex: 1,
              background: '#e2e8f0',
              color: '#4a5568',
              padding: '12px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAvatarSave}
            className="btn btn-primary"
            style={{
              flex: 2,
              padding: '12px'
            }}
          >
            Save Avatar
          </button>
        </div>
      </div>
    </div>
  );

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <div className="spinner"></div>
        </div>
      </MainLayout>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <MainLayout showProfileBanner={false}>
      {/* Profile Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '20px',
        color: 'white',
        textAlign: 'center'
      }}>
        {/* Avatar */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: '4px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: selectedAvatar ? '50px' : '36px',
            fontWeight: 'bold',
            margin: '0 auto'
          }}>
            {selectedAvatar || getInitials()}
          </div>
          <button
            onClick={() => setShowAvatarModal(true)}
            style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'white',
              border: '3px solid #667eea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✏️
          </button>
        </div>

        <h1 style={{ margin: '16px 0 4px', fontSize: '24px', fontWeight: 'bold' }}>
          {firstName} {lastName}
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>{email}</p>
      </div>

      {/* Profile Form */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#2d3748', fontWeight: '700' }}>
          ✏️ Edit Profile
        </h2>

        {/* Message */}
        {message.text && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            background: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
            color: message.type === 'success' ? '#276749' : '#c53030',
            fontSize: '14px'
          }}>
            {message.type === 'success' ? '✅' : '⚠️'} {message.text}
          </div>
        )}

        {/* Form Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="input"
              placeholder="Your first name"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="input"
              placeholder="Your last name"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="input"
              style={{ background: '#f7fafc', cursor: 'not-allowed' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input"
            >
              <option value="">Select country</option>
              <option value="UG">🇺🇬 Uganda</option>
              <option value="KE">🇰🇪 Kenya</option>
              <option value="TZ">🇹🇿 Tanzania</option>
              <option value="RW">🇷🇼 Rwanda</option>
              <option value="NG">🇳🇬 Nigeria</option>
              <option value="GH">🇬🇭 Ghana</option>
              <option value="ZA">🇿🇦 South Africa</option>
              <option value="US">🇺🇸 United States</option>
              <option value="GB">🇬🇧 United Kingdom</option>
              <option value="CA">🇨🇦 Canada</option>
              <option value="AU">🇦🇺 Australia</option>
            </select>
          </div>
        </div>

        {/* Bio */}
        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input"
            rows="3"
            placeholder="Tell us a bit about yourself..."
            maxLength={500}
          />
          <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
            {bio.length}/500 characters
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{
            marginTop: '20px',
            padding: '14px 32px',
            fontSize: '15px'
          }}
        >
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && <AvatarModal />}
    </MainLayout>
  );
}

export default Profile;
