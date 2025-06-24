import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MedFormDeath from './components/MedFormDeath';
import DeviceInfo from './components/DeviceInfo';
import ServerSettings from './components/ServerSettings';
import ServiceConfigManager from './components/ServiceConfigManager';
import Dhis2CredentialsModal from './components/Dhis2CredentialsModal';
import { useInternetStatus } from './hooks/useInternetStatus';
import { useDhis2Credentials } from './hooks/useDhis2Credentials';
import './App.css';

/**
 * Main application component
 */
function App() {
  const isOnline = useInternetStatus();
  const [syncInProgress, setSyncInProgress] = useState(false);
  const { 
    isSetupComplete, 
    isLoading, 
    saveCredentials, 
    testConnection 
  } = useDhis2Credentials();

  // Show loading while checking credentials
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        🔄 Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Online status indicator */}
      <div className="sync-status-indicator" style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        backgroundColor: isOnline ? '#dff0d8' : '#f2dede',
        color: isOnline ? '#3c763d' : '#a94442',
        zIndex: 1000,
      }}>
        {isOnline ? 'Online' : 'Offline'}
        {syncInProgress && ' - Syncing...'}
      </div>
      
      <Routes>
        <Route 
          path="/" 
          element={
            <MedFormDeath 
              isOnline={isOnline} 
              onSyncStateChange={setSyncInProgress} 
            />
          } 
        />
      </Routes>
      
      {/* Service configuration manager - handles syncing server IP across services */}
      <ServiceConfigManager />
      
      {/* Server settings for tablets/mobile devices */}
      <ServerSettings />
      
      {/* Device detection info - can be removed in production */}
      <DeviceInfo />
      
      {/* DHIS2 Credentials Setup Modal */}
      <Dhis2CredentialsModal
        isOpen={!isSetupComplete}
        onSave={saveCredentials}
        onTest={testConnection}
      />
    </BrowserRouter>
  );
}

export default App;