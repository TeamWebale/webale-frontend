import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

function InviteShare({ inviteLink, groupName, onClose }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('link');
  const qrRef = useRef(null);

  useEffect(() => {
    generateQRCode();
  }, [inviteLink]);

  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(inviteLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#2d3748',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('QR Code generation error:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = inviteLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `🎉 You're invited to join "${groupName}" on Webale!\n\n` +
      `Join our group fundraising effort:\n${inviteLink}\n\n` +
      `Click the link above to join and make your pledge!`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareViaTelegram = () => {
    const message = encodeURIComponent(
      `🎉 You're invited to join "${groupName}" on Webale!\n\nJoin our group fundraising effort!`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${message}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`You're invited to join ${groupName}`);
    const body = encodeURIComponent(
      `Hi,\n\n` +
      `I'd like to invite you to join our group "${groupName}" on Webale.\n\n` +
      `Click the link below to join:\n${inviteLink}\n\n` +
      `Looking forward to having you with us!\n\n` +
      `Best regards`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(
      `Join "${groupName}" on Webale: ${inviteLink}`
    );
    window.open(`sms:?body=${message}`, '_blank');
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `${groupName.replace(/[^a-z0-9]/gi, '_')}_invite_qr.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  return (
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
      onClick={onClose}
    >
      <div
        className="card"
        style={{ maxWidth: '480px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            🔗 Share Invite
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#a0aec0'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['link', 'qr', 'share'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === tab ? '#667eea' : '#f7fafc',
                color: activeTab === tab ? 'white' : '#4a5568',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              {tab === 'link' && '🔗 Link'}
              {tab === 'qr' && '📱 QR Code'}
              {tab === 'share' && '📤 Share'}
            </button>
          ))}
        </div>

        {/* Link Tab */}
        {activeTab === 'link' && (
          <div>
            <p style={{ color: '#718096', fontSize: '14px', marginBottom: '16px' }}>
              Share this link with people you want to invite:
            </p>
            <div style={{
              display: 'flex',
              gap: '8px',
              padding: '12px',
              background: '#f7fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <input
                type="text"
                value={inviteLink}
                readOnly
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '13px',
                  color: '#4a5568'
                }}
              />
              <button
                onClick={copyToClipboard}
                className="btn"
                style={{
                  background: copied ? '#48bb78' : '#667eea',
                  color: 'white',
                  padding: '8px 16px',
                  fontSize: '13px'
                }}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
        )}

        {/* QR Code Tab */}
        {activeTab === 'qr' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#718096', fontSize: '14px', marginBottom: '16px' }}>
              Scan this QR code to join the group:
            </p>
            
            <div 
              ref={qrRef}
              style={{
                display: 'inline-block',
                padding: '20px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                marginBottom: '16px'
              }}
            >
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="Invite QR Code" 
                  style={{ width: '200px', height: '200px' }}
                />
              ) : (
                <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="spinner"></div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={downloadQRCode}
                className="btn"
                style={{ background: '#667eea', color: 'white' }}
              >
                📥 Download QR
              </button>
              <button
                onClick={copyToClipboard}
                className="btn"
                style={{ background: '#e2e8f0', color: '#4a5568' }}
              >
                📋 Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Share Tab */}
        {activeTab === 'share' && (
          <div>
            <p style={{ color: '#718096', fontSize: '14px', marginBottom: '16px' }}>
              Share the invite via your preferred platform:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* WhatsApp */}
              <button
                onClick={shareViaWhatsApp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  background: '#25D366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                <span style={{ fontSize: '24px' }}>📱</span>
                Share via WhatsApp
              </button>

              {/* Telegram */}
              <button
                onClick={shareViaTelegram}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  background: '#0088cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                <span style={{ fontSize: '24px' }}>✈️</span>
                Share via Telegram
              </button>

              {/* Email */}
              <button
                onClick={shareViaEmail}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                <span style={{ fontSize: '24px' }}>📧</span>
                Share via Email
              </button>

              {/* SMS */}
              <button
                onClick={shareViaSMS}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  background: '#38a169',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                <span style={{ fontSize: '24px' }}>💬</span>
                Share via SMS
              </button>

              {/* Copy Link */}
              <button
                onClick={copyToClipboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  background: '#f7fafc',
                  color: '#4a5568',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                <span style={{ fontSize: '24px' }}>📋</span>
                {copied ? '✓ Link Copied!' : 'Copy Link to Clipboard'}
              </button>
            </div>
          </div>
        )}

        {/* Group Name Footer */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#f7fafc',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <span style={{ color: '#718096', fontSize: '13px' }}>Inviting to: </span>
          <span style={{ fontWeight: '600', color: '#2d3748' }}>{groupName}</span>
        </div>
      </div>
    </div>
  );
}

export default InviteShare;
