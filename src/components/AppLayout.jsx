import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function AppLayout() {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: '#f7fafc',
      position: 'relative'
    }}>
      {/* Fixed Sidebar */}
      <div style={{ 
        position: 'fixed',
        left: 0,
        top: 0,
        width: '280px',
        height: '100vh',
        zIndex: 100
      }}>
        <Sidebar />
      </div>
      
      {/* Main Content Area - 5px gap from sidebar */}
      <div style={{ 
        marginLeft: '280px',
        width: 'calc(100% - 280px)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'flex-start',
        padding: '0'
      }}>
        {/* Content Container - 5px left padding */}
        <div style={{ 
          width: '100%',
          maxWidth: '800px',
          margin: '0',
          padding: '0 20px 0 5px', // 5px left, 20px right
          boxSizing: 'border-box'
        }}>
          <Outlet />
        </div>
        
        {/* Right Empty Space */}
        <div style={{ 
          flex: 1,
          minWidth: '100px',
          background: 'transparent'
        }}>
          {/* Future: ads, widgets, currency converter, live donor feed */}
        </div>
      </div>
    </div>
  );
}

export default AppLayout;