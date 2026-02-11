import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';

function Layout({ children, rightSidebar }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div style={{
        display: 'flex',
        minHeight: 'calc(100vh - 80px)',
        gap: isMobile ? '0' : '20px'
      }}>
        {/* Left Sidebar - Hidden on mobile */}
        {!isMobile && (
          <div style={{
            width: '280px',
            flexShrink: 0,
            position: 'sticky',
            top: '90px',
            height: 'fit-content',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto'
          }}>
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <div style={{
          flex: 1,
          minWidth: 0,
          width: '100%',
          paddingBottom: isMobile ? '80px' : '20px'
        }}>
          {children}
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        {!isMobile && rightSidebar && (
          <div style={{
            width: '280px',
            flexShrink: 0,
            position: 'sticky',
            top: '90px',
            height: 'fit-content',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto'
          }}>
            {rightSidebar}
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}

      {/* Mobile: Show right sidebar content below main content */}
      {isMobile && rightSidebar && (
        <div style={{
          padding: '0 12px 100px',
          marginTop: '-60px'
        }}>
          {rightSidebar}
        </div>
      )}
    </>
  );
}

export default Layout;
