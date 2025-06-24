// import React from 'react';
// import './FormHeader.css';

// interface Props {
//   isOnline: boolean;
// }

// const FormHeader: React.FC<Props> = ({ isOnline }) => {
//   return (
//     <div className="header">
//       <span className="headng">Vital Events - Medical Certificate of Cause of Death</span>
//       <div className="rightEnd">
//         <a href="https://icdcdn.who.int/icdapibinaries/icdapi-setup-2.5.0.msi" download>
//           <button className="dashboardBtn">Download & Install ICD-API</button>
//         </a>
//         <a href="/Xproxy.exe" download>
//           <button className="dashboardBtn">Download & Install Proxy Service</button>
//         </a>
//         <span className="internetStatus">ICD-API: Running</span>
//         <span className="internetStatus">Proxy service: Running</span>
//         <span className="internetStatus">
//           <span className={`circle ${isOnline ? 'online' : 'offline'}`}></span>
//           {isOnline ? 'Online' : 'Offline'}
//         </span>
//       </div>
//     </div>
//   );
// };

// export default FormHeader;

import { useEffect, useState } from 'react';
import './FormHeader.css';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import { useServiceConfig } from '../hooks/useServiceConfig';
import { useDhis2Credentials } from '../hooks/useDhis2Credentials';
import Dhis2CredentialsModal from './Dhis2CredentialsModal';

interface Props {
  isOnline: boolean;
}

const FormHeader = ({ isOnline }: Props) => {
  const [icdApiStatus, setIcdApiStatus] = useState<string>('Checking...');
  const [proxyStatus, setProxyStatus] = useState<string>('Checking...');
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const deviceInfo = useDeviceDetection();
  const { config } = useServiceConfig();
  const { saveCredentials, testConnection } = useDhis2Credentials();

  // Check ICD-API status
  const checkIcdApiStatus = async () => {
    try {
      const response = await fetch(config.icdApiUrl);
      if (response.ok || response.status === 200) {
        setIcdApiStatus('Running');
      } else {
        setIcdApiStatus('Stopped');
      }
    } catch (error) {
      setIcdApiStatus('Stopped');
      console.error('ICD-API check failed:', error);
    }
  };

  // Check Proxy service status
  const checkProxyStatus = async () => {
    console.log('Checking proxy status at:', config.proxyApiUrl);
    try {
      const response = await fetch(config.proxyApiUrl);
      console.log('Proxy response status:', response.status, response.ok);
      if (response.ok || response.status === 200) {
        setProxyStatus('Running');
        console.log('Proxy service is running');
      } else {
        setProxyStatus('Stopped');
        console.log('Proxy service stopped - status:', response.status);
      }
    } catch (error) {
      setProxyStatus('Stopped');
      console.error('Proxy service check failed:', error);
    }
  };

  // Check services periodically
  useEffect(() => {
    // Only start checking if we have valid URLs (not the initial empty state)
    if (!config.icdApiUrl || !config.proxyApiUrl) return;

    // Initial check
    checkIcdApiStatus();
    checkProxyStatus();

    // Set up interval for periodic checks (every 30 seconds)
    const intervalId = setInterval(() => {
      checkIcdApiStatus();
      checkProxyStatus();
    }, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [config.icdApiUrl, config.proxyApiUrl]); // Re-check when URLs change

  // Debug function to clear localStorage
  const clearConfig = () => {
    localStorage.removeItem('mccod_service_config');
    window.location.reload();
  };

  return (
    <div className="header">
      <span className="headng">Vital Events - Medical Certificate of Cause of Death</span>
      <div className="rightEnd">
        <a href="https://icdcdn.who.int/icdapibinaries/icdapi-setup-2.5.0.msi" download>
          <button className="dashboardBtn">Download & Install ICD-API</button>
        </a>
        <a href="/Xproxy.exe" download>
          <button className="dashboardBtn">Download & Install Proxy Service</button>
        </a>
        {!config.isTabletMode && (
          <button className="dashboardBtn" onClick={clearConfig} title="Clear cached network settings">
            Reset Network Config
          </button>
        )}
        {config.useDhis2Direct && (
          <button 
            className="dashboardBtn" 
            onClick={() => setShowCredentialsModal(true)}
            title="Update DHIS2 credentials"
          >
            🔐 DHIS2 Settings
          </button>
        )}
        <span className="internetStatus">ICD-API: {icdApiStatus}</span>
        <span className="internetStatus">Proxy service: {proxyStatus}</span>
        <span className="internetStatus">Device: {deviceInfo.deviceType}</span>
        {config.isTabletMode && (
          <span className="internetStatus">Server: {config.serverIp}</span>
        )}
        <span className="internetStatus">
          <span className={`circle ${isOnline ? 'online' : 'offline'}`}></span>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      
      {/* DHIS2 Credentials Modal */}
      <Dhis2CredentialsModal
        isOpen={showCredentialsModal}
        onSave={(credentials) => {
          saveCredentials(credentials);
          setShowCredentialsModal(false);
        }}
        onTest={testConnection}
      />
    </div>
  );
};

export default FormHeader;